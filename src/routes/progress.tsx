import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, StickyNote, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  clearBrowserTutorData,
  useTutorStore,
} from "@/lib/store";
import { useHiveDeskStore } from "@/lib/hive-desk-store";
import { useHiveEditStore } from "@/lib/hive-edit-store";
import {
  PROGRESS_SITTING_COPY,
  PROGRESS_UNLIT_COPY,
  planSittingProgress,
  sittingProgressRows,
} from "@/lib/sitting-progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/progress")({
  component: ProgressPage,
});

function ProgressPage() {
  const sessionsRaw = useTutorStore((s) => s.sessions);
  const notesRaw = useTutorStore((s) => s.notes);
  const totalMinutes = useTutorStore((s) => s.totalMinutes);
  const addNote = useTutorStore((s) => s.addNote);
  const removeNote = useTutorStore((s) => s.removeNote);
  const resetProgress = useTutorStore((s) => s.resetProgress);
  const closeAllDesks = useHiveDeskStore((s) => s.closeAll);
  const clearBookmarks = useHiveDeskStore((s) => s.clearBookmarks);
  const sittingLessonId = useHiveEditStore((s) => s.activeLessonId);
  const setActiveLessonId = useHiveEditStore((s) => s.setActiveLessonId);

  const sessions = useMemo(
    () => (Array.isArray(sessionsRaw) ? sessionsRaw : []),
    [sessionsRaw],
  );
  const notes = useMemo(
    () => (Array.isArray(notesRaw) ? notesRaw : []),
    [notesRaw],
  );

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const sitting = useMemo(
    () => planSittingProgress({ sittingLessonId, sessionCount: sessions.length }),
    [sittingLessonId, sessions.length],
  );
  const lessonRows = useMemo(
    () => sittingProgressRows({ sittingLessonId, sessions }),
    [sittingLessonId, sessions],
  );

  const sessionMinutes = sessions.reduce(
    (a, s) => a + (typeof s?.minutes === "number" ? s.minutes : 0),
    0,
  );
  const displayMinutes = Math.max(
    typeof totalMinutes === "number" ? totalMinutes : 0,
    sessionMinutes,
  );

  function handleResetProgress() {
    const ok = window.confirm(
      "Reset all progress in this browser?\n\nThis clears lessons, notes, study minutes, guest question counters, and open desks. It cannot be undone.",
    );
    if (!ok) return;
    try {
      resetProgress();
      setActiveLessonId(null);
      closeAllDesks();
      clearBookmarks();
      clearBrowserTutorData({ full: false });
      toast.success("Progress reset", {
        description: "Lessons, notes, and desks cleared on this device.",
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not reset progress");
    }
  }

  function handleFullReset() {
    const ok = window.confirm(
      "Full local reset?\n\nClears progress, desks, first-run tips, and Hive view preferences. The page will reload.",
    );
    if (!ok) return;
    try {
      resetProgress();
      setActiveLessonId(null);
      closeAllDesks();
      clearBookmarks();
      clearBrowserTutorData({ full: true });
      toast.success("Full reset — reloading…");
      window.setTimeout(() => {
        window.location.href = "/";
      }, 400);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not reset");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Progress</h1>
          {sitting.showUnlitCopy ? (
            <p className="mt-2 text-sm text-subtle" data-testid="progress-empty">
              {PROGRESS_UNLIT_COPY}
            </p>
          ) : sitting.sittingPairing ? (
            <p className="mt-2 text-sm text-subtle" data-testid="progress-sitting">
              {PROGRESS_SITTING_COPY} {sitting.sittingPairing}.
            </p>
          ) : null}
          <p className="mt-2 text-muted">
            Saved in this browser. Lessons and notes stay on your device.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleResetProgress}
            title="Clear lessons, notes, minutes, and desks"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset progress
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-subtle hover:text-danger"
            onClick={handleFullReset}
            title="Clear all local Tutor data and reload"
          >
            Full local reset
          </Button>
        </div>
      </div>

      <div className="mt-8 grid sm:grid-cols-3 gap-3">
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div
            className="text-2xl font-semibold tabular-nums"
            data-testid="progress-lesson-count"
          >
            {Math.max(sitting.lessonCount, lessonRows.length)}
          </div>
          <div className="text-xs text-subtle mt-1">Lessons</div>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div className="text-2xl font-semibold tabular-nums flex items-center gap-2">
            <Clock className="h-5 w-5 text-teal" />
            {displayMinutes}
          </div>
          <div className="text-xs text-subtle mt-1">Study minutes (approx.)</div>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div className="text-2xl font-semibold tabular-nums">{notes.length}</div>
          <div className="text-xs text-subtle mt-1">Saved notes</div>
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="font-semibold tracking-tight">Recent lessons</h2>
          <Button asChild size="sm" variant="teal">
            <Link to="/tutor">New lesson</Link>
          </Button>
        </div>
        {lessonRows.length === 0 ? (
          <p className="text-sm text-muted border border-dashed border-border rounded-[var(--radius-lg)] p-6">
            No lessons yet. Sit Electrical, Plumbing, or HVAC, or ask for a covered pack.
          </p>
        ) : (
          <ul className="space-y-2">
            {lessonRows.slice(0, 20).map((s) => {
              const created =
                typeof s.createdAt === "number"
                  ? new Date(s.createdAt).toLocaleString()
                  : null;
              return (
                <li
                  key={s.id}
                  data-progress-source={s.source}
                  className="rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div>
                    <div className="font-medium text-sm">
                      {s.industryName || "Lesson"}
                    </div>
                    {s.source === "sitting" ? (
                      <div className="text-xs text-subtle mt-0.5">
                        This sitting has a lesson. Minutes and notes stay empty
                        until you write them.
                      </div>
                    ) : (
                      <div className="text-xs text-subtle mt-0.5">
                        {created ?? "—"} · {s.messages} messages
                        {s.minutes !== null ? ` · ${s.minutes} min` : ""}
                      </div>
                    )}
                    {s.source === "session" ? (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {s.mode ? (
                          <Badge className="capitalize">{s.mode}</Badge>
                        ) : null}
                        {s.level ? (
                          <Badge variant="outline" className="capitalize">
                            {s.level}
                          </Badge>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-semibold tracking-tight flex items-center gap-2 mb-3">
          <StickyNote className="h-4 w-4 text-teal" /> Notes
        </h2>
        <form
          className="rounded-[var(--radius-xl)] border border-border bg-surface p-4 space-y-3 mb-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !body.trim()) return;
            addNote({
              id: crypto.randomUUID(),
              title: title.trim(),
              body: body.trim(),
              createdAt: Date.now(),
            });
            setTitle("");
            setBody("");
          }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="h-10 w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3 text-sm"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What you want to remember…"
            rows={3}
            className="w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3 py-2 text-sm resize-y"
          />
          <Button type="submit" size="sm" variant="secondary">
            Save note
          </Button>
        </form>

        <ul className="space-y-2">
          {notes.map((n) => (
            <li
              key={n.id}
              className="rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium text-sm">{n.title}</div>
                  <p className="text-sm text-muted mt-1 whitespace-pre-wrap leading-relaxed">
                    {n.body}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Delete note"
                  className="text-subtle hover:text-danger p-1"
                  onClick={() => removeNote(n.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
