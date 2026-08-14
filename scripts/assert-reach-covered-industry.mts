/**
 * Contract: ask / named pack sits a covered industry. Idle stays three
 * first-slice combs. Civic / nursing / CM / LE / media-literacy fail closed.
 * Run: npx tsx scripts/assert-reach-covered-industry.mts
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { assembleHiveField } from "../src/lib/hive-idle-field.ts";
import { helpCopyLeaksOffSliceFields, HELP_ASK_LINE } from "../src/lib/help-copy.ts";
import { planPathPlay } from "../src/lib/path-play.ts";
import {
  FIRST_SLICE_TRACK_IDS,
  firstSliceTrackById,
} from "../src/lib/reasoning-tracks.ts";
import {
  FAIL_CLOSED_COPY,
  FAIL_CLOSED_INDUSTRY_IDS,
  packSitId,
  resolveSitting,
  sitFromNamedPack,
} from "../src/lib/sit-from-named-pack.ts";
import {
  planSittingProgress,
  sittingProgressRows,
} from "../src/lib/sitting-progress.ts";

const here = dirname(fileURLToPath(import.meta.url));

function idleCount(sittingLessonId: string | null) {
  return assembleHiveField({
    editMode: false,
    examplesOn: false,
    sittingLessonId,
    attachedLensId: null,
  });
}

const coldIdle = idleCount(null);
if (coldIdle.workspaces.length !== 3 || coldIdle.skills.length || coldIdle.industries.length) {
  throw new Error("Idle must stay exactly three first-slice combs");
}
const idleIds = coldIdle.workspaces.map((n) => n.id);
const expectedIds = FIRST_SLICE_TRACK_IDS.map((id) => `lesson:${id}`);
if (idleIds.join("|") !== expectedIds.join("|")) {
  throw new Error(`Idle combs drifted: ${idleIds.join(", ")}`);
}

const software = sitFromNamedPack("Software Engineering");
if (!software.ok || software.industryId !== "software" || software.kind !== "pack") {
  throw new Error(`Software Engineering must sit the pack, got ${JSON.stringify(software)}`);
}
if (software.sitId !== packSitId("software") || software.usedExistingSample) {
  throw new Error("Software sit must not invent a reasoning track");
}
if (software.pairing !== "Software Engineering") {
  throw new Error(`Software pairing was "${software.pairing}"`);
}
if (/software-/.test(software.sitId) && !software.sitId.startsWith("pack:")) {
  throw new Error("Do not invent a software track id");
}

const welding = sitFromNamedPack("Welding & Fabrication");
if (!welding.ok || welding.industryId !== "welding" || welding.sitId !== packSitId("welding")) {
  throw new Error(`Welding must sit pack:welding, got ${JSON.stringify(welding)}`);
}

const carpentry = sitFromNamedPack("Carpentry & Framing");
if (!carpentry.ok || carpentry.industryId !== "carpentry") {
  throw new Error(`Carpentry must sit, got ${JSON.stringify(carpentry)}`);
}

const framing = sitFromNamedPack("framing");
if (!framing.ok || framing.industryId !== "carpentry") {
  throw new Error(`Framing job must sit Carpentry, got ${JSON.stringify(framing)}`);
}

const loadCalc = sitFromNamedPack("200A service load calc");
if (!loadCalc.ok || loadCalc.industryId !== "electrical" || !loadCalc.usedExistingSample) {
  throw new Error(`200A service load calc must sit Electrical sample, got ${JSON.stringify(loadCalc)}`);
}
if (loadCalc.sitId !== "electrical-safety-ladder") {
  throw new Error(`Job must sit the industry sample, not a job comb, got ${loadCalc.sitId}`);
}

for (const [label, query] of [
  ["nursing", "nursing"],
  ["civic", "civic"],
  ["public information literacy", "Public Information Literacy"],
  ["construction management", "Construction Management"],
  ["law enforcement", "Law Enforcement"],
  ["media literacy", "Media Literacy & Narrative Analysis"],
] as const) {
  const closed = sitFromNamedPack(query);
  if (closed.ok) {
    throw new Error(`${label} must fail closed, sat ${closed.sitId}`);
  }
  if (closed.message !== FAIL_CLOSED_COPY) {
    throw new Error(`${label} must use honest fail-closed copy`);
  }
}

for (const id of FAIL_CLOSED_INDUSTRY_IDS) {
  if (resolveSitting(packSitId(id)) || resolveSitting(id)) {
    throw new Error(`Fail-closed ${id} must not resolve as a sitting`);
  }
}

const unknown = sitFromNamedPack("underwater basket weaving");
if (unknown.ok || unknown.message !== FAIL_CLOSED_COPY) {
  throw new Error("Unknown fields must fail closed with the same honest copy");
}

const afterSoftware = idleCount(software.sitId);
if (afterSoftware.workspaces.length !== 3) {
  throw new Error(`Idle must stay 3 after a pack sit, got ${afterSoftware.workspaces.length}`);
}
if (afterSoftware.workspaces.some((n) => /software|welding|carpentry/i.test(`${n.id} ${n.acr}`))) {
  throw new Error("Pack sit must not add a fourth idle comb");
}

const afterElectricalAsk = idleCount(loadCalc.sitId);
if (afterElectricalAsk.workspaces.length !== 3) {
  throw new Error("Electrical ask sit must not change idle comb count");
}

const pathSoft = planPathPlay(software.sitId);
if (!pathSoft.canPlay || pathSoft.route !== "/path" || pathSoft.pairing !== "Software Engineering") {
  throw new Error(`Path THIS SITTING after software ask was ${pathSoft.pairing}`);
}
if (pathSoft.lessonId !== packSitId("software")) {
  throw new Error("Path must keep the pack sit, not invent a track");
}

const pathCivic = planPathPlay("civic-claim-hygiene");
if (pathCivic.canPlay || pathCivic.pairing) {
  throw new Error("Civic persist must still fail closed on Path");
}

const progressSoft = planSittingProgress({
  sittingLessonId: software.sitId,
  sessionCount: 0,
});
if (!progressSoft.lit || progressSoft.lessonCount < 1 || progressSoft.showUnlitCopy) {
  throw new Error("Software pack sit must light Progress");
}
if (progressSoft.sittingPairing !== "Software Engineering") {
  throw new Error(`Progress pairing was "${progressSoft.sittingPairing}"`);
}
if (progressSoft.inventedMinutes || progressSoft.inventedNotes || progressSoft.cloudSave) {
  throw new Error("Pack sit must not invent minutes, notes, or a cloud save");
}

const rows = sittingProgressRows({ sittingLessonId: software.sitId, sessions: [] });
if (rows.length !== 1 || rows[0]?.skillIds.length || rows[0]?.minutes !== null) {
  throw new Error("Pack sitting row must be honest and skill-id free");
}

const civicProgress = planSittingProgress({
  sittingLessonId: "civic-claim-hygiene",
  sessionCount: 0,
});
if (civicProgress.lit || civicProgress.sittingPairing) {
  throw new Error("Civic must not light Progress");
}

if (firstSliceTrackById("pack:software") || firstSliceTrackById("software")) {
  throw new Error("Pack sits are not first-slice tracks");
}

if (helpCopyLeaksOffSliceFields(HELP_ASK_LINE)) {
  throw new Error("Help ask line must not advertise off-slice fields as this sitting");
}

const hiveAskSrc = readFileSync(join(here, "../src/components/hive/hive-ask.tsx"), "utf8");
if (/\/demo/.test(hiveAskSrc)) {
  throw new Error("Ask must not dump the /demo catalog");
}
const workspaceSrc = readFileSync(join(here, "../src/components/hive/hive-workspace.tsx"), "utf8");
if (!workspaceSrc.includes("HiveAsk") || !workspaceSrc.includes("editMode ? null : <HiveAsk")) {
  throw new Error("Learner hive must mount ask; Edit must not be the sit path");
}
if (/SAF|PRD|BND/.test(software.pairing + welding.pairing + carpentry.pairing)) {
  throw new Error("Pack pairings must not print SAF/PRD/BND");
}

for (const name of [
  "docs/RELEASE-SPRINT-STATUS.md",
  "docs/RELEASE-HIVE-INTEGRATION.md",
]) {
  const release = readFileSync(join(here, "..", name), "utf8");
  if (!/\bHOLD\b/.test(release)) {
    throw new Error(`${name} ship flag must stay HOLD`);
  }
}

console.log(
  "reach covered industry ok:",
  software.pairing,
  "·",
  welding.pairing,
  "·",
  carpentry.pairing,
  "· job",
  loadCalc.pairing,
  "· idle",
  afterSoftware.workspaces.length,
  "· fail-closed",
  FAIL_CLOSED_COPY,
);
