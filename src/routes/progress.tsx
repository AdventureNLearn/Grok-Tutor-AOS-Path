import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, StickyNote, Trash2 } from "lucide-react";
import { useTutorStore } from "@/lib/store";
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

  const sessionMinutes = sessions.reduce(
    (a, s) => a + (typeof s?.minutes === "number" ? s.minutes : 0),
    0,
  );
  const displayMinutes = Math.max(
    typeof totalMinutes === "number" ? totalMinutes : 0,
    sessionMinutes,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Progress</h1>
      <p className="mt-2 text-muted">
        Saved in this browser. Lessons and notes stay on your device.
      </p>

      <div className="mt-8 grid sm:grid-cols-3 gap-3">
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div className="text-2xl font-semibold tabular-nums">{sessions.length}</div>
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
        {sessions.length === 0 ? (
          <p className="text-sm text-muted border border-dashed border-border rounded-[var(--radius-lg)] p-6">
            No lessons yet. Start learning when you are ready.
          </p>
        ) : (
          <ul className="space-y-2">
            {sessions.slice(0, 20).map((s) => {
              const messages = Array.isArray(s.messages) ? s.messages : [];
              const skillIds = Array.isArray(s.skillIds) ? s.skillIds : [];
              const created =
                typeof s.createdAt === "number"
                  ? new Date(s.createdAt).toLocaleString()
                  : "—";
              return (
                <li
                  key={s.id}
                  className="rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div>
                    <div className="font-medium text-sm">
                      {s.industryName || "Lesson"}
                    </div>
                    <div className="text-xs text-subtle mt-0.5">
                      {created} · {messages.length} messages · {s.minutes || 0}{" "}
                      min
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {s.mode ? (
                        <Badge className="capitalize">{s.mode}</Badge>
                      ) : null}
                      {s.level ? (
                        <Badge variant="outline" className="capitalize">
                          {s.level}
                        </Badge>
                      ) : null}
                      {skillIds.slice(0, 3).map((id) => (
                        <Badge key={id} variant="teal">
                          {id}
                        </Badge>
                      ))}
                    </div>
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
