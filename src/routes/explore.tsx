import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { INDUSTRIES, SECTORS, type IndustrySector } from "@/lib/industries";
import { AOS_SKILLS } from "@/lib/aos-skills";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/explore")({
  component: ExplorePage,
});

function ExplorePage() {
  const [q, setQ] = useState("");
  const [sector, setSector] = useState<IndustrySector | "all">("all");

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return INDUSTRIES.filter((i) => {
      if (sector !== "all" && i.sector !== sector) return false;
      if (!query) return true;
      return (
        i.name.toLowerCase().includes(query) ||
        i.blurb.toLowerCase().includes(query) ||
        i.topics.some((t) => t.toLowerCase().includes(query))
      );
    });
  }, [q, sector]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Industries & trades</h1>
        <p className="mt-2 text-muted">
          {INDUSTRIES.length} fields you can learn here. Open a live lesson or review full sample
          transcripts for each one.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search fields and topics…"
            className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface pl-10 pr-3 text-sm text-fg placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-teal)_40%,transparent)]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSector("all")}
            className={cn(
              "h-9 rounded-full border px-3 text-xs font-medium transition-colors",
              sector === "all"
                ? "border-teal/40 bg-[color-mix(in_oklab,var(--color-teal)_14%,transparent)] text-teal"
                : "border-border text-muted hover:text-fg",
            )}
          >
            All
          </button>
          {SECTORS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSector(s.id)}
              className={cn(
                "h-9 rounded-full border px-3 text-xs font-medium transition-colors",
                sector === s.id
                  ? "border-teal/40 bg-[color-mix(in_oklab,var(--color-teal)_14%,transparent)] text-teal"
                  : "border-border text-muted hover:text-fg",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-xs text-subtle tabular-nums">{list.length} results</p>

      <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((ind) => (
          <div
            key={ind.id}
            className="rounded-[var(--radius-xl)] border border-border bg-surface p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold tracking-tight">{ind.name}</h2>
              {ind.safetyFirst ? (
                <Badge variant="warn" className="shrink-0">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Safety first
                </Badge>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-muted leading-relaxed">{ind.blurb}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {ind.topics.slice(0, 3).map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-subtle">
              Companions:{" "}
              {ind.aosAffinity
                .slice(0, 2)
                .map((id) => AOS_SKILLS.find((s) => s.id === id)?.name ?? id)
                .join(" · ")}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="teal">
                <Link to="/tutor" search={{ industry: ind.id }}>
                  Learn
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/demo/$industryId" params={{ industryId: ind.id }}>
                  Samples
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
