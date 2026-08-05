import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Layers, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { demoStats, industryDemoIndex, MODE_META } from "@/lib/demo-lessons";
import { SECTORS } from "@/lib/industries";

export const Route = createFileRoute("/demo/")({
  component: DemoIndexPage,
});

function DemoIndexPage() {
  const stats = demoStats();
  const groups = industryDemoIndex();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="max-w-3xl">
        <Badge variant="teal" className="mb-3">
          Full simulation library
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Sample lessons</h1>
        <p className="mt-2 text-muted leading-relaxed">
          Full simulated sessions for every industry and every learning mode. Trades use real
          jobsite talk — super, foreman, holds, handoffs, short status updates — not textbook
          jargon. Review tone and accuracy before you run a live lesson.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Industries", value: String(stats.industries) },
          { label: "Modes each", value: String(stats.modes) },
          { label: "Full lessons", value: String(stats.lessons) },
          { label: "Dialogue turns", value: String(stats.turns) },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-3"
          >
            <div className="text-2xl font-semibold tabular-nums tracking-tight">{s.value}</div>
            <div className="text-xs text-subtle mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {MODE_META.map((m) => (
          <Badge key={m.id} variant="outline">
            {m.label}
          </Badge>
        ))}
        <Badge variant="teal">
          <Layers className="h-3 w-3 mr-1" /> Field-style for trades
        </Badge>
      </div>

      <div className="mt-10 space-y-10">
        {SECTORS.map((sector) => {
          const rows = groups.filter((g) => g.industry.sector === sector.id);
          if (!rows.length) return null;
          return (
            <section key={sector.id}>
              <h2 className="text-sm font-medium text-subtle uppercase tracking-wide mb-3">
                {sector.label}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {rows.map(({ industry, lessons }) => (
                  <Card key={industry.id} className="hover:border-border-strong transition-colors">
                    <CardHeader className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{industry.name}</CardTitle>
                        {industry.safetyFirst ? (
                          <Badge variant="warn" className="shrink-0">
                            Safety first
                          </Badge>
                        ) : null}
                      </div>
                      <CardDescription className="mt-1.5">{industry.blurb}</CardDescription>
                      <p className="text-xs text-subtle mt-2">
                        {lessons.length} lessons · {industry.topics.slice(0, 3).join(" · ")}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="teal">
                          <Link to="/demo/$industryId" params={{ industryId: industry.id }}>
                            <Play className="h-3.5 w-3.5" /> Browse lessons
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link to="/tutor" search={{ industry: industry.id }}>
                            <BookOpen className="h-3.5 w-3.5" /> Open in Learn
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
