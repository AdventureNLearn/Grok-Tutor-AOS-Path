/**
 * Progress lights from a sit — first-slice comb or a covered pack reached by ask.
 * Honest empty is only before a sit (and with no recorded lessons).
 * Do not invent minutes, notes, or a cloud save.
 */
import type { SessionRecord } from "./store";
import { resolveSitting } from "./sit-from-named-pack";
import { learnerIndustryLabel } from "./reasoning-tracks";

export const PROGRESS_UNLIT_COPY =
  "This browser has not lit a comb yet. Progress stays on this device. Changing browsers or clearing site data goes dark — there is no cloud save.";

export const PROGRESS_SITTING_COPY =
  "This sitting has a lesson. Progress stays on this device. There is no cloud save.";

export type SittingProgress = {
  lit: boolean;
  lessonCount: number;
  sittingLessonId: string | null;
  sittingPairing: string | null;
  sittingIndustry: string | null;
  showUnlitCopy: boolean;
  inventedMinutes: false;
  inventedNotes: false;
  cloudSave: false;
};

export type ProgressLessonRow = {
  id: string;
  industryName: string;
  mode?: string;
  level?: string;
  /** null = do not invent a minute count */
  minutes: number | null;
  createdAt: number | null;
  messages: number;
  /** Sitting rows never print skill IDs. */
  skillIds: string[];
  source: "sitting" | "session";
};

export function planSittingProgress(opts: {
  sittingLessonId: string | null | undefined;
  sessionCount?: number;
}): SittingProgress {
  const sitting = resolveSitting(opts.sittingLessonId);
  const sessions =
    typeof opts.sessionCount === "number" && Number.isFinite(opts.sessionCount)
      ? Math.max(0, Math.floor(opts.sessionCount))
      : 0;
  const lit = Boolean(sitting) || sessions > 0;
  const lessonCount = sitting ? Math.max(sessions, 1) : sessions;
  return {
    lit,
    lessonCount,
    sittingLessonId: sitting?.sitId ?? null,
    sittingPairing: sitting?.pairing ?? null,
    sittingIndustry: sitting ? learnerIndustryLabel(sitting.industryId) : null,
    showUnlitCopy: !lit,
    inventedMinutes: false,
    inventedNotes: false,
    cloudSave: false,
  };
}

export function sittingProgressRows(opts: {
  sittingLessonId: string | null | undefined;
  sessions: SessionRecord[];
}): ProgressLessonRow[] {
  const sessions = Array.isArray(opts.sessions) ? opts.sessions : [];
  const sitting = resolveSitting(opts.sittingLessonId);
  const sessionRows: ProgressLessonRow[] = sessions.map((s) => ({
    id: s.id,
    industryName: s.industryName || "Lesson",
    mode: s.mode,
    level: s.level,
    minutes: typeof s.minutes === "number" && Number.isFinite(s.minutes) ? s.minutes : 0,
    createdAt: typeof s.createdAt === "number" ? s.createdAt : null,
    messages: Array.isArray(s.messages) ? s.messages.length : 0,
    skillIds: Array.isArray(s.skillIds) ? s.skillIds : [],
    source: "session",
  }));
  if (!sitting) return sessionRows;
  const already = sessionRows.some(
    (row) =>
      row.id === sitting.sitId ||
      row.industryName === sitting.pairing ||
      row.industryName === learnerIndustryLabel(sitting.industryId),
  );
  if (already) return sessionRows;
  const sitRow: ProgressLessonRow = {
    id: sitting.sitId,
    industryName: sitting.pairing,
    minutes: null,
    createdAt: null,
    messages: 0,
    skillIds: [],
    source: "sitting",
  };
  return [sitRow, ...sessionRows];
}
