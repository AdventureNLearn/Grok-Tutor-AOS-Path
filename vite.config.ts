import type { Plugin } from "vite";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

/**
 * Finish PGLite bootstrap during dev-server setup (before traffic). Vite awaits
 * async `configureServer` hooks. Production: `src/lib/db` kicks `ensureDbReady`
 * on import.
 */
function pgliteBootstrapPlugin(): Plugin {
  return {
    name: "app-builder:pglite-bootstrap",
    apply: "serve",
    // Non-blocking: awaiting PGLite here wedged the dev server under load
    // (LISTEN + SSR "connected" but HTTP never completes). Warm DB in background.
    configureServer(server) {
      void (async () => {
        try {
          const mod = (await server.ssrLoadModule("/src/lib/db.ts")) as {
            ensureDbReady?: () => Promise<void>;
          };
          if (typeof mod.ensureDbReady === "function") {
            await mod.ensureDbReady();
            console.log("[app-builder] PGLite bootstrap ready (background)");
          }
        } catch (err) {
          console.error("[app-builder] DB bootstrap failed (non-fatal):", err);
        }
      })();
    },
  };
}

/** /soak/ → /soak/index.html so log + product can both live on same host */
function soakIndexPlugin(): Plugin {
  return {
    name: "app-builder:soak-index",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathOnly = (req.url ?? "").split("?", 1)[0] ?? "";
        if (pathOnly === "/soak" || pathOnly === "/soak/") {
          res.statusCode = 302;
          res.setHeader("Location", "/soak/index.html");
          res.end();
          return;
        }
        next();
      });
    },
  };
}

/**
 * Live-preview OAuth popup — handled HERE so the agent never has to create a
 * `/auth/popup` route (and cannot break it by scaffolding a React page that
 * paints the full app shell in the popup).
 *
 * `signIn` (client.ts) opens `/auth/popup?providerId=…` in a top-level window.
 * This middleware runs before TanStack Start, calls `handleAuthPopupRequest`,
 * and returns the 302 / completion HTML. Deployed apps do not use the popup
 * (full-page OAuth redirect), so `apply: "serve"` is enough.
 */
function authPopupPlugin(): Plugin {
  return {
    name: "app-builder:auth-popup",
    apply: "serve",
    configureServer(server) {
      // Register immediately (not in a returned post-hook) so we run BEFORE
      // TanStack Start / the SPA HTML fallback. A model-authored
      // `src/routes/auth/popup.tsx` React page must never win this path.
      server.middlewares.use(async (req, res, next) => {
        try {
          const rawUrl = req.url ?? "";
          const pathOnly = rawUrl.split("?", 1)[0] ?? "";
          if (pathOnly !== "/auth/popup") {
            next();
            return;
          }
          if ((req.method ?? "GET").toUpperCase() !== "GET") {
            res.statusCode = 405;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end("Method Not Allowed");
            return;
          }

          const host = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost:8080");
          const proto = String(
            req.headers["x-forwarded-proto"] ??
              ((req.socket as { encrypted?: boolean } | undefined)?.encrypted ? "https" : "http"),
          );
          const requestHeaders = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (value === undefined) continue;
            if (Array.isArray(value)) {
              for (const v of value) requestHeaders.append(key, v);
            } else {
              requestHeaders.set(key, value);
            }
          }
          // Ensure Host is the public preview host so Better Auth's dynamic
          // baseURL / redirect_uri match the popup origin.
          if (!requestHeaders.has("host")) requestHeaders.set("host", host);

          const request = new Request(`${proto}://${host}${rawUrl}`, {
            method: "GET",
            headers: requestHeaders,
          });

          const mod = (await server.ssrLoadModule("/src/lib/auth/popup.server.ts")) as {
            handleAuthPopupRequest: (req: Request) => Promise<Response>;
          };
          const response = await mod.handleAuthPopupRequest(request);

          res.statusCode = response.status;
          // Preserve multiple Set-Cookie headers (OAuth state + session).
          const setCookies =
            typeof response.headers.getSetCookie === "function"
              ? response.headers.getSetCookie()
              : [];
          response.headers.forEach((value, key) => {
            if (key.toLowerCase() === "set-cookie") return;
            res.setHeader(key, value);
          });
          for (const cookie of setCookies) {
            res.appendHeader("set-cookie", cookie);
          }
          const body = Buffer.from(await response.arrayBuffer());
          res.end(body);
        } catch (err) {
          console.error("[app-builder] /auth/popup handler failed:", err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end("auth popup failed");
          }
        }
      });
    },
  };
}

// Local Tutor default **8085** — leave 8080 for Local Qwen (AOS port law).
// Grok Build sandbox may still inject 8080 in cloud previews; override with --port.
// Keep `nitro` gated to `build` (the Vercel deploy target): enabled in dev it
// opens a second dev-server port, which breaks the single-port preview.
export default defineConfig(({ command }) => ({
  // Slim static roots — never use full `public/` (multi-M corpus OOMs Vite / bloated deploys).
  // Dev: public-dev · Release build: public-release · Corpus stays on disk for offline pipelines only.
  publicDir:
    command === "serve"
      ? "public-dev"
      : process.env.TUTOR_PUBLIC_DIR || "public-release",
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT || process.env.TUTOR_PORT || 8085),
    strictPort: true,
    // Never watch overnight corpus / sim dumps.
    watch: {
      ignored: [
        "**/public/corpus/**",
        "**/public/soak/**",
        "**/public-dev/**",
        "**/public-release/**",
        "**/scripts/sim-output/**",
        "**/node_modules/**",
        "**/.git/**",
        "**/archives/**",
      ],
    },
    // Block accidental FS reads into corpus during transform (OOM / hang).
    fs: {
      deny: [
        "**/public/corpus/**",
        "**/scripts/sim-output/**",
      ],
    },
  },
  // Tailwind + CSS must not block forever; sourcemaps optional in local explore.
  css: {
    devSourcemap: false,
  },
  // Dep optimizer must NOT block client CSS/JS. Custom entries globs previously
  // wedged the server (LISTEN + SSR HTML only — browser looks "not our UI").
  // holdUntilCrawlEnd:false serves modules while deps finish; noDiscovery skips
  // the long crawl that hung after reboot on this host.
  optimizeDeps: {
    holdUntilCrawlEnd: false,
    // Skip cold crawl — only prebundle packages we know are CJS / heavy.
    // Native ESM deps load directly so CSS/JS hydrate immediately.
    // CRITICAL: three's OrbitControls is a separate entry — without it in
    // include, 3D dynamic import 404s and Hive never leaves Map.
    noDiscovery: true,
    include: [
      "react",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-dom",
      "react-dom/client",
      "@tanstack/react-router",
      "@tanstack/react-start",
      "@tanstack/react-query",
      "clsx",
      "tailwind-merge",
      "class-variance-authority",
      "lucide-react",
      "zod",
      "three",
      "three/examples/jsm/controls/OrbitControls.js",
      "sonner",
    ],
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    pgliteBootstrapPlugin(),
    // Before tanstackStart so /auth/popup never falls through to the SPA.
    authPopupPlugin(),
    // /soak/ log page (same origin as product — dual-tab observe)
    soakIndexPlugin(),
    tailwindcss(),
    tanstackStart(),
    ...(command === "build" ? [nitro({ preset: "vercel" })] : []),
    viteReact(),
  ],
}));
