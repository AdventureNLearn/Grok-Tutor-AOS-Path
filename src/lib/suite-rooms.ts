/**
 * Tutor Hive suite rooms — learner-safe Tools / Path / Progress helpers.
 * Shape names and habit strings match the visible-path contract.
 * Existing sample lessons only (reasoning-track flagships already in this app).
 */
import type { HiveShapeId } from "./hive-layout-shapes";
import { REASONING_TRACKS, getReasoningTrack } from "./reasoning-tracks";

export const FROZEN_HABITS = [
  "Notice",
  "Name the claim",
  "What would count",
  "One better question",
  "Small check",
  "Stop",
  "Carry forward",
] as const;

export type FrozenHabit = (typeof FROZEN_HABITS)[number];

export type LearnerLensId =
  | "careful"
  | "evidence"
  | "source"
  | "assumption"
  | "four-role"
  | "guide";

export type LearnerLens = {
  id: LearnerLensId;
  name: string;
  purpose: string;
  /** Wave shape while this lens is attached — not an idle-Hive sculptor */
  waveShape: Exclude<HiveShapeId, "custom">;
};

export const LEARNER_LENSES: LearnerLens[] = [
  {
    id: "careful",
    name: "Careful thinking",
    purpose: "Slow the walk. One claim at a time.",
    waveShape: "spine",
  },
  {
    id: "evidence",
    name: "Evidence check",
    purpose: "Keep What would count on screen until something is observable.",
    waveShape: "integrity-triangle",
  },
  {
    id: "source",
    name: "Source hygiene",
    purpose: "Keep the record in view. No second-hand pile-up.",
    waveShape: "claim-diamond",
  },
  {
    id: "assumption",
    name: "Assumption check",
    purpose: "Name what is being taken as given.",
    waveShape: "integrity-triangle",
  },
  {
    id: "four-role",
    name: "Four-role team",
    purpose: "Walk Architect · Builder · Critic · Integrator.",
    waveShape: "four-agent",
  },
  {
    id: "guide",
    name: "Skill guide",
    purpose: "How to use the attached lens. Not a catalog.",
    waveShape: "sense-orbit",
  },
];

export const HABIT_LINES: Record<FrozenHabit, string> = {
  Notice: "Look first. What is actually in front of you?",
  "Name the claim": "Say the claim in one sentence.",
  "What would count": "What would you have to see for that claim to hold?",
  "One better question": "Ask one question that can be answered.",
  "Small check": "One look or one question. Not a tool on a live system.",
  Stop: "If it is unsafe, out of scope, or you would have to invent — stop.",
  "Carry forward": "Take one honest next step. Human call at the end.",
};

/** A few tutor-safe tools for the attached lens — not the skill catalog. */
export function skillIdsForLens(id: string | null | undefined): string[] {
  switch (id) {
    case "evidence":
      return ["evidence-gate"];
    case "assumption":
      return ["evidence-gate", "reasoning-architect"];
    case "source":
      return ["evidence-gate", "agnostic-evidence-analyst"];
    case "four-role":
      return ["4-agent-orchestration"];
    case "careful":
      return ["reasoning-architect"];
    case "guide":
      return [];
    default:
      return [];
  }
}

export function getLearnerLens(id: string | null | undefined): LearnerLens | undefined {
  if (!id) return undefined;
  return LEARNER_LENSES.find((l) => l.id === id);
}

export function waveShapeForLens(id: string | null | undefined): HiveShapeId {
  return getLearnerLens(id)?.waveShape ?? "honeycomb";
}

/** Existing sample lessons already in this app — do not invent a new corpus. */
export function existingSampleLessons() {
  return REASONING_TRACKS;
}

export function existingSampleById(id: string | null | undefined) {
  if (!id) return undefined;
  return getReasoningTrack(id);
}
