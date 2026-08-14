/**
 * Contract: Path Play stays on /path and walks THIS sitting's seven habits.
 * Idle field stays three first-slice combs even when a lesson is sitting.
 * Run: npx tsx scripts/assert-path-play.mts
 */
import { assembleHiveField } from "../src/lib/hive-idle-field.ts";
import { planPathPlay, PATH_PLAY_ROUTE } from "../src/lib/path-play.ts";
import { FIRST_SLICE_TRACK_IDS } from "../src/lib/reasoning-tracks.ts";
import { FROZEN_HABITS } from "../src/lib/suite-rooms.ts";

const HABITS = [
  "Notice",
  "Name the claim",
  "What would count",
  "One better question",
  "Small check",
  "Stop",
  "Carry forward",
] as const;

if (FROZEN_HABITS.length !== 7) {
  throw new Error(`Expected 7 frozen habits, got ${FROZEN_HABITS.length}`);
}
for (let i = 0; i < HABITS.length; i++) {
  if (FROZEN_HABITS[i] !== HABITS[i]) {
    throw new Error(`Habit ${i} is "${FROZEN_HABITS[i]}", expected "${HABITS[i]}"`);
  }
}

const electrical = planPathPlay("electrical-safety-ladder");
if (electrical.route !== PATH_PLAY_ROUTE || electrical.route !== "/path") {
  throw new Error(`Play must stay on /path, got ${electrical.route}`);
}
if (electrical.lessonId !== "electrical-safety-ladder") {
  throw new Error(`Play must keep THIS sitting (electrical), got ${electrical.lessonId}`);
}
if (electrical.pairing !== "Electrical / Safety ladder") {
  throw new Error(`Electrical sitting pairing was "${electrical.pairing}"`);
}
if (electrical.habits.join("|") !== HABITS.join("|")) {
  throw new Error("Play must walk the seven frozen habits in order");
}
if (!electrical.canPlay) {
  throw new Error("Electrical sitting must be playable");
}

const none = planPathPlay(null);
if (none.lessonId !== null || none.canPlay) {
  throw new Error("No sitting must not invent a different comb");
}
if (none.route !== "/path") {
  throw new Error("Even without a sitting, Play must not dump to hive home");
}

const hvac = planPathPlay("hvac-safety-scenario");
if (hvac.lessonId !== "hvac-safety-scenario") {
  throw new Error(`HVAC sitting must stay HVAC, got ${hvac.lessonId}`);
}
if (hvac.pairing !== "HVAC / Safety boundary") {
  throw new Error(`HVAC pairing was "${hvac.pairing}"`);
}

// Idle field: persisted / sitting HVAC must not replace Electrical with Safety boundary
const idleWithHvacSit = assembleHiveField({
  editMode: false,
  examplesOn: false,
  sittingLessonId: "hvac-safety-scenario",
  attachedLensId: "evidence",
});
if (idleWithHvacSit.workspaces.length !== 3) {
  throw new Error(
    `Idle must stay 3 first-slice combs when a lesson is sitting, got ${idleWithHvacSit.workspaces.length}`,
  );
}
if (idleWithHvacSit.skills.length || idleWithHvacSit.industries.length) {
  throw new Error("Idle must not dump skills or industries onto learner hexes");
}
const idleIds = idleWithHvacSit.workspaces.map((n) => n.id);
const expectedIds = FIRST_SLICE_TRACK_IDS.map((id) => `lesson:${id}`);
if (idleIds.join("|") !== expectedIds.join("|")) {
  throw new Error(`Idle combs were ${idleIds.join(", ")}, expected ${expectedIds.join(", ")}`);
}
const leak = /\b(SAF|PRD|BND)\b/;
for (const n of idleWithHvacSit.workspaces) {
  const surface = [n.acr, n.title, n.meta].join(" · ");
  if (leak.test(surface)) {
    throw new Error(`Operator code leaked on idle comb: ${surface}`);
  }
}

const coldIdle = assembleHiveField({
  editMode: false,
  examplesOn: false,
  sittingLessonId: null,
  attachedLensId: null,
});
if (coldIdle.workspaces.length !== 3) {
  throw new Error(`Fresh idle must be 3 combs, got ${coldIdle.workspaces.length}`);
}

console.log(
  "path play + idle field ok:",
  electrical.pairing,
  "stays on",
  electrical.route,
  "· idle",
  idleWithHvacSit.workspaces.map((n) => `${n.acr} / ${n.title}`).join(" · "),
);
