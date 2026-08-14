/**
 * Contract: learner hive does not open a catalog that lists stay-OFF fields.
 * Samples / Industries / Help / first-run stay off /demo and /explore.
 * Run: npx tsx scripts/assert-no-demo-catalog-from-hive.mts
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { industryDemoIndex } from "../src/lib/demo-lessons.ts";
import { assembleHiveField } from "../src/lib/hive-idle-field.ts";
import { helpCopyLeaksOffSliceFields } from "../src/lib/help-copy.ts";
import {
  CATALOG_ROUTES,
  LEARNER_NAV,
  STAY_OFF_INDUSTRY_IDS,
  catalogMayListIndustry,
  filterStayOffFromCatalog,
  isCatalogRoute,
  learnerChromeOpensCatalog,
  learnerVisibleIndustries,
  stayOffListedIn,
} from "../src/lib/no-demo-catalog-from-hive.ts";
import { FIRST_SLICE_TRACK_IDS } from "../src/lib/reasoning-tracks.ts";
import {
  FAIL_CLOSED_COPY,
  sitFromNamedPack,
} from "../src/lib/sit-from-named-pack.ts";

const here = dirname(fileURLToPath(import.meta.url));

function src(rel: string) {
  return readFileSync(join(here, "..", rel), "utf8");
}

const CATALOG_LINK = /(?:to|href)=["']\/(?:demo|explore)(?:\/[^"']*)?["']|openRoute\(\s*["']\/(?:demo|explore)|href:\s*["']\/(?:demo|explore)/;

const layoutSrc = src("src/components/layout.tsx");
const helpSrc = src("src/routes/help.tsx");
const coachSrc = src("src/components/hive/first-run-coach.tsx");
const hiveAskSrc = src("src/components/hive/hive-ask.tsx");
const demoIndexSrc = src("src/routes/demo.index.tsx");
const exploreSrc = src("src/routes/explore.tsx");

if (LEARNER_NAV.some((item) => learnerChromeOpensCatalog(item.href))) {
  throw new Error("Learner nav must not include /demo or /explore");
}
if (LEARNER_NAV.some((item) => /samples|industries/i.test(item.label) && isCatalogRoute(item.href))) {
  throw new Error("Samples / Industries must not be catalog doors");
}
for (const item of LEARNER_NAV) {
  if (item.href === "/demo" || item.href === "/explore") {
    throw new Error(`Learner nav still opens catalog: ${item.label} → ${item.href}`);
  }
}

if (CATALOG_LINK.test(layoutSrc)) {
  throw new Error("Topbar / learner layout must not link to /demo or /explore");
}
if (!layoutSrc.includes("LEARNER_NAV")) {
  throw new Error("Layout must use LEARNER_NAV (no Samples → /demo, no Industries → /explore)");
}

if (CATALOG_LINK.test(helpSrc) || /Browse samples/.test(helpSrc)) {
  throw new Error("Help must not send learners to /demo or /explore");
}
if (!helpSrc.includes("HELP_START_HIVE") || !helpSrc.includes('to="/"')) {
  throw new Error("Help start must stay on the hive");
}
if (helpCopyLeaksOffSliceFields(helpSrc) || stayOffListedIn(helpSrc)) {
  throw new Error("Help must not list stay-OFF fields");
}

if (CATALOG_LINK.test(coachSrc) || /Open Samples/.test(coachSrc) || /openRoute\(/.test(coachSrc)) {
  throw new Error("First-run must not open /demo or /explore");
}
if (!coachSrc.includes("Start on the hive")) {
  throw new Error("First-run last step must stay on the hive");
}

if (/openRoute\([^)]*\/demo|navigate\([^)]*\/demo|to=["']\/demo|href=["']\/demo/.test(hiveAskSrc)) {
  throw new Error("Ask must still stay off the /demo catalog");
}

for (const name of CATALOG_ROUTES) {
  if (!isCatalogRoute(name)) {
    throw new Error(`${name} must be classified as a catalog route`);
  }
}
if (isCatalogRoute("/") || isCatalogRoute("/tutor") || isCatalogRoute("/path") || isCatalogRoute("/help")) {
  throw new Error("Hive / Learn / Path / Help are not catalog routes");
}

const listed = filterStayOffFromCatalog(industryDemoIndex());
for (const id of STAY_OFF_INDUSTRY_IDS) {
  if (listed.some((row) => row.industry.id === id)) {
    throw new Error(`Stay-OFF ${id} must not appear in the learner catalog index`);
  }
  if (catalogMayListIndustry(id)) {
    throw new Error(`Stay-OFF ${id} must not be listable`);
  }
}
const visible = learnerVisibleIndustries();
for (const id of STAY_OFF_INDUSTRY_IDS) {
  if (visible.some((ind) => ind.id === id)) {
    throw new Error(`Stay-OFF ${id} leaked into learner-visible industries`);
  }
}
if (!demoIndexSrc.includes("filterStayOffFromCatalog")) {
  throw new Error("/demo index must filter stay-OFF fields");
}
if (!exploreSrc.includes("learnerVisibleIndustries")) {
  throw new Error("/explore must filter stay-OFF fields");
}

const idle = assembleHiveField({
  editMode: false,
  examplesOn: false,
  sittingLessonId: null,
  attachedLensId: null,
});
if (idle.workspaces.length !== 3 || idle.skills.length || idle.industries.length) {
  throw new Error("Idle must stay exactly three first-slice combs");
}
const idleIds = idle.workspaces.map((n) => n.id);
const expectedIds = FIRST_SLICE_TRACK_IDS.map((id) => `lesson:${id}`);
if (idleIds.join("|") !== expectedIds.join("|")) {
  throw new Error(`Idle combs drifted: ${idleIds.join(", ")}`);
}
if (idle.workspaces.some((n) => stayOffListedIn(`${n.id} ${n.acr} ${n.title} ${n.meta}`))) {
  throw new Error("Idle chrome must not list stay-OFF fields");
}

const software = sitFromNamedPack("Software Engineering");
if (!software.ok || software.industryId !== "software") {
  throw new Error("Sit-from-named-pack must still sit Software Engineering");
}
const civic = sitFromNamedPack("civic");
if (civic.ok || civic.message !== FAIL_CLOSED_COPY) {
  throw new Error("Civic must still fail closed");
}

const chromeBlob = [layoutSrc, helpSrc, coachSrc].join("\n");
if (/\b(SAF|PRD|BND)\b/.test(chromeBlob)) {
  throw new Error("Learner chrome must not print SAF/PRD/BND");
}
if (/tap\s+<strong[^>]*>Edit<\/strong>|tap Edit/i.test(helpSrc)) {
  throw new Error("Help must not add Edit chrome");
}

for (const name of [
  "docs/RELEASE-SPRINT-STATUS.md",
  "docs/RELEASE-HIVE-INTEGRATION.md",
]) {
  const release = src(name);
  if (!/\bHOLD\b/.test(release)) {
    throw new Error(`${name} ship flag must stay HOLD`);
  }
}

console.log(
  "no demo catalog from hive ok:",
  LEARNER_NAV.map((n) => n.label).join(" · "),
  "· stay-OFF filtered",
  STAY_OFF_INDUSTRY_IDS.length,
  "· idle",
  idle.workspaces.length,
  "· sit",
  software.pairing,
);
