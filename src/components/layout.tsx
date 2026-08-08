import {
  BookOpen,
  CircleHelp,
  Compass,
  Hexagon,
  Layers,
  Library,
  LineChart,
  Menu,
  Route,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { HiveWorkspace } from "./hive/hive-workspace";
import { DeskStage } from "./hive/desk-stage";
import { useHiveDeskStore } from "@/lib/hive-desk-store";

/** Professional product nav only. Meme surfaces: /itshabbening, /meme-village. */
const NAV: {
  href: string;
  label: string;
  icon: typeof Hexagon;
  title: string;
  color: string;
  acr: string;
}[] = [
  { href: "/tutor", label: "Learn", icon: BookOpen, title: "Live session", color: "#2dd4bf", acr: "LRN" },
  { href: "/demo", label: "Samples", icon: Library, title: "Sample lessons", color: "#a78bfa", acr: "SMP" },
  { href: "/library", label: "Library", icon: Library, title: "Training library", color: "#c084fc", acr: "LIB" },
  { href: "/explore", label: "Industries", icon: Compass, title: "Industries", color: "#60a5fa", acr: "IND" },
  { href: "/skills", label: "Tools", icon: Layers, title: "Thinking tools", color: "#fbbf24", acr: "THK" },
  { href: "/progress", label: "Progress", icon: LineChart, title: "Progress", color: "#4ade80", acr: "PRG" },
  { href: "/path", label: "Path", icon: Route, title: "Your path", color: "#f472b6", acr: "PTH" },
  { href: "/help", label: "Help", icon: CircleHelp, title: "How to use", color: "#94a3b8", acr: "HLP" },
  {
    href: "/labs/cad",
    label: "Plan Lab",
    icon: Layers,
    title: "Plan Lab · MAC + PartMode",
    color: "#38bdf8",
    acr: "CAD",
  },
];

/**
 * Desk iframes load routes with ?surface=desk.
 * Must be true on FIRST paint (SSR + client).
 */
function useDeskSurface(): boolean {
  const location = useRouterState({ select: (s) => s.location });

  const searchObj = location.search as Record<string, unknown> | undefined;
  if (searchObj && typeof searchObj === "object" && searchObj.surface === "desk") {
    return true;
  }

  const href = String((location as { href?: string }).href ?? "");
  if (href.includes("surface=desk")) return true;

  const searchStr = String((location as { searchStr?: string }).searchStr ?? "");
  if (searchStr.includes("surface=desk")) return true;

  if (typeof window !== "undefined") {
    try {
      if (new URLSearchParams(window.location.search).get("surface") === "desk") {
        return true;
      }
    } catch {
      /* ignore */
    }
  }

  return false;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const deskSurface = useDeskSurface();
  const [open, setOpen] = useState(false);
  const desks = useHiveDeskStore((s) => s.desks);

  // Drop legacy desk storage that crashed after tabs→href migration
  useEffect(() => {
    try {
      localStorage.removeItem("grok-tutor-hive-desks-v1");
    } catch {
      /* ignore */
    }
  }, []);

  // Embed mode — only the selected route content (desk iframes)
  if (deskSurface) {
    return (
      <div className="tutor-desk-embed min-h-dvh bg-bg text-fg">{children}</div>
    );
  }

  const isHiveHome = pathname === "/";

  function go(href: string) {
    setOpen(false);
    // Full-page navigation (desks still open from comb clicks on The Hive)
    void navigate({ to: href as any });
  }

  const topbar = (
    <header className={cn("tutor-topbar", !isHiveHome && "tutor-topbar-page")}>
      <div className="tutor-topbar-inner">
        <button
          type="button"
          className="tutor-topbar-brand text-left"
          onClick={() => go("/")}
          title="Grok Tutor · The Hive"
        >
          <span className="tutor-topbar-logo">
            <Hexagon className="h-4 w-4 text-teal" />
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-tight">
              Grok Tutor · The Hive
            </span>
            <span className="block text-[11px] text-subtle leading-none">
              Craft learning · Plan Lab · library
            </span>
          </span>
        </button>

        <nav className="hidden lg:flex items-center gap-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <button
                key={item.href}
                type="button"
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm transition-colors",
                  active
                    ? "bg-elevated text-fg"
                    : "text-muted hover:text-fg hover:bg-elevated/70",
                )}
                onClick={() => go(item.href)}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden md:inline-flex text-[11px] text-subtle hover:text-muted px-1.5 transition-colors"
            title="Third-party credits & lineage"
            onClick={() => go("/credits")}
          >
            Credits
          </button>
          <Button
            size="sm"
            variant="teal"
            className="hidden sm:inline-flex"
            onClick={() => go("/tutor")}
          >
            Live session
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="lg:hidden border-t border-border/60 bg-surface/95 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md">
          <div className="flex flex-col gap-0.5 max-h-[min(70dvh,28rem)] overflow-y-auto">
            <button
              type="button"
              className="flex h-12 items-center gap-2 rounded-lg px-3 text-sm text-muted hover:bg-elevated hover:text-fg"
              onClick={() => go("/")}
            >
              <Hexagon className="h-4 w-4" />
              Hive home
            </button>
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  type="button"
                  className="flex h-12 items-center gap-2 rounded-lg px-3 text-sm text-muted hover:bg-elevated hover:text-fg"
                  onClick={() => go(item.href)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
            <button
              type="button"
              className="flex h-12 items-center gap-2 rounded-lg px-3 text-sm text-muted hover:bg-elevated hover:text-fg"
              onClick={() => go("/credits")}
            >
              Credits
            </button>
            <button
              type="button"
              className="flex h-12 items-center gap-2 rounded-lg px-3 text-sm font-medium text-teal hover:bg-elevated"
              onClick={() => go("/tutor")}
            >
              Live session
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );

  // ── Hive home: 3D workspace + optional floating desks from comb clicks ──
  if (isHiveHome) {
    return (
      <div
        className={cn(
          "tutor-immersive tutor-galaxy-skin",
          desks.length > 0 && "has-desks",
        )}
      >
        <div className="tutor-galaxy-layer is-global" aria-hidden />
        <div className="tutor-hive-layer is-hero">
          <HiveWorkspace />
        </div>
        <DeskStage />
        {topbar}
        <main className="sr-only">
          <h1>Grok Tutor · The Hive</h1>
          <p>Craft learning workspace. Use the top navigation for full pages.</p>
          <ul>
            {NAV.map((n) => (
              <li key={n.href}>
                <Link to={n.href as any}>{n.title}</Link>
              </li>
            ))}
          </ul>
        </main>
      </div>
    );
  }

  // ── Full pages: real scrollable content (no desk redirect, no hidden main) ──
  return (
    <div className="tutor-page-shell tutor-galaxy-skin min-h-dvh bg-bg text-fg flex flex-col">
      <div className="tutor-galaxy-layer is-global is-page" aria-hidden />
      {topbar}
      <main className="tutor-page-main flex-1 w-full relative z-[1]">{children}</main>
    </div>
  );
}
