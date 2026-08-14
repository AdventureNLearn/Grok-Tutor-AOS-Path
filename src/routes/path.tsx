import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Pause, Play, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHiveEditStore } from "@/lib/hive-edit-store";
import {
  FROZEN_HABITS,
  HABIT_LINES,
  existingSampleById,
  existingSampleLessons,
  getLearnerLens,
  waveShapeForLens,
} from "@/lib/suite-rooms";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/path")({
  component: PathPage,
});

function PathPage() {
  const navigate = useNavigate();
  const play = useHiveEditStore((s) => s.playOrchestration);
  const phaseIndex = useHiveEditStore((s) => s.phaseIndex);
  const attachedLensId = useHiveEditStore((s) => s.attachedLensId);
  const activeLessonId = useHiveEditStore((s) => s.activeLessonId);
  const setPlayOrchestration = useHiveEditStore((s) => s.setPlayOrchestration);
  const setEditMode = useHiveEditStore((s) => s.setEditMode);
  const setShape = useHiveEditStore((s) => s.setShape);
  const setPhaseIndex = useHiveEditStore((s) => s.setPhaseIndex);
  const nextPhase = useHiveEditStore((s) => s.nextPhase);
  const setActiveLessonId = useHiveEditStore((s) => s.setActiveLessonId);

  const lesson = existingSampleById(activeLessonId) ?? existingSampleLessons()[0];
  const lens = getLearnerLens(attachedLensId);
  const habit = FROZEN_HABITS[Math.min(phaseIndex, FROZEN_HABITS.length - 1)]!;

  function playPair() {
    if (lesson) setActiveLessonId(lesson.id);
    setEditMode(false);
    setShape(waveShapeForLens(attachedLensId));
    setPhaseIndex(0);
    setPlayOrchestration(true);
    void navigate({ to: "/" });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10" data-testid="suite-path">
      <h1 className="text-3xl font-semibold tracking-tight">Path</h1>
      <p className="mt-2 text-muted leading-relaxed">
        Play reasoning you can walk. Align → check → practice → deliver. The hive lights the
        path. You do not sculpt the graph.
      </p>

      <div className="mt-6 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <p className="text-xs font-medium text-subtle uppercase tracking-wide">This sitting</p>
        <p className="mt-2 text-sm">
          <span className="text-subtle">Lesson · </span>
          {lesson ? lesson.title : "Pick a sample comb on the hive first."}
        </p>
        <p className="mt-1 text-sm">
          <span className="text-subtle">Lens · </span>
          {lens ? lens.name : "None — honeycomb walk. Attach one in Tools, or none."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="teal" onClick={playPair}>
            {play ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {play ? "Playing on the hive" : "Play this lesson through this lens"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => nextPhase(FROZEN_HABITS.length)}
          >
            <SkipForward className="h-3.5 w-3.5" />
            Next phase
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link to="/skills">Tools</Link>
          </Button>
        </div>
      </div>

      <ol className="mt-8 space-y-3">
        {FROZEN_HABITS.map((name, i) => {
          const on = i === phaseIndex;
          return (
            <li
              key={name}
              className={cn(
                "rounded-[var(--radius-xl)] border px-4 py-3",
                on
                  ? "border-teal/40 bg-[color-mix(in_oklab,var(--color-teal)_10%,var(--color-surface))]"
                  : "border-border bg-surface",
              )}
            >
              <div className="text-xs font-medium text-teal uppercase tracking-wide">
                {i + 1} · {name}
              </div>
              <p className="mt-1 text-sm text-muted leading-relaxed">{HABIT_LINES[name]}</p>
            </li>
          );
        })}
      </ol>

      <p className="mt-6 text-xs text-subtle">
        Now walking <strong>{habit}</strong>. If the topic is a trade or safety, Stop leads. A
        halt on Stop is a completed step, not a broken page. Educational only — you make the
        final call.
      </p>
    </div>
  );
}
