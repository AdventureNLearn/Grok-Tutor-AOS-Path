/**
 * First-run coach — dismissible, localStorage only.
 * Card sits in a corner with pointer-events only on itself so combs / 3D stay clickable.
 */
import { useEffect, useState } from "react";
import { BookOpen, Hexagon, Sparkles, X } from "lucide-react";
import { useHiveDeskStore } from "@/lib/hive-desk-store";

const KEY = "grok-tutor-first-run-coach-v1";

const STEPS = [
  {
    title: "Welcome to The Hive",
    body: "Each comb opens a learning desk — Live session, Samples, Library, Industries, Tools, Plan Lab, and more. Click a comb, or use the top navigation for full pages.",
    icon: Hexagon,
  },
  {
    title: "Learn your way",
    body: "Sample lessons are multi-turn craft dialogues. Live session guides you through explain, practice, quiz, and on-the-job modes. Library is your curriculum hub.",
    icon: BookOpen,
  },
  {
    title: "Plan Lab",
    body: "Practice CAD pipeline literacy and careful review habits offline — then return to craft lessons when you are ready.",
    icon: Sparkles,
  },
  {
    title: "Safety and scope",
    body: "Educational only — not a credential. When real safety or regulated work is on the line, follow your site leads and official guidance. You make the final call.",
    icon: Sparkles,
  },
] as const;

export function FirstRunCoach() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const openRoute = useHiveDeskStore((s) => s.openRoute);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) === "done") return;
      setOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  if (!open) return null;

  const s = STEPS[step]!;
  const Icon = s.icon;
  const last = step >= STEPS.length - 1;

  function dismiss() {
    try {
      localStorage.setItem(KEY, "done");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  return (
    <div className="tutor-coach" role="dialog" aria-label="Welcome to Grok Tutor">
      <div className="tutor-coach-card">
        <button type="button" className="tutor-coach-x" onClick={dismiss} aria-label="Close">
          <X className="h-4 w-4" />
        </button>
        <div className="tutor-coach-step">
          Tip {step + 1} of {STEPS.length}
        </div>
        <div className="tutor-coach-icon">
          <Icon className="h-5 w-5" />
        </div>
        <h2>{s.title}</h2>
        <p>{s.body}</p>
        <div className="tutor-coach-actions">
          {!last ? (
            <button type="button" className="tutor-coach-primary" onClick={() => setStep((n) => n + 1)}>
              Next
            </button>
          ) : (
            <>
              <button
                type="button"
                className="tutor-coach-primary"
                onClick={() => {
                  openRoute("/demo", "Sample lessons", "#a78bfa", "SMP");
                  dismiss();
                }}
              >
                Open Samples
              </button>
              <button type="button" className="tutor-coach-ghost" onClick={dismiss}>
                Start exploring
              </button>
            </>
          )}
          {step > 0 && !last ? (
            <button type="button" className="tutor-coach-ghost" onClick={() => setStep((n) => n - 1)}>
              Back
            </button>
          ) : null}
        </div>
        <button type="button" className="tutor-coach-skip" onClick={dismiss}>
          Don&apos;t show again
        </button>
      </div>
    </div>
  );
}
