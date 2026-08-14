import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useHiveEditStore } from "@/lib/hive-edit-store";
import { LEARNER_LENSES, existingSampleById } from "@/lib/suite-rooms";
import { waveShapeForLens } from "@/lib/suite-rooms";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/skills/")({
  component: SkillsPage,
});

function SkillsPage() {
  const navigate = useNavigate();
  const attached = useHiveEditStore((s) => s.attachedLensId);
  const lessonId = useHiveEditStore((s) => s.activeLessonId);
  const setAttachedLensId = useHiveEditStore((s) => s.setAttachedLensId);
  const setShape = useHiveEditStore((s) => s.setShape);
  const setEditMode = useHiveEditStore((s) => s.setEditMode);
  const lesson = existingSampleById(lessonId);

  function attach(id: string) {
    const next = attached === id ? null : id;
    setAttachedLensId(next);
    setEditMode(false);
    setShape(waveShapeForLens(next));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10" data-testid="suite-tools">
      <h1 className="text-3xl font-semibold tracking-tight">Tools</h1>
      <p className="mt-2 text-muted leading-relaxed">
        Attach one lens or none. A lens sits on top of the habit. It is not an eighth habit. Do
        not load a lens before you have a claim.
      </p>
      <p className="mt-2 text-sm text-subtle">
        Sitting lesson: {lesson ? lesson.combTitle : "none yet — pick a sample comb on the hive."}
      </p>

      <div className="mt-8 grid sm:grid-cols-2 gap-3">
        {LEARNER_LENSES.map((lens) => {
          const on = attached === lens.id;
          return (
            <button
              key={lens.id}
              type="button"
              onClick={() => attach(lens.id)}
              className={cn(
                "text-left rounded-[var(--radius-xl)] border p-4 transition-colors",
                on
                  ? "border-teal/40 bg-[color-mix(in_oklab,var(--color-teal)_10%,var(--color-surface))]"
                  : "border-border bg-surface hover:border-border-strong",
              )}
            >
              <div className="text-sm font-semibold tracking-tight">{lens.name}</div>
              <p className="mt-1.5 text-xs text-muted leading-relaxed">{lens.purpose}</p>
              <p className="mt-2 text-[11px] text-subtle">
                {on ? "Attached — wave uses this look" : "Tap to attach"}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            setAttachedLensId(null);
            setShape("honeycomb");
          }}
        >
          Detach lens
        </Button>
        <Button asChild size="sm" variant="teal">
          <Link to="/path">Play on Path</Link>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => void navigate({ to: "/" })}
        >
          Back to the hive
        </Button>
      </div>
    </div>
  );
}
