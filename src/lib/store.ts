import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TutorMode } from "./aos-skills";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  at: number;
};

export type SessionRecord = {
  id: string;
  industryId: string;
  industryName: string;
  level: string;
  mode: TutorMode;
  skillIds: string[];
  topic?: string;
  messages: ChatMessage[];
  minutes: number;
  createdAt: number;
  updatedAt: number;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  industryId?: string;
  createdAt: number;
};

type TutorState = {
  sessions: SessionRecord[];
  notes: Note[];
  guestMessagesUsed: number;
  guestDayKey: string;
  totalMinutes: number;
  addSession: (s: SessionRecord) => void;
  updateSession: (id: string, patch: Partial<SessionRecord>) => void;
  appendMessage: (sessionId: string, msg: ChatMessage) => void;
  addNote: (n: Note) => void;
  removeNote: (id: string) => void;
  /** Clear lessons, notes, minutes, guest counters (this browser only). */
  resetProgress: () => void;
  consumeGuestMessage: () => boolean;
  guestLimit: () => number;
  guestRemaining: () => number;
  addMinutes: (m: number) => void;
};

/** localStorage keys used by Tutor product surfaces (progress + hive session chrome) */
export const TUTOR_STORAGE_KEYS = [
  "grok-tutor-aos-v1",
  "grok-tutor-hive-desks-v2",
  "grok-tutor-hive-desks-v1",
  "grok-tutor-first-run-coach-v1",
] as const;

/**
 * Wipe learner progress + open desks in this browser.
 * Does not clear 3D/edit preferences unless `full` is true.
 */
export function clearBrowserTutorData(opts?: { full?: boolean }): void {
  if (typeof localStorage === "undefined") return;
  for (const k of TUTOR_STORAGE_KEYS) {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  }
  if (opts?.full) {
    for (const k of [
      "grok-tutor-hive-edit-v3",
      "grok-tutor-hive-view-v1",
      "grok-tutor-hive-view-forced-v1",
    ]) {
      try {
        localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    }
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

const GUEST_DAILY = 12;
const SIGNED_IN_DAILY = 40; // soft client note; real limits enforced by owner key

/** Normalize a session after rehydrate — old/partial localStorage must not crash UI. */
export function normalizeSession(raw: unknown): SessionRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Partial<SessionRecord>;
  if (!s.id || typeof s.id !== "string") return null;
  return {
    id: s.id,
    industryId: typeof s.industryId === "string" ? s.industryId : "unknown",
    industryName: typeof s.industryName === "string" ? s.industryName : "Lesson",
    level: typeof s.level === "string" ? s.level : "beginner",
    mode: (s.mode as TutorMode) || "explain",
    skillIds: Array.isArray(s.skillIds)
      ? s.skillIds.filter((x): x is string => typeof x === "string")
      : [],
    topic: typeof s.topic === "string" ? s.topic : undefined,
    messages: Array.isArray(s.messages)
      ? s.messages.filter(
          (m): m is ChatMessage =>
            !!m &&
            typeof m === "object" &&
            typeof (m as ChatMessage).id === "string" &&
            typeof (m as ChatMessage).content === "string",
        )
      : [],
    minutes: typeof s.minutes === "number" && Number.isFinite(s.minutes) ? s.minutes : 0,
    createdAt: typeof s.createdAt === "number" ? s.createdAt : Date.now(),
    updatedAt: typeof s.updatedAt === "number" ? s.updatedAt : Date.now(),
  };
}

function normalizeNote(raw: unknown): Note | null {
  if (!raw || typeof raw !== "object") return null;
  const n = raw as Partial<Note>;
  if (!n.id || typeof n.id !== "string") return null;
  if (typeof n.title !== "string" || typeof n.body !== "string") return null;
  return {
    id: n.id,
    title: n.title,
    body: n.body,
    industryId: typeof n.industryId === "string" ? n.industryId : undefined,
    createdAt: typeof n.createdAt === "number" ? n.createdAt : Date.now(),
  };
}

export const useTutorStore = create<TutorState>()(
  persist(
    (set, get) => ({
      sessions: [],
      notes: [],
      guestMessagesUsed: 0,
      guestDayKey: todayKey(),
      totalMinutes: 0,

      addSession: (s) => {
        const clean = normalizeSession(s);
        if (!clean) return;
        set((st) => ({
          sessions: [clean, ...(Array.isArray(st.sessions) ? st.sessions : [])].slice(0, 50),
        }));
      },

      updateSession: (id, patch) =>
        set((st) => ({
          sessions: (Array.isArray(st.sessions) ? st.sessions : []).map((s) =>
            s.id === id ? { ...s, ...patch, updatedAt: Date.now() } : s,
          ),
        })),

      appendMessage: (sessionId, msg) =>
        set((st) => ({
          sessions: (Array.isArray(st.sessions) ? st.sessions : []).map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: [...(Array.isArray(s.messages) ? s.messages : []), msg],
                  updatedAt: Date.now(),
                }
              : s,
          ),
        })),

      addNote: (n) => {
        const clean = normalizeNote(n);
        if (!clean) return;
        set((st) => ({
          notes: [clean, ...(Array.isArray(st.notes) ? st.notes : [])].slice(0, 100),
        }));
      },

      removeNote: (id) =>
        set((st) => ({
          notes: (Array.isArray(st.notes) ? st.notes : []).filter((n) => n.id !== id),
        })),

      resetProgress: () =>
        set({
          sessions: [],
          notes: [],
          guestMessagesUsed: 0,
          guestDayKey: todayKey(),
          totalMinutes: 0,
        }),

      consumeGuestMessage: () => {
        const st = get();
        const key = todayKey();
        let used = st.guestMessagesUsed || 0;
        if (st.guestDayKey !== key) used = 0;
        if (used >= GUEST_DAILY) {
          if (st.guestDayKey !== key) set({ guestDayKey: key, guestMessagesUsed: 0 });
          return false;
        }
        set({ guestDayKey: key, guestMessagesUsed: used + 1 });
        return true;
      },

      guestLimit: () => GUEST_DAILY,

      guestRemaining: () => {
        const st = get();
        const key = todayKey();
        if (st.guestDayKey !== key) return GUEST_DAILY;
        return Math.max(0, GUEST_DAILY - (st.guestMessagesUsed || 0));
      },

      addMinutes: (m) =>
        set((st) => ({
          totalMinutes: (typeof st.totalMinutes === "number" ? st.totalMinutes : 0) + m,
        })),
    }),
    {
      name: "grok-tutor-aos-v1",
      /** Heal corrupt browser storage so Progress (and tutor) never white-screen. */
      merge: (persisted, current) => {
        const p =
          persisted && typeof persisted === "object"
            ? (persisted as Partial<TutorState>)
            : {};
        const sessionsRaw = Array.isArray(p.sessions) ? p.sessions : [];
        const notesRaw = Array.isArray(p.notes) ? p.notes : [];
        return {
          ...current,
          ...p,
          sessions: sessionsRaw
            .map(normalizeSession)
            .filter((s): s is SessionRecord => !!s)
            .slice(0, 50),
          notes: notesRaw
            .map(normalizeNote)
            .filter((n): n is Note => !!n)
            .slice(0, 100),
          guestMessagesUsed:
            typeof p.guestMessagesUsed === "number" ? p.guestMessagesUsed : 0,
          guestDayKey:
            typeof p.guestDayKey === "string" ? p.guestDayKey : todayKey(),
          totalMinutes: typeof p.totalMinutes === "number" ? p.totalMinutes : 0,
        };
      },
    },
  ),
);

export const LIMITS = { GUEST_DAILY, SIGNED_IN_DAILY };
