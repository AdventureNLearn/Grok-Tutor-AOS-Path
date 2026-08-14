/**
 * Contract: 2D map paints sector layers + short-label cards.
 * Door is three. Stay-OFF get no card. Layer switch does not open /demo.
 * Card sit reuses sittingForIndustry / sitFromNamedPack.
 * Run: npx tsx scripts/assert-map-2d-layers.mts
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { assembleHiveField } from "../src/lib/hive-idle-field.ts";
import {
  DOOR_INDUSTRY_IDS,
  DOOR_LAYER_ID,
  MAP_BANNED_CARD_ACRONYMS,
  MAP_CARD_PINS,
  MAP_SECTOR_LAYERS,
  MAP_STAY_OFF_INDUSTRY_IDS,
  MAP_STAY_OFF_LABELS,
  cardsForLayer,
  doorLayerIsThree,
  mapCardDeskHref,
  mapCardNodesForLayer,
  mapCardOpensCatalog,
  mapCardPublicName,
  mapCardShortLabel,
  mapCardSitMatchesNamedPack,
  mapLayerLabels,
  mapLayerSwitchHref,
  sitFromMapCard,
  stayOffHasMapCard,
} from "../src/lib/map-2d-layers.ts";
import { isCatalogRoute } from "../src/lib/no-demo-catalog-from-hive.ts";
import { FIRST_SLICE_TRACK_IDS } from "../src/lib/reasoning-tracks.ts";
import {
  FAIL_CLOSED_COPY,
  FAIL_CLOSED_INDUSTRY_IDS,
  sittingForIndustry,
  sitFromNamedPack,
} from "../src/lib/sit-from-named-pack.ts";

const here = dirname(fileURLToPath(import.meta.url));

function src(rel: string) {
  return readFileSync(join(here, "..", rel), "utf8");
}

const EXPECTED_LAYERS = [
  "Trades & Field",
  "Health & Safety",
  "Technology",
  "Business & Ops",
  "Creative",
  "Logistics & Energy",
  "Education",
] as const;

const EXPECTED_SHORT: Record<string, string> = {
  electrical: "Electrical",
  plumbing: "Plumbing",
  hvac: "HVAC",
  welding: "Welding",
  carpentry: "Carpentry",
  cnc: "CNC",
  automotive: "Automotive",
  emt: "EMT",
  pharmacy: "Pharmacy",
  software: "Software",
  cybersecurity: "Cybersecurity",
  "it-support": "IT Support",
  data: "Data",
  quality: "Quality",
  accounting: "Accounting",
  sales: "Sales",
  "project-management": "Project",
  hospitality: "Hospitality",
  culinary: "Culinary",
  design: "Design",
  video: "Video",
  cdl: "CDL",
  aviation: "Aviation",
  energy: "Energy",
  agriculture: "Agriculture",
  logistics: "Logistics",
  teaching: "Teaching",
};

if (MAP_SECTOR_LAYERS.length !== 7) {
  throw new Error(`Expected 7 sector layers, got ${MAP_SECTOR_LAYERS.length}`);
}
if (mapLayerLabels().join("|") !== EXPECTED_LAYERS.join("|")) {
  throw new Error(`Layer names drifted: ${mapLayerLabels().join(", ")}`);
}
if (MAP_SECTOR_LAYERS.some((layer) => /public|civic/i.test(`${layer.id} ${layer.label}`))) {
  throw new Error("No Public & Civic layer");
}

if (MAP_CARD_PINS.length !== 27) {
  throw new Error(`Expected 27 cards, got ${MAP_CARD_PINS.length}`);
}
if (!doorLayerIsThree() || cardsForLayer(DOOR_LAYER_ID).length !== 3) {
  throw new Error("Door layer must be exactly three cards");
}
if (DOOR_INDUSTRY_IDS.join("|") !== "electrical|plumbing|hvac") {
  throw new Error(`Door industries were ${DOOR_INDUSTRY_IDS.join(", ")}`);
}

const layerCounts: Record<string, number> = {
  trades: 7,
  health: 2,
  tech: 4,
  business: 5,
  creative: 3,
  logistics: 5,
  education: 1,
};
for (const [id, want] of Object.entries(layerCounts)) {
  const got = cardsForLayer(id as keyof typeof layerCounts).length;
  if (got !== want) {
    throw new Error(`Layer ${id} should have ${want} cards, got ${got}`);
  }
}

if (stayOffHasMapCard()) {
  throw new Error("Stay-OFF industries must not have a map card");
}
for (const id of MAP_STAY_OFF_INDUSTRY_IDS) {
  if (mapCardShortLabel(id) || MAP_CARD_PINS.some((p) => p.industryId === id)) {
    throw new Error(`Stay-OFF ${id} leaked a card`);
  }
  const closed = sitFromMapCard(id);
  if (closed.ok || closed.message !== FAIL_CLOSED_COPY) {
    throw new Error(`Stay-OFF ${id} must fail closed on a card sit`);
  }
}
if (MAP_STAY_OFF_INDUSTRY_IDS.join("|") !== FAIL_CLOSED_INDUSTRY_IDS.join("|")) {
  throw new Error("Map stay-OFF must match ask fail-closed");
}

for (const [id, label] of Object.entries(EXPECTED_SHORT)) {
  if (mapCardShortLabel(id) !== label) {
    throw new Error(`Short label for ${id} was "${mapCardShortLabel(id)}", expected "${label}"`);
  }
}
if (mapCardShortLabel("hvac") === "HVAC/R" || mapCardShortLabel("hvac") === "HVAC / R") {
  throw new Error("HVAC card must print HVAC, not HVAC/R");
}
if (mapCardShortLabel("software") === "Software Engineering") {
  throw new Error("Software card must print Software, not Software Engineering");
}
if (mapCardShortLabel("quality") === "QA") {
  throw new Error("Quality card must print Quality, not QA");
}
if (mapCardShortLabel("project-management") === "PM") {
  throw new Error("Project card must print Project, not PM");
}
if (mapCardPublicName("software") !== "Software Engineering") {
  throw new Error("Desk public name for software must stay Software Engineering");
}
if (mapCardPublicName("quality") !== "Quality Assurance") {
  throw new Error("Desk public name for quality must stay Quality Assurance");
}
if (mapCardPublicName("project-management") !== "Project Management") {
  throw new Error("Desk public name for project must stay Project Management");
}

const cardBlob = MAP_CARD_PINS.map((p) => `${p.shortLabel} ${p.industryId}`).join(" · ");
for (const acr of MAP_BANNED_CARD_ACRONYMS) {
  if (new RegExp(`(?:^|[ ·])${acr}(?:$|[ ·])`).test(cardBlob)) {
    throw new Error(`Banned acronym ${acr} leaked onto a card`);
  }
}
for (const name of MAP_STAY_OFF_LABELS) {
  if (cardBlob.toLowerCase().includes(name.toLowerCase())) {
    throw new Error(`Stay-OFF label leaked onto a card: ${name}`);
  }
}
if (/\b(SAF|PRD|BND)\b/.test(cardBlob)) {
  throw new Error("Cards must not print SAF/PRD/BND");
}

for (const pin of MAP_CARD_PINS) {
  if (!mapCardSitMatchesNamedPack(pin.industryId)) {
    throw new Error(`Card sit for ${pin.industryId} must match sitFromNamedPack`);
  }
  const sat = sitFromMapCard(pin.industryId);
  const existing = sittingForIndustry(pin.industryId);
  if (!sat.ok || !existing || sat.sitId !== existing.sitId) {
    throw new Error(`Card sit must reuse sittingForIndustry for ${pin.industryId}`);
  }
  if (mapCardOpensCatalog(mapCardDeskHref(pin.industryId)) || isCatalogRoute(mapCardDeskHref(pin.industryId))) {
    throw new Error(`Card desk href must not be /demo or /explore (${pin.industryId})`);
  }
}
const software = sitFromMapCard("software");
if (!software.ok || software.industryId !== "software" || software.kind !== "pack") {
  throw new Error(`Software card must sit pack:software, got ${JSON.stringify(software)}`);
}
const named = sitFromNamedPack("Software Engineering");
if (!named.ok || named.sitId !== software.sitId) {
  throw new Error("Software card sit must be the same token as named-pack");
}
const electrical = sitFromMapCard("electrical");
if (!electrical.ok || electrical.sitId !== "electrical-safety-ladder" || !electrical.usedExistingSample) {
  throw new Error("Electrical card must sit the existing first-slice sample");
}

for (const layer of MAP_SECTOR_LAYERS) {
  if (mapLayerSwitchHref(layer.id) !== null) {
    throw new Error(`Layer switch for ${layer.label} must not have an href`);
  }
}
if (mapLayerSwitchHref(DOOR_LAYER_ID) !== null) {
  throw new Error("Door layer switch must not have an href");
}

const idle = assembleHiveField({
  editMode: false,
  examplesOn: false,
  sittingLessonId: software.sitId,
  attachedLensId: null,
});
if (idle.workspaces.length !== 3 || idle.skills.length || idle.industries.length) {
  throw new Error("Idle must stay three first-slice combs after a card sit");
}
const idleIds = idle.workspaces.map((n) => n.id);
const expectedIds = FIRST_SLICE_TRACK_IDS.map((id) => `lesson:${id}`);
if (idleIds.join("|") !== expectedIds.join("|")) {
  throw new Error(`Idle combs drifted: ${idleIds.join(", ")}`);
}
if (idle.workspaces.some((n) => /nursing|civic|construction/i.test(`${n.id} ${n.acr} ${n.title}`))) {
  throw new Error("Idle must not grow a stay-OFF comb");
}

const doorNodes = mapCardNodesForLayer(DOOR_LAYER_ID);
if (doorNodes.length !== 0) {
  throw new Error("Door paints idle combs, not a fourth card set");
}
const healthNodes = mapCardNodesForLayer("health");
if (healthNodes.length !== 2 || healthNodes.some((n) => /nursing/i.test(`${n.id} ${n.acr} ${n.title}`))) {
  throw new Error("Health & Safety must be EMT + Pharmacy with no Nursing card");
}
if (healthNodes.some((n) => mapCardOpensCatalog(n.href) || isCatalogRoute(n.href))) {
  throw new Error("Health cards must not link /demo or /explore");
}

const mapSrc = src("src/components/hive/hive-map-2d.tsx");
const workspaceSrc = src("src/components/hive/hive-workspace.tsx");
const CATALOG_LINK =
  /(?:to|href)=["']\/(?:demo|explore)(?:\/[^"']*)?["']|openRoute\(\s*["']\/(?:demo|explore)|href:\s*["']\/(?:demo|explore)/;
if (CATALOG_LINK.test(mapSrc)) {
  throw new Error("2D map must not link /demo or /explore");
}
if (!mapSrc.includes("MAP_SECTOR_LAYERS") || !mapSrc.includes("learnerLayers")) {
  throw new Error("2D map must mount the sector-layer switcher");
}
if (!mapSrc.includes("setLayerId") || /navigate\(|openRoute\(/.test(mapSrc)) {
  throw new Error("Layer switch must stay local — no navigate / openRoute");
}
if (!workspaceSrc.includes("sitFromMapCard") || !workspaceSrc.includes("industryIdFromMapCard")) {
  throw new Error("Card click must use the existing sit path");
}
if (/openRoute\([^)]*\/demo|navigate\([^)]*\/demo/.test(workspaceSrc)) {
  throw new Error("Card sit must not open /demo");
}
if (/tap\s+<strong[^>]*>Edit<\/strong>|tap Edit/i.test(mapSrc)) {
  throw new Error("Map layers must not add Edit chrome");
}

const chromeBlob = [mapSrc, workspaceSrc, src("src/lib/map-2d-layers.ts")].join("\n");
if (MAP_STAY_OFF_LABELS.some((name) => new RegExp(`acr:\\s*["']${name.slice(0, 3)}`, "i").test(chromeBlob))) {
  throw new Error("Stay-OFF must not get an acronym on the map");
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
  "map 2d layers ok:",
  "door",
  cardsForLayer(DOOR_LAYER_ID)
    .map((p) => p.shortLabel)
    .join(" · "),
  "·",
  MAP_CARD_PINS.length,
  "cards ·",
  MAP_SECTOR_LAYERS.length,
  "layers · sit",
  software.pairing,
);
