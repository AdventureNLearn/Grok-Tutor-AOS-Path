import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Pause, Play, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHiveEditStore } from "@/lib/hive-edit-store";
import { PATH_HABIT_BEAT_MS, planPathPlay } from "@/lib/path-play";
import { firstSliceTrackById } from "@/lib/reasoning-tracks";
import { FROZEN_HABITS, HABIT_LINES, getLearnerLens } from "@/lib/suite-rooms";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/path")({
  component: PathPage,
});

function PathPage() {
  const [walking, setWalking] = useState(false);
  const phaseIndex = useHiveEditStore((s) => s.phaseIndex);
  const attachedLensId = useHiveEditStore((s) => s.attachedLensId);
  const activeLessonId = useHiveEditStore((s) => s.activeLessonId);
  const setPhaseIndex = useHiveEditStore((s) => s.setPhaseIndex);
  const nextPhase = useHiveEditStore((s) => s.nextPhase);

  const plan = planPathPlay(activeLessonId);
  const lesson = firstSliceTrackById(plan.lessonId);
  const lens = getLearnerLens(attachedLensId);
  const habit = FROZEN_HABITS[Math.min(phaseIndex, FROZEN_HABITS.length - 1)]!;

  useEffect(() => {
    if (!walking || !plan.canPlay) return;
    const id = window.setInterval(() => {
      nextPhase(FROZEN_HABITS.length);
    }, PATH_HABIT_BEAT_MS);
    return () => window.clearInterval(id);
  }, [walking, plan.canPlay, nextPhase]);

  function playPair() {
    // Stay on /path. Walk THIS sitting only. Do not open a desk or dump to hive home.
    if (!plan.canPlay) return;
    if (walking) {
      setWalking(false);
      return;
    }
    setPhaseIndex(0);
    setWalking(true);
  }

  return (
    <div
      className="mx-auto max-w-3xl px-4 py-10"
      data-testid="suite-path"
      data-sitting-lesson={plan.lessonId ?? ""}
      data-playing={walking ? "1" : "0"}
      data-path-route={plan.route}
    >
      <h1 className="text-3xl font-semibold tracking-tight">Path</h1>
      <p className="mt-2 text-muted leading-relaxed">
        Play this sitting through this lens. The seven habits walk here, in order. You do not
        leave this page, and you do not sculpt the graph.
      </p>

      <div className="mt-6 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <p className="text-xs font-medium text-subtle uppercase tracking-wide">This sitting</p>
        <p className="mt-2 text-sm" data-testid="path-sitting-lesson">
          <span className="text-subtle">Lesson · </span>
          {plan.pairing
            ? plan.pairing
            : "Pick a sample comb on the hive first. Play will not invent a different lesson."}
        </p>
        <p className="mt-1 text-sm">
          <span className="text-subtle">Lens · </span>
          {lens ? lens.name : "None — honeycomb walk. Attach one in Tools, or none."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="teal"
            data-testid="path-play"
            disabled={!plan.canPlay}
            onClick={playPair}
          >
            {walking ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {walking ? "Pause this walk" : "Play this lesson through this lens"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => nextPhase(FROZEN_HABITS.length)}
          >
            <SkipForward className="h-3.5 w-3.5" />
            Next habit
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
              data-testid="path-habit"
              data-habit={name}
              data-habit-on={on ? "1" : "0"}
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
        Now walking <strong>{habit}</strong>
        {lesson ? (
          <>
            {" "}
            on <strong>{plan.pairing}</strong>
          </>
        ) : null}
        . If the topic is a trade or safety, Stop leads. A halt on Stop is a completed step, not
        a broken page. Educational only — you make the final call.
      </p>
    </div>
  );
}
