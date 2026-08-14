/**
 * Learner desk chrome — a comb desk is a lesson, not an operator window manager.
 * Idle header is quiet (or names the hive). Sitting rooms copy stays off idle.
 */
import {
  learnerCombPairing,
  learnerIndustryLabel,
  trackFromNodeId,
} from "./reasoning-tracks";
import type { HiveNode } from "./tutor-hive-map";

/** Operator pairing codes — never print on learner desk title / acr. */
export const OPERATOR_PAIRING_CODES = /\b(SAF|PRD|BND)\b/;

/** Sitting inventory — must not appear on idle header. */
export const SITTING_ROOMS_COPY = /\d+\s+rooms\s*·\s*this sitting only/i;

/** Window-manager status — must not appear on learner desk / idle HUD. */
export const OPENED_WINDOW_COPY = /opened window/i;
export const WINDOW_SLOT_COPY = /\b\d+\s*\/\s*10\b/;

export const OPERATOR_DESK_LAYOUT_LABELS = [
  "Tile",
  "Split H",
  "Split V",
  "Focus",
  "Cascade",
  "Max all",
  "Close all",
] as const;

/** Desk title is industry + pairing. Never SAF / PRD / BND. */
export function learnerDeskTitle(node: Pick<HiveNode, "id" | "title">): string {
  const track = trackFromNodeId(node.id);
  if (track) return learnerCombPairing(track);
  return node.title || "Desk";
}

/** Industry word only — never operator short ids. */
export function learnerDeskAcr(node: Pick<HiveNode, "id" | "acr">): string {
  const track = trackFromNodeId(node.id);
  if (track) return learnerIndustryLabel(track.industryId);
  return node.acr;
}

/** Operator DeskStage dock (Tile / Split / 1/10) — edit only. */
export function showOperatorDeskDock(editMode: boolean): boolean {
  return Boolean(editMode);
}

/**
 * Idle header meta — quiet. The h1 already names the hive.
 * Rooms / sitting inventory is sitting chrome, not idle.
 */
export function learnerIdleHeaderMeta(): string | null {
  return null;
}

/** Learner HUD never prints window-manager lastMessage. */
export function learnerStatusLastMessage(
  editMode: boolean,
  lastMessage: string | null,
): string | null {
  if (!editMode) return null;
  return lastMessage;
}

/** Pairing titles already name the industry — do not also print acr. */
export function showLearnerDeskAcr(title: string): boolean {
  return !title.includes(" / ");
}

export function leaksOperatorDeskChrome(text: string | null | undefined): boolean {
  if (!text) return false;
  return (
    OPERATOR_PAIRING_CODES.test(text) ||
    SITTING_ROOMS_COPY.test(text) ||
    OPENED_WINDOW_COPY.test(text) ||
    WINDOW_SLOT_COPY.test(text) ||
    OPERATOR_DESK_LAYOUT_LABELS.some((label) => text.includes(label))
  );
}
