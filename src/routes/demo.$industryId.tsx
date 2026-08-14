import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SimpleMarkdown } from "@/components/markdown";
import {
  lessonsForIndustry,
  MODE_META,
  type DemoLesson,
} from "@/lib/demo-lessons";
import { getIndustry } from "@/lib/industries";
import { catalogMayListIndustry } from "@/lib/no-demo-catalog-from-hive";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/demo/$industryId")({
  loader: ({ params }) => {
    const industry = getIndustry(params.industryId);
    const lessons = lessonsForIndustry(params.industryId);
    if (!industry || !lessons.length || !catalogMayListIndustry(params.industryId)) {
      throw notFound();
    }
    return { industry, lessons };
  },
  component: DemoIndustryPage,
});

function DemoIndustryPage() {
  const { industry, lessons } = Route.useLoaderData();
  const [mode, setMode] = useState(lessons[0]?.mode ?? "explain");
  const lesson = useMemo(
    () => lessons.find((l) => l.mode === mode) ?? lessons[0],
    [lessons, mode],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/demo">
          <ArrowLeft className="h-3.5 w-3.5" /> All sample lessons
        </Link>
      </Button>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="teal">Sample lesson</Badge>
            {industry.safetyFirst ? <Badge variant="warn">Safety first</Badge> : null}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{industry.name}</h1>
          <p className="mt-2 text-muted max-w-2xl leading-relaxed">{industry.blurb}</p>
          <p className="mt-2 text-xs text-subtle">
            Topics covered: {industry.topics.join(" · ")}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/tutor" search={{ industry: industry.id }}>
            <BookOpen className="h-3.5 w-3.5" /> Continue in Learn
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-4 items-start">
        <aside className="rounded-[var(--radius-xl)] border border-border bg-surface p-3 lg:sticky lg:top-20 space-y-1">
          <div className="text-xs font-medium text-subtle uppercase tracking-wide px-2 py-1">
            Learning modes
          </div>
          {MODE_META.map((m) => {
            const l = lessons.find((x) => x.mode === m.id);
            if (!l) return null;
            const on = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={cn(
                  "w-full text-left rounded-[var(--radius-md)] px-3 py-2.5 text-sm transition-colors",
                  on
                    ? "bg-[color-mix(in_oklab,var(--color-teal)_14%,transparent)] text-teal border border-teal/30"
                    : "text-muted hover:bg-elevated/60 hover:text-fg border border-transparent",
                )}
              >
                <div className="font-medium">{m.label}</div>
                <div className="text-[11px] text-subtle mt-0.5 line-clamp-1">{l.topic}</div>
              </button>
            );
          })}
          <div className="pt-3 px-2 border-t border-border mt-2">
            <p className="text-[11px] text-subtle leading-relaxed">
              Written for beginners. Every mode uses craft-specific content for this industry — not a shared template.
            </p>
          </div>
        </aside>

        {lesson ? <LessonTranscript lesson={lesson} /> : null}
      </div>
    </div>
  );
}

function LessonTranscript({ lesson }: { lesson: DemoLesson }) {
  return (
    <section className="rounded-[var(--radius-xl)] border border-border bg-surface flex flex-col min-h-[min(70dvh,800px)]">
      <div className="border-b border-border px-4 py-3 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold tracking-tight">{lesson.modeLabel}</span>
          <Badge variant="outline" className="capitalize">
            {lesson.level}
          </Badge>
          <Badge>{lesson.topic}</Badge>
        </div>
        <p className="text-xs text-muted leading-relaxed flex items-start gap-1.5">
          <Target className="h-3.5 w-3.5 text-teal shrink-0 mt-0.5" />
          {lesson.summary}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {lesson.turns.map((t, i) => (
          <div
            key={`${lesson.id}-${i}`}
            className={cn("flex", t.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[min(100%,640px)] rounded-[var(--radius-lg)] px-3.5 py-2.5 text-sm",
                t.role === "user"
                  ? "bg-elevated border border-border text-fg"
                  : "bg-bg border border-border",
              )}
            >
              <div className="text-[10px] uppercase tracking-wide text-subtle mb-1.5">
                {t.role === "user" ? "Learner" : "Tutor"}
              </div>
              {t.role === "assistant" ? (
                <SimpleMarkdown text={t.content} />
              ) : (
                <p className="leading-relaxed whitespace-pre-wrap">{t.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border px-4 py-3 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="teal">
          <Link
            to="/tutor"
            search={{
              industry: lesson.industryId,
            }}
          >
            Try this live in Learn
          </Link>
        </Button>
      </div>
    </section>
  );
}
