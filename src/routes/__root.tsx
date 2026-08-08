import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { CreatedWithGrokBanner } from "@/components/created-with-grok-banner";
import { AppShell } from "@/components/layout";
import { Toaster } from "sonner";
import appCss from "@/styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Grok Tutor" },
      {
        name: "description",
        content:
          "Craft and professional tutoring with The Hive, sample lessons, live sessions, and thinking tools — evidence, practice, and safety-first learning.",
      },
      { property: "og:title", content: "Grok Tutor" },
      {
        property: "og:description",
        content: "Learn a craft with Grok Tutor and The Hive — samples, live sessions, and thinking tools.",
      },
      { name: "theme-color", content: "#05060a" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  component: RootComponent,
});

function useIsDeskSurface(): boolean {
  const location = useRouterState({ select: (s) => s.location });
  const searchObj = location.search as Record<string, unknown> | undefined;
  if (searchObj && typeof searchObj === "object" && searchObj.surface === "desk") {
    return true;
  }
  const href = String((location as { href?: string }).href ?? "");
  if (href.includes("surface=desk")) return true;
  if (typeof window !== "undefined") {
    try {
      return new URLSearchParams(window.location.search).get("surface") === "desk";
    } catch {
      return false;
    }
  }
  return false;
}

function RootComponent() {
  const deskSurface = useIsDeskSurface();

  return (
    <RootDocument>
      {!deskSurface ? <CreatedWithGrokBanner /> : null}
      <AppShell>
        <Outlet />
      </AppShell>
      {!deskSurface ? (
        <Toaster theme="dark" position="bottom-right" richColors closeButton />
      ) : null}
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
