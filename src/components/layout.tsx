import {
  BookOpen,
  Compass,
  GraduationCap,
  Layers,
  Library,
  LineChart,
  Menu,
  Route,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { AOS_SOURCE } from "@/lib/aos-skills";
import { Button } from "./ui/button";

const NAV: { to: string; label: string; icon: typeof GraduationCap }[] = [
  { to: "/", label: "Home", icon: GraduationCap },
  { to: "/explore", label: "Industries", icon: Compass },
  { to: "/tutor", label: "Learn", icon: BookOpen },
  { to: "/demo", label: "Samples", icon: Library },
  { to: "/skills", label: "Thinking tools", icon: Layers },
  { to: "/progress", label: "Progress", icon: LineChart },
  { to: "/path", label: "Get started", icon: Route },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-[color-mix(in_oklab,var(--color-bg)_92%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <Link to={"/" as any} className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-border bg-elevated">
              <GraduationCap className="h-4 w-4 text-teal" />
            </span>
            <span className="truncate">
              <span className="block text-sm font-semibold tracking-tight">Grok Tutor</span>
              <span className="block text-[11px] text-subtle leading-none">
                Live prototype · craft learning
              </span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname === item.to || pathname.startsWith(item.to + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to as any}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 text-sm transition-colors",
                    active
                      ? "bg-elevated text-fg"
                      : "text-muted hover:text-fg hover:bg-elevated/70",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="teal" className="hidden sm:inline-flex">
              <Link to="/tutor">Start learning</Link>
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
          <div className="lg:hidden border-t border-border bg-surface px-3 py-2">
            <div className="flex flex-col gap-0.5">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active =
                  item.to === "/"
                    ? pathname === "/"
                    : pathname === item.to || pathname.startsWith(item.to + "/");
                return (
                  <Link
                    key={item.to}
                    to={item.to as any}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex h-11 items-center gap-2 rounded-[var(--radius-sm)] px-3 text-sm",
                      active ? "bg-elevated text-fg" : "text-muted",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                to="/tutor"
                onClick={() => setOpen(false)}
                className="mt-1 flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-teal text-accent-fg text-sm font-semibold"
              >
                Start learning
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between text-sm text-subtle">
          <p>Grok Tutor live prototype — craft learning with thinking tools.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link to="/demo" className="hover:text-fg transition-colors">
              Sample lessons
            </Link>
            <Link to="/path" className="hover:text-fg transition-colors">
              Get started
            </Link>
            <Link to="/get-yours" className="hover:text-fg transition-colors">
              Get your own
            </Link>
            <a
              className="hover:text-fg transition-colors"
              href={AOS_SOURCE.url}
              target="_blank"
              rel="noreferrer"
            >
              Adventure OS library
            </a>
            <a
              className="hover:text-fg transition-colors"
              href={AOS_SOURCE.originalTutorRef}
              target="_blank"
              rel="noreferrer"
            >
              Earlier build (reference)
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
