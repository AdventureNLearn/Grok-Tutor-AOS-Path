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
  consumeGuestMessage: () => boolean;
  guestLimit: () => number;
  guestRemaining: () => number;
  addMinutes: (m: number) => void;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

const GUEST_DAILY = 12;
const SIGNED_IN_DAILY = 40; // soft client note; real limits enforced by owner key

export const useTutorStore = create<TutorState>()(
  persist(
    (set, get) => ({
      sessions: [],
      notes: [],
      guestMessagesUsed: 0,
      guestDayKey: todayKey(),
      totalMinutes: 0,

      addSession: (s) => set((st) => ({ sessions: [s, ...st.sessions].slice(0, 50) })),

      updateSession: (id, patch) =>
        set((st) => ({
          sessions: st.sessions.map((s) =>
            s.id === id ? { ...s, ...patch, updatedAt: Date.now() } : s,
          ),
        })),

      appendMessage: (sessionId, msg) =>
        set((st) => ({
          sessions: st.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, messages: [...s.messages, msg], updatedAt: Date.now() }
              : s,
          ),
        })),

      addNote: (n) => set((st) => ({ notes: [n, ...st.notes].slice(0, 100) })),

      removeNote: (id) => set((st) => ({ notes: st.notes.filter((n) => n.id !== id) })),

      consumeGuestMessage: () => {
        const st = get();
        const key = todayKey();
        let used = st.guestMessagesUsed;
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
        return Math.max(0, GUEST_DAILY - st.guestMessagesUsed);
      },

      addMinutes: (m) => set((st) => ({ totalMinutes: st.totalMinutes + m })),
    }),
    { name: "grok-tutor-aos-v1" },
  ),
);

export const LIMITS = { GUEST_DAILY, SIGNED_IN_DAILY };
