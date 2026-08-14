/**
 * Contract: learner desk is a lesson, not an operator window manager.
 * Idle header is quiet — never “8 rooms · this sitting only”.
 * Run: npx tsx scripts/assert-learner-desk-chrome.mts
 */
import { assembleHiveField } from "../src/lib/hive-idle-field.ts";
import {
  learnerDeskAcr,
  learnerDeskTitle,
  learnerIdleHeaderMeta,
  learnerStatusLastMessage,
  leaksOperatorDeskChrome,
  OPERATOR_DESK_LAYOUT_LABELS,
  showLearnerDeskAcr,
  showOperatorDeskDock,
  SITTING_ROOMS_COPY,
} from "../src/lib/learner-desk-chrome.ts";
import { planPathPlay } from "../src/lib/path-play.ts";
import {
  buildFirstSliceIdleCombs,
  FIRST_SLICE_TRACK_IDS,
  firstSliceTracks,
  learnerCombPairing,
} from "../src/lib/reasoning-tracks.ts";
import { hiveHudSummary } from "../src/lib/tutor-hive-map.ts";

const EXPECTED = [
  "Electrical / Safety ladder",
  "Plumbing / Practice depth",
  "HVAC / Safety boundary",
] as const;

const tracks = firstSliceTracks();
const combs = buildFirstSliceIdleCombs();
if (tracks.length !== 3 || combs.length !== 3) {
  throw new Error(`Expected 3 first-slice combs, got tracks=${tracks.length} combs=${combs.length}`);
}

for (let i = 0; i < 3; i++) {
  const track = tracks[i]!;
  const comb = combs[i]!;
  const title = learnerDeskTitle(comb);
  const acr = learnerDeskAcr(comb);
  const want = EXPECTED[i]!;
  if (title !== want) {
    throw new Error(`Desk title for ${comb.id} was "${title}", expected "${want}"`);
  }
  if (title !== learnerCombPairing(track)) {
    throw new Error(`Desk title must be the pairing, got "${title}"`);
  }
  if (leaksOperatorDeskChrome(title) || leaksOperatorDeskChrome(acr)) {
    throw new Error(`Operator chrome leaked on desk: title="${title}" acr="${acr}"`);
  }
  if (showLearnerDeskAcr(title)) {
    throw new Error(`Pairing title "${title}" must not also print a separate acr chip`);
  }
}

const idleMeta = learnerIdleHeaderMeta();
if (idleMeta && SITTING_ROOMS_COPY.test(idleMeta)) {
  throw new Error(`Idle header must not say sitting rooms copy, got "${idleMeta}"`);
}
if (idleMeta && leaksOperatorDeskChrome(idleMeta)) {
  throw new Error(`Idle header leaked operator chrome: "${idleMeta}"`);
}

const hud = hiveHudSummary();
if (!SITTING_ROOMS_COPY.test(hud.sittingLabel)) {
  throw new Error("Operator sitting label should stay available for edit, not be deleted");
}
if ("label" in hud) {
  throw new Error("hiveHudSummary.label was sitting copy shown on idle — use sittingLabel in edit only");
}

if (showOperatorDeskDock(false)) {
  throw new Error("Learner must not see Tile / Split / 1/10 dock");
}
if (!showOperatorDeskDock(true)) {
  throw new Error("Operator edit may keep the desk dock");
}

const opened = "Opened window 1/10: Safety ladder";
if (learnerStatusLastMessage(false, opened) !== null) {
  throw new Error("Learner HUD must not print OPENED WINDOW / 1/10");
}
if (learnerStatusLastMessage(true, opened) !== opened) {
  throw new Error("Operator edit may keep window-manager status");
}
if (!leaksOperatorDeskChrome(opened)) {
  throw new Error("Opened-window status must be classified as operator chrome");
}
for (const label of OPERATOR_DESK_LAYOUT_LABELS) {
  if (!leaksOperatorDeskChrome(label)) {
    throw new Error(`Layout label "${label}" must be classified as operator chrome`);
  }
}

const idle = assembleHiveField({
  editMode: false,
  examplesOn: false,
  sittingLessonId: "hvac-safety-scenario",
  attachedLensId: null,
});
if (idle.workspaces.length !== 3) {
  throw new Error(`Idle must stay 3 first-slice combs, got ${idle.workspaces.length}`);
}
if (idle.skills.length || idle.industries.length) {
  throw new Error("Idle must not dump skills or industries");
}
const idleIds = idle.workspaces.map((n) => n.id);
const expectedIds = FIRST_SLICE_TRACK_IDS.map((id) => `lesson:${id}`);
if (idleIds.join("|") !== expectedIds.join("|")) {
  throw new Error(`Idle combs were ${idleIds.join(", ")}`);
}

const play = planPathPlay("electrical-safety-ladder");
if (play.route !== "/path") {
  throw new Error(`Path Play must stay on /path, got ${play.route}`);
}
if (play.pairing !== "Electrical / Safety ladder") {
  throw new Error(`Path Play pairing was "${play.pairing}"`);
}

console.log(
  "learner desk chrome ok:",
  EXPECTED.join(" · "),
  "· idle header quiet",
  "· dock edit-only",
  "· Path Play",
  play.route,
);
