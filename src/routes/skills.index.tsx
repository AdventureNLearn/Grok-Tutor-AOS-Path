import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import {
  AOS_SKILLS,
  AOS_SOURCE,
  SKILL_CATEGORIES,
  type SkillCategory,
} from "@/lib/aos-skills";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/skills/")({
  component: SkillsPage,
});

function SkillsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<SkillCategory | "all">("all");

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return AOS_SKILLS.filter((s) => {
      if (!s.tutorEnabled) return false;
      if (cat !== "all" && s.category !== cat) return false;
      if (!query) return true;
      return (
        s.name.toLowerCase().includes(query) ||
        s.purpose.toLowerCase().includes(query) ||
        s.tutorRole.toLowerCase().includes(query) ||
        s.goodFor.some((g) => g.toLowerCase().includes(query))
      );
    });
  }, [q, cat]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Thinking tools</h1>
        <p className="mt-2 text-muted leading-relaxed">
          Turn these on during a lesson when you want a stronger habit — checking evidence,
          reading public stories carefully, navigating civic work, or practicing like a
          professional. Grouped by how they help you learn.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <a href={AOS_SOURCE.url} target="_blank" rel="noreferrer">
            Full Adventure OS library <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href={AOS_SOURCE.publicUrl} target="_blank" rel="noreferrer">
            Public civic frameworks
          </a>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href={AOS_SOURCE.lpinUrl} target="_blank" rel="noreferrer">
            LPIN field tools
          </a>
        </Button>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SKILL_CATEGORIES.map((c) => {
          const count = AOS_SKILLS.filter((s) => s.category === c.id && s.tutorEnabled).length;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              className={cn(
                "text-left rounded-[var(--radius-xl)] border p-4 transition-colors",
                cat === c.id
                  ? "border-teal/40 bg-[color-mix(in_oklab,var(--color-teal)_10%,var(--color-surface))]"
                  : "border-border bg-surface hover:border-border-strong",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold text-sm tracking-tight">{c.label}</h2>
                <span className="text-xs tabular-nums text-subtle">{count}</span>
              </div>
              <p className="mt-1.5 text-xs text-muted leading-relaxed">{c.summary}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-8 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or what it helps with…"
          className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface pl-10 pr-3 text-sm placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-teal)_40%,transparent)]"
        />
      </div>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setCat("all")}
          className={cn(
            "text-xs px-2 py-1 rounded-full border",
            cat === "all" ? "border-teal/40 text-teal" : "border-border text-muted",
          )}
        >
          All groups
        </button>
        <span className="text-xs text-subtle tabular-nums">{list.length} tools</span>
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-3">
        {list.map((s) => (
          <Link
            key={s.id}
            to="/skills/$skillId"
            params={{ skillId: s.id }}
            className="rounded-[var(--radius-xl)] border border-border bg-surface p-5 hover:border-border-strong transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold tracking-tight">{s.name}</h3>
                <p className="text-[11px] text-subtle mt-0.5">{s.purpose}</p>
              </div>
              <Badge variant="teal" className="shrink-0">
                {s.tierLabel}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-muted leading-relaxed">{s.tutorRole}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {s.goodFor.slice(0, 3).map((g) => (
                <Badge key={g}>{g}</Badge>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
