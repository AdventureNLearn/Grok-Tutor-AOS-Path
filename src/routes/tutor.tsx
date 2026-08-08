import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Layers, Loader2, Send, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SimpleMarkdown } from "@/components/markdown";
import { INDUSTRIES, getIndustry } from "@/lib/industries";
import {
  AOS_SKILLS,
  foundationSkills,
  getSkill,
  skillsForIndustry,
  type TutorMode,
} from "@/lib/aos-skills";
import { tutorChat } from "@/lib/tutor-api";
import { useTutorStore, type ChatMessage } from "@/lib/store";
import { cn } from "@/lib/utils";
import { isMemeLane, parseTutorLane } from "@/lib/tutor-lane";
import { getShapeDef, useHiveEditStore } from "@/lib/hive-edit-store";

const searchSchema = z.object({
  industry: z.string().optional(),
  skill: z.string().optional(),
  lane: z.string().optional(),
  /** Floating desk iframe surface — kept so validateSearch does not strip it */
  surface: z.string().optional(),
});

export const Route = createFileRoute("/tutor")({
  validateSearch: searchSchema,
  component: TutorPage,
});

const MODES: { id: TutorMode; label: string }[] = [
  { id: "explain", label: "Explain" },
  { id: "socratic", label: "Socratic" },
  { id: "practice", label: "Practice" },
  { id: "quiz", label: "Quiz" },
  { id: "scenario", label: "On-the-job" },
  { id: "career", label: "Career path" },
];

const LEVELS = ["beginner", "intermediate", "advanced"] as const;

function TutorPage() {
  const search = Route.useSearch();
  const chatFn = useServerFn(tutorChat);
  const lane = parseTutorLane(search.lane);
  const meme = isMemeLane(lane);
  const {
    addSession,
    appendMessage,
    updateSession,
    consumeGuestMessage,
    guestRemaining,
    guestLimit,
    addMinutes,
  } = useTutorStore();

  const [industryId, setIndustryId] = useState(search.industry ?? "electrical");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("beginner");
  const [mode, setMode] = useState<TutorMode>("explain");
  const [topic, setTopic] = useState("");
  const [skillIds, setSkillIds] = useState<string[]>(() => {
    const base = foundationSkills()
      .slice(0, 2)
      .map((s) => s.id);
    if (search.skill && AOS_SKILLS.some((s) => s.id === search.skill)) {
      return Array.from(new Set([...base, search.skill]));
    }
    return base;
  });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<number>(Date.now());
  const onLearnEvent = useHiveEditStore((s) => s.onLearnEvent);
  const shapeId = useHiveEditStore((s) => s.shapeId);
  const phaseCount = Math.max(1, getShapeDef(shapeId).phases.length || 4);

  const industry = getIndustry(industryId);
  const recommended = useMemo(() => {
    const affinity = industry?.aosAffinity ?? [];
    const byIndustry = skillsForIndustry(industryId);
    const map = new Map(byIndustry.map((s) => [s.id, s]));
    for (const id of affinity) {
      const s = AOS_SKILLS.find((x) => x.id === id && x.tutorEnabled);
      if (s) map.set(s.id, s);
    }
    return Array.from(map.values()).slice(0, 12);
  }, [industryId, industry]);

  useEffect(() => {
    if (search.industry && getIndustry(search.industry)) {
      setIndustryId(search.industry);
    }
  }, [search.industry]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  function toggleSkill(id: string) {
    setSkillIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) {
        toast.message("You can use up to 4 thinking tools at once");
        return prev;
      }
      return [...prev, id];
    });
  }

  function startSession() {
    const id = crypto.randomUUID();
    const ind = getIndustry(industryId);
    addSession({
      id,
      industryId,
      industryName: ind?.name ?? industryId,
      level,
      mode,
      skillIds,
      topic: topic || undefined,
      messages: [],
      minutes: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setSessionId(id);
    setMessages([]);
    setStarted(true);
    startRef.current = Date.now();
    onLearnEvent("session_start", phaseCount);
    setInput(
      topic
        ? `I want to learn: ${topic}`
        : `I'm a ${level} learner. Start a ${mode} lesson on ${ind?.name ?? industryId}. What should we cover first?`,
    );
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    if (!consumeGuestMessage()) {
      toast.error(
        `Daily guest limit reached (${guestLimit()}). Come back tomorrow or get your own tutor.`,
      );
      return;
    }

    let sid = sessionId;
    if (!sid) {
      const id = crypto.randomUUID();
      const ind = getIndustry(industryId);
      addSession({
        id,
        industryId,
        industryName: ind?.name ?? industryId,
        level,
        mode,
        skillIds,
        topic: topic || undefined,
        messages: [],
        minutes: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      sid = id;
      setSessionId(id);
      setStarted(true);
      startRef.current = Date.now();
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      at: Date.now(),
    };
    const next = [...messages, userMsg];
    setMessages(next);
    appendMessage(sid, userMsg);
    setInput("");
    setBusy(true);
    onLearnEvent("user_turn", phaseCount);

    try {
      const result = await chatFn({
        data: {
          industryId,
          level,
          mode,
          skillIds,
          topic: topic || undefined,
          lane,
          messages: next
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
        },
      });

      if ("text" in result && result.text) {
        const aMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.text,
          at: Date.now(),
        };
        setMessages((m) => [...m, aMsg]);
        appendMessage(sid, aMsg);
        onLearnEvent("assistant_turn", phaseCount);
        const mins = Math.max(1, Math.round((Date.now() - startRef.current) / 60000));
        updateSession(sid, { minutes: mins });
      } else {
        toast.error("I couldn't complete that turn. Try again.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  function resetChat() {
    if (sessionId) {
      const mins = Math.max(1, Math.round((Date.now() - startRef.current) / 60000));
      updateSession(sessionId, { minutes: mins });
      addMinutes(mins);
    }
    onLearnEvent("session_end", phaseCount);
    setSessionId(null);
    setMessages([]);
    setStarted(false);
    setInput("");
  }

  return (
    <div
      className={cn(
        "mx-auto max-w-6xl px-4 py-6 sm:py-8",
        meme && "tutor-meme-lane",
      )}
    >
      {meme ? (
        <div className="mb-4 rounded-md border-4 border-yellow-400 bg-zinc-950 px-4 py-3 shadow-[4px_4px_0_#000]">
          <p className="text-xs font-black uppercase tracking-widest text-yellow-400">
            ITSHABBENING meme mode · not the professional tutor UI
          </p>
          <p className="mt-1 text-sm text-zinc-300">
            Same safety facts. Different voice. If you wanted LinkedIn calm, leave this lane.
          </p>
        </div>
      ) : null}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {meme ? "Learn (unhinged)" : "Learn"}
          </h1>
          <p className="text-sm text-muted mt-1">
            {meme
              ? "Pick a job, pick a mode, ask like a normal person. Guest questions left today: "
              : "Field, level, mode, and optional thinking tools. Guest questions left today: "}
            <span className="text-fg tabular-nums">{guestRemaining()}</span> / {guestLimit()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/skills">
              <Layers className="h-3.5 w-3.5" /> Thinking tools
            </Link>
          </Button>
          {started ? (
            <Button variant="ghost" size="sm" onClick={resetChat}>
              <Trash2 className="h-3.5 w-3.5" /> New lesson
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-4 items-start">
        <aside className="rounded-[var(--radius-xl)] border border-border bg-surface p-4 sm:p-5 space-y-4 lg:sticky lg:top-20">
          <div>
            <label className="text-xs font-medium text-subtle uppercase tracking-wide">
              Field
            </label>
            <select
              value={industryId}
              onChange={(e) => setIndustryId(e.target.value)}
              disabled={started && messages.length > 0}
              className="mt-1.5 h-10 w-full rounded-[var(--radius-sm)] border border-border bg-bg px-2 text-sm"
            >
              {INDUSTRIES.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-subtle uppercase tracking-wide">
              Level
            </label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={cn(
                    "h-8 rounded-full border px-3 text-xs capitalize",
                    level === l
                      ? "border-teal/40 bg-[color-mix(in_oklab,var(--color-teal)_14%,transparent)] text-teal"
                      : "border-border text-muted",
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-subtle uppercase tracking-wide">
              How to learn
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMode(m.id);
                    if (m.id !== mode) onLearnEvent("mode_change", phaseCount);
                  }}
                  className={cn(
                    "h-9 rounded-[var(--radius-sm)] border text-xs px-2",
                    mode === m.id
                      ? "border-teal/40 bg-[color-mix(in_oklab,var(--color-teal)_14%,transparent)] text-teal"
                      : "border-border text-muted",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-subtle uppercase tracking-wide">
              Topic (optional)
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. load calculations, SBAR, study plans"
              className="mt-1.5 h-10 w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3 text-sm placeholder:text-subtle"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-subtle uppercase tracking-wide">
                Thinking tools
              </label>
              <span className="text-[11px] text-subtle tabular-nums">
                {skillIds.length}/4
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
              {recommended.map((s) => {
                const on = skillIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSkill(s.id)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                      on
                        ? "border-teal/50 bg-[color-mix(in_oklab,var(--color-teal)_16%,transparent)] text-teal"
                        : "border-border text-muted hover:text-fg",
                    )}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-subtle leading-relaxed">
              Suggested for {industry?.name}. See the full map on{" "}
              <Link to="/skills" className="text-teal underline-offset-2 hover:underline">
                Thinking tools
              </Link>
              .
            </p>
          </div>

          {!started ? (
            <Button variant="teal" className="w-full" onClick={startSession}>
              <Sparkles className="h-4 w-4" /> Start lesson
            </Button>
          ) : null}
        </aside>

        <section className="rounded-[var(--radius-xl)] border border-border bg-surface flex flex-col min-h-[min(70dvh,720px)]">
          <div className="border-b border-border px-4 py-3 flex flex-wrap items-center gap-2">
            <BookOpen className="h-4 w-4 text-teal" />
            <span className="text-sm font-medium">{industry?.name ?? "Tutor"}</span>
            <Badge>{MODES.find((m) => m.id === mode)?.label ?? mode}</Badge>
            <Badge variant="outline" className="capitalize">
              {level}
            </Badge>
            {skillIds.map((id) => (
              <Badge key={id} variant="teal">
                {getSkill(id)?.name ?? id}
              </Badge>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center px-4">
                <div className="h-12 w-12 rounded-[var(--radius-md)] border border-border bg-elevated flex items-center justify-center mb-4">
                  <BookOpen className="h-5 w-5 text-teal" />
                </div>
                <h2 className="font-semibold tracking-tight">Ready when you are</h2>
                <p className="mt-2 text-sm text-muted max-w-md leading-relaxed">
                  Set up the lesson, press start, and ask something real from your work. Teaching stays
                  evidence-first and safety-first for the trades.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[min(100%,560px)] rounded-[var(--radius-lg)] px-3.5 py-2.5 text-sm",
                      m.role === "user"
                        ? "bg-elevated border border-border text-fg"
                        : "bg-bg border border-border",
                    )}
                  >
                    {m.role === "assistant" ? (
                      <SimpleMarkdown text={m.content} />
                    ) : (
                      <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>
                </div>
              ))
            )}
            {busy ? (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin text-teal" />
                Thinking with your tools…
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-border p-3">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
                placeholder="Ask a question, answer a quiz item, or describe a jobsite scenario…"
                className="flex-1 resize-none rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-sm placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-teal)_40%,transparent)]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
              />
              <Button
                type="submit"
                variant="teal"
                size="icon"
                className="h-auto w-12 shrink-0"
                disabled={busy || !input.trim()}
                aria-label="Send"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
