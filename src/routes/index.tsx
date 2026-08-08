import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  Layers,
  Route as RouteIcon,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { INDUSTRIES } from "@/lib/industries";
import { AOS_SKILLS, AOS_SOURCE, SKILL_CATEGORIES } from "@/lib/aos-skills";
import { demoStats } from "@/lib/demo-lessons";

export const Route = createFileRoute("/")({
  // Visual home is the 3D Tutor Hive in AppShell; this page is SEO + no-JS fallback.
  component: HomePage,
});

function HomePage() {
  const enabled = AOS_SKILLS.filter((s) => s.tutorEnabled).length;
  const popular = INDUSTRIES.slice(0, 6);
  const demos = demoStats();

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in oklab, var(--color-teal) 18%, transparent), transparent)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="teal">Live prototype</Badge>
            <Badge>Real trades · Real professions · Honest thinking</Badge>
          </div>
          <h1 className="max-w-3xl text-balance text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.08]">
            Learn a craft with a tutor that prioritizes evidence and practice.
          </h1>
          <p className="mt-5 max-w-2xl text-muted text-lg leading-relaxed">
            From electrical and HVAC to nursing, software, and public information literacy — learn
            the way a good mentor teaches: clear explanations, practice that sticks, and thinking
            tools that keep claims honest when the stakes are high.
          </p>
          <p className="mt-3 max-w-2xl text-sm text-subtle leading-relaxed">
            Browse{" "}
            <Link to="/demo" className="text-teal underline-offset-2 hover:underline">
              {demos.lessons} sample lessons
            </Link>{" "}
            across every industry, open Learn for a live session, or return to{" "}
            <Link to="/" className="text-teal underline-offset-2 hover:underline">
              The Hive
            </Link>
            .
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="teal">
              <Link to="/tutor">
                Start learning
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/demo">Browse sample lessons</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/skills">Thinking tools</Link>
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Industries", value: String(INDUSTRIES.length) },
              { label: "Sample lessons", value: String(demos.lessons) },
              { label: "Thinking tools", value: String(enabled) },
              { label: "Ways to learn", value: "6" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-[var(--radius-lg)] border border-border bg-surface/80 px-4 py-3"
              >
                <div className="text-2xl font-semibold tabular-nums tracking-tight">{stat.value}</div>
                <div className="text-xs text-subtle mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">How learning works here</h2>
            <p className="text-sm text-muted mt-1">Three simple parts. One honest standard.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <BookOpen className="h-5 w-5 text-teal mb-2" />
              <CardTitle>1. A real tutoring session</CardTitle>
              <CardDescription>
                Pick your field, level, and style — explain, Socratic, practice, quiz, on-the-job,
                or career path. Safety comes first in the trades.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Layers className="h-5 w-5 text-teal mb-2" />
              <CardTitle>2. Thinking tools you can turn on</CardTitle>
              <CardDescription>
                Attach habits like Evidence Check or Four-Role Team when you want stricter judgment —
                careful methods taught for learning.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <RouteIcon className="h-5 w-5 text-teal mb-2" />
              <CardTitle>3. Full sample library</CardTitle>
              <CardDescription>
                {demos.lessons} simulated multi-turn lessons so you can review tone and quality
                before you start a live session.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Popular starting points</h2>
              <p className="text-sm text-muted mt-1">
                Jump into a field — or open its full sample lesson set.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/demo">
                  All samples <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/explore">
                  All industries <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {popular.map((ind) => (
              <div
                key={ind.id}
                className="rounded-[var(--radius-xl)] border border-border bg-bg p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold tracking-tight">{ind.name}</h3>
                  {ind.safetyFirst ? (
                    <Badge variant="warn">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Safety first
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-muted leading-relaxed">{ind.blurb}</p>
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
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-[1.2fr_1fr]">
            <CardHeader className="p-6 sm:p-8">
              <Sparkles className="h-5 w-5 text-teal mb-3" />
              <CardTitle className="text-xl">What this tutor is built for</CardTitle>
              <CardDescription className="text-base mt-2">
                Classrooms, shops, clinics, and desks. Clear thinking, civic literacy,
                professional craft, and safety-first trade learning — with tools you can turn on
                when you want more rigor. This app is the live prototype.
              </CardDescription>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild variant="teal">
                  <Link to="/demo">Review sample lessons</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/skills">See thinking tools</Link>
                </Button>
                <Button asChild variant="ghost">
                  <a href={AOS_SOURCE.originalTutorRef} target="_blank" rel="noreferrer">
                    Earlier build (reference) <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="bg-elevated/50 border-t md:border-t-0 md:border-l border-border p-6 sm:p-8 flex flex-col justify-center gap-3">
              <div className="text-xs uppercase tracking-wider text-subtle">Tool groups</div>
              <ul className="space-y-2 text-sm text-muted">
                {SKILL_CATEGORIES.map((c) => (
                  <li key={c.id} className="flex gap-2">
                    <span className="text-teal shrink-0">·</span>
                    <span>
                      <span className="text-fg font-medium">{c.label}</span> — {c.summary}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </div>
        </Card>
      </section>
    </div>
  );
}
