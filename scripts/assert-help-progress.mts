/**
 * Contract: Help is Map-first (not “3D home”). This sitting is Electrical /
 * Plumbing / HVAC. Progress lights after a first-slice sit. No fake minutes,
 * notes, or cloud save.
 * Run: npx tsx scripts/assert-help-progress.mts
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  HELP_ASK_LINE,
  HELP_HIVE_LINE,
  HELP_IDLE_MATCH,
  HELP_PROGRESS_LINE,
  HELP_SITTING_FIELDS,
  HELP_WORK_LINE,
  helpCopyClaims3dHome,
  helpCopyIsMapFirst,
  helpCopyLeaksOffSliceFields,
} from "../src/lib/help-copy.ts";
import { assembleHiveField } from "../src/lib/hive-idle-field.ts";
import { planPathPlay } from "../src/lib/path-play.ts";
import {
  FIRST_SLICE_TRACK_IDS,
  firstSliceTracks,
  learnerCombPairing,
} from "../src/lib/reasoning-tracks.ts";
import {
  PROGRESS_SITTING_COPY,
  PROGRESS_UNLIT_COPY,
  planSittingProgress,
  sittingProgressRows,
} from "../src/lib/sitting-progress.ts";
import type { SessionRecord } from "../src/lib/store.ts";

const here = dirname(fileURLToPath(import.meta.url));
const helpSrc = readFileSync(join(here, "../src/routes/help.tsx"), "utf8");
const progressSrc = readFileSync(join(here, "../src/routes/progress.tsx"), "utf8");

if (HELP_SITTING_FIELDS.join("|") !== "Electrical|Plumbing|HVAC") {
  throw new Error(`Sitting fields were ${HELP_SITTING_FIELDS.join(", ")}`);
}
if (!helpCopyIsMapFirst(HELP_HIVE_LINE)) {
  throw new Error(`Help hive line must be Map-first, got "${HELP_HIVE_LINE}"`);
}
if (helpCopyClaims3dHome(HELP_HIVE_LINE) || helpCopyClaims3dHome(helpSrc)) {
  throw new Error("Help must not call The Hive a 3D home surface");
}
if (
  helpCopyLeaksOffSliceFields(HELP_WORK_LINE) ||
  helpCopyLeaksOffSliceFields(helpSrc)
) {
  throw new Error("Help must not list nursing / software / construction as this sitting");
}
if (!helpSrc.includes(HELP_HIVE_LINE) && !helpSrc.includes("HELP_HIVE_LINE") && !helpSrc.includes("HELP_HIVE_BLURB")) {
  throw new Error("Help page must use the Map-first hive copy");
}
if (!helpSrc.includes("HELP_WORK_LINE") || !helpSrc.includes("HELP_IDLE_MATCH")) {
  throw new Error("Help page must use sitting-field + idle-match copy");
}
if (!helpSrc.includes("HELP_ASK_LINE")) {
  throw new Error("Help must mention ask / named pack without adding an idle comb");
}
if (helpCopyLeaksOffSliceFields(HELP_ASK_LINE)) {
  throw new Error("Ask copy must not list nursing / software / construction as this sitting");
}
if (!helpSrc.includes("HELP_PROGRESS_LINE")) {
  throw new Error("Help Progress step must use honest sitting-light copy");
}
if (/tap\s+<strong[^>]*>Edit<\/strong>|tap Edit/i.test(helpSrc)) {
  throw new Error("Help must not add Edit chrome");
}
if (!HELP_IDLE_MATCH.includes("Click a comb to open a desk")) {
  throw new Error("Help idle match must stay aligned with hive HUD");
}
if (!HELP_PROGRESS_LINE.toLowerCase().includes("no cloud save")) {
  throw new Error("Help must not invent a cloud save");
}

const cold = planSittingProgress({ sittingLessonId: null, sessionCount: 0 });
if (cold.lit || cold.lessonCount !== 0 || !cold.showUnlitCopy) {
  throw new Error("Honest empty is only before a sit — cold progress must stay unlit");
}
if (!PROGRESS_UNLIT_COPY.includes("has not lit a comb yet")) {
  throw new Error("Unlit copy must keep the honest empty sentence");
}
if (cold.inventedMinutes || cold.inventedNotes || cold.cloudSave) {
  throw new Error("Cold progress must not invent minutes, notes, or a cloud save");
}

const civic = planSittingProgress({
  sittingLessonId: "civic-claim-hygiene",
  sessionCount: 0,
});
if (civic.lit || civic.lessonCount !== 0 || civic.sittingPairing) {
  throw new Error("Civic persist must not light Progress");
}

for (const id of FIRST_SLICE_TRACK_IDS) {
  const lit = planSittingProgress({ sittingLessonId: id, sessionCount: 0 });
  if (!lit.lit || lit.lessonCount < 1 || lit.showUnlitCopy) {
    throw new Error(`Sitting ${id} must light Progress with lesson count >= 1`);
  }
  if (!lit.sittingPairing) {
    throw new Error(`Sitting ${id} must name the pairing`);
  }
  if (lit.inventedMinutes || lit.inventedNotes || lit.cloudSave) {
    throw new Error(`Sitting ${id} must not invent minutes, notes, or a cloud save`);
  }
  if (helpCopyLeaksOffSliceFields(lit.sittingPairing)) {
    throw new Error(`Sitting pairing leaked off-slice: ${lit.sittingPairing}`);
  }
}

const electrical = planSittingProgress({
  sittingLessonId: "electrical-safety-ladder",
  sessionCount: 0,
});
if (electrical.sittingPairing !== "Electrical / Safety ladder") {
  throw new Error(`Electrical sitting pairing was "${electrical.sittingPairing}"`);
}
if (!PROGRESS_SITTING_COPY.includes("This sitting has a lesson")) {
  throw new Error("Lit Progress must say this sitting has a lesson");
}

const rows = sittingProgressRows({
  sittingLessonId: "plumbing-practice-depth",
  sessions: [],
});
if (rows.length !== 1 || rows[0]?.source !== "sitting") {
  throw new Error("Plumbing sit with no Learn session must still show one honest sitting row");
}
if (rows[0]?.minutes !== null) {
  throw new Error("Sitting row must not invent minutes");
}
if (rows[0]?.skillIds.length) {
  throw new Error("Sitting row must not print skill IDs");
}
if (rows[0]?.industryName !== "Plumbing / Practice depth") {
  throw new Error(`Plumbing sitting row was "${rows[0]?.industryName}"`);
}

const recorded: SessionRecord[] = [
  {
    id: "sess-1",
    industryId: "electrical",
    industryName: "Electrical",
    level: "beginner",
    mode: "explain",
    skillIds: ["evidence-gate"],
    messages: [],
    minutes: 0,
    createdAt: 1,
    updatedAt: 1,
  },
];
const withSession = planSittingProgress({
  sittingLessonId: "electrical-safety-ladder",
  sessionCount: recorded.length,
});
if (withSession.lessonCount < 1) {
  throw new Error("Recorded lesson plus sit must stay lit");
}
const sessionRows = sittingProgressRows({
  sittingLessonId: "electrical-safety-ladder",
  sessions: recorded,
});
if (sessionRows.some((r) => r.source === "sitting" && r.skillIds.length)) {
  throw new Error("Do not add skill IDs on a sitting row");
}

if (!progressSrc.includes("planSittingProgress") || !progressSrc.includes("sitting.lessonCount")) {
  throw new Error("Progress page must light from sitting, not only Learn sessions");
}
if (!progressSrc.includes("PROGRESS_UNLIT_COPY")) {
  throw new Error("Progress empty copy must stay gated on unlit");
}

const tracks = firstSliceTracks();
if (tracks.length !== 3) {
  throw new Error(`First-slice tracks drifted, got ${tracks.length}`);
}
const idle = assembleHiveField({
  editMode: false,
  examplesOn: false,
  sittingLessonId: "hvac-safety-scenario",
  attachedLensId: null,
});
if (idle.workspaces.length !== 3 || idle.skills.length || idle.industries.length) {
  throw new Error("Idle field must still be three first-slice combs with no skill dump");
}
const play = planPathPlay("electrical-safety-ladder");
if (play.route !== "/path" || play.pairing !== learnerCombPairing(tracks[0]!)) {
  throw new Error("Path Play contract must still hold");
}

console.log(
  "help + progress chrome ok:",
  HELP_SITTING_FIELDS.join(" · "),
  "·",
  HELP_HIVE_LINE,
  "· sit lights",
  electrical.lessonCount,
  "lesson · Path",
  play.route,
);
