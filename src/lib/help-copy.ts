/**
 * Help copy — must match idle. Home is Map-first. 3D is an optional view.
 * This sitting's fields are Electrical / Plumbing / HVAC only.
 * Do not advertise nursing / software / construction as this sitting.
 * Do not add Edit chrome here.
 */
export const HELP_SITTING_FIELDS = ["Electrical", "Plumbing", "HVAC"] as const;

export const HELP_WORK_LINE =
  "A tutor for real work on this sitting — Electrical, Plumbing, and HVAC.";

export const HELP_HIVE_BLURB =
  "a Map-first home. Click a comb to open a desk. 3D is an optional view.";

export const HELP_HIVE_LINE = `The Hive is ${HELP_HIVE_BLURB}`;

/** Same learner sentence as idle HUD. */
export const HELP_IDLE_MATCH =
  "Three first-slice lessons. Click a comb to open a desk. Path walks this sitting's seven habits.";

export const HELP_ASK_LINE =
  "Ask a question or name a covered pack to sit that field. Idle stays the three first-slice lessons.";

export const HELP_PROGRESS_LINE =
  "Progress lights when you sit a comb. It stays on this device. There is no cloud save.";

/** Where to start — hive combs, not a /demo catalog. */
export const HELP_START_HIVE =
  "Click a first-slice comb to open a desk. Electrical, Plumbing, and HVAC are this sitting.";

const OFF_SLICE_SITTING = /\b(nursing|software|construction)\b/i;
const THREE_D_HOME = /3[dD] home surface/i;

export function helpCopyLeaksOffSliceFields(text: string): boolean {
  return OFF_SLICE_SITTING.test(text);
}

export function helpCopyClaims3dHome(text: string): boolean {
  return THREE_D_HOME.test(text);
}

export function helpCopyIsMapFirst(text: string): boolean {
  return /map-first/i.test(text) && /optional/i.test(text) && !helpCopyClaims3dHome(text);
}
