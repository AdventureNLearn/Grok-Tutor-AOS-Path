/**
 * 2D map sector layers + short-label cards (Hive Lab #63 / #64).
 * Door / idle stays Electrical, Plumbing, HVAC. No fourth idle comb.
 * Seven named sector layers — no Public & Civic. Stay-OFF get no card.
 * Extra "All" chip paints the 27 covered cards at once (not a /demo catalog).
 * Card click sits via sittingForIndustry (same path as ask / named-pack).
 */
import { getIndustry } from "./industries";
import type { Vec3 } from "./hive-layout-shapes";
import type { HiveNode } from "./tutor-hive-map";
import {
  FAIL_CLOSED_COPY,
  FAIL_CLOSED_INDUSTRY_IDS,
  isFailClosedIndustry,
  sittingForIndustry,
  sitFromNamedPack,
  type SitFromNamedPackResult,
} from "./sit-from-named-pack";

export const DOOR_LAYER_ID = "door" as const;
export const ALL_LAYER_ID = "all" as const;

export type MapSectorLayerId =
  | "trades"
  | "health"
  | "tech"
  | "business"
  | "creative"
  | "logistics"
  | "education";

export type MapLayerId = typeof DOOR_LAYER_ID | typeof ALL_LAYER_ID | MapSectorLayerId;

/** Corpus-wide layer — not a sector, not /demo. Chip label is All. */
export const ALL_LAYER = {
  id: ALL_LAYER_ID,
  label: "All",
  color: "#e2e8f0",
} as const;

export const MAP_CARD_PREFIX = "map-card:" as const;

/** Idle / default door — first-slice trades only. */
export const DOOR_INDUSTRY_IDS = ["electrical", "plumbing", "hvac"] as const;

/** Stay-OFF: no card, no acronym. Same set as ask fail-closed. */
export const MAP_STAY_OFF_INDUSTRY_IDS = FAIL_CLOSED_INDUSTRY_IDS;

export const MAP_STAY_OFF_LABELS = [
  "Construction Management",
  "Nursing",
  "Law Enforcement",
  "Public Information Literacy",
  "Civic Intelligence",
  "Media Literacy",
] as const;

/** Banned card acronyms — stay-OFF and the #63 “not QA / not PM” pin. */
export const MAP_BANNED_CARD_ACRONYMS = [
  "QA",
  "PM",
  "CM",
  "NUR",
  "LE",
  "PIL",
  "CIV",
  "ML",
] as const;

export type MapSectorLayer = {
  id: MapSectorLayerId;
  label: string;
  color: string;
};

/** Layer names from #63 only. No Public & Civic. */
export const MAP_SECTOR_LAYERS: readonly MapSectorLayer[] = [
  { id: "trades", label: "Trades & Field", color: "#5eead4" },
  { id: "health", label: "Health & Safety", color: "#f87171" },
  { id: "tech", label: "Technology", color: "#818cf8" },
  { id: "business", label: "Business & Ops", color: "#fbbf24" },
  { id: "creative", label: "Creative", color: "#e879f9" },
  { id: "logistics", label: "Logistics & Energy", color: "#34d399" },
  { id: "education", label: "Education", color: "#a3e635" },
] as const;

export type MapCardPin = {
  industryId: string;
  shortLabel: string;
  layerId: MapSectorLayerId;
};

/**
 * 27 cards. Short label on the comb; full public name lives on the desk
 * via sittingForIndustry pairing / industries.ts name.
 */
export const MAP_CARD_PINS: readonly MapCardPin[] = [
  { industryId: "electrical", shortLabel: "Electrical", layerId: "trades" },
  { industryId: "plumbing", shortLabel: "Plumbing", layerId: "trades" },
  { industryId: "hvac", shortLabel: "HVAC", layerId: "trades" },
  { industryId: "welding", shortLabel: "Welding", layerId: "trades" },
  { industryId: "carpentry", shortLabel: "Carpentry", layerId: "trades" },
  { industryId: "cnc", shortLabel: "CNC", layerId: "trades" },
  { industryId: "automotive", shortLabel: "Automotive", layerId: "trades" },
  { industryId: "emt", shortLabel: "EMT", layerId: "health" },
  { industryId: "pharmacy", shortLabel: "Pharmacy", layerId: "health" },
  { industryId: "software", shortLabel: "Software", layerId: "tech" },
  { industryId: "cybersecurity", shortLabel: "Cybersecurity", layerId: "tech" },
  { industryId: "it-support", shortLabel: "IT Support", layerId: "tech" },
  { industryId: "data", shortLabel: "Data", layerId: "tech" },
  { industryId: "quality", shortLabel: "Quality", layerId: "business" },
  { industryId: "accounting", shortLabel: "Accounting", layerId: "business" },
  { industryId: "sales", shortLabel: "Sales", layerId: "business" },
  { industryId: "project-management", shortLabel: "Project", layerId: "business" },
  { industryId: "hospitality", shortLabel: "Hospitality", layerId: "business" },
  { industryId: "culinary", shortLabel: "Culinary", layerId: "creative" },
  { industryId: "design", shortLabel: "Design", layerId: "creative" },
  { industryId: "video", shortLabel: "Video", layerId: "creative" },
  { industryId: "cdl", shortLabel: "CDL", layerId: "logistics" },
  { industryId: "aviation", shortLabel: "Aviation", layerId: "logistics" },
  { industryId: "energy", shortLabel: "Energy", layerId: "logistics" },
  { industryId: "agriculture", shortLabel: "Agriculture", layerId: "logistics" },
  { industryId: "logistics", shortLabel: "Logistics", layerId: "logistics" },
  { industryId: "teaching", shortLabel: "Teaching", layerId: "education" },
] as const;

const PIN_BY_INDUSTRY = new Map(MAP_CARD_PINS.map((p) => [p.industryId, p]));

export function isMapSectorLayerId(id: string | null | undefined): id is MapSectorLayerId {
  return MAP_SECTOR_LAYERS.some((layer) => layer.id === id);
}

export function isMapLayerId(id: string | null | undefined): id is MapLayerId {
  return id === DOOR_LAYER_ID || id === ALL_LAYER_ID || isMapSectorLayerId(id);
}

export function getMapSectorLayer(id: MapSectorLayerId): MapSectorLayer | undefined {
  return MAP_SECTOR_LAYERS.find((layer) => layer.id === id);
}

export function mapCardId(industryId: string): string {
  return `${MAP_CARD_PREFIX}${industryId}`;
}

export function industryIdFromMapCard(id: string | null | undefined): string | null {
  if (!id?.startsWith(MAP_CARD_PREFIX)) return null;
  return id.slice(MAP_CARD_PREFIX.length) || null;
}

export function isMapLayerCardId(id: string | null | undefined): boolean {
  return Boolean(industryIdFromMapCard(id));
}

export function mapCardPin(industryId: string): MapCardPin | undefined {
  return PIN_BY_INDUSTRY.get(industryId);
}

export function mapCardShortLabel(industryId: string): string | null {
  return mapCardPin(industryId)?.shortLabel ?? null;
}

/** Full public pack name on the desk — not the short card word. */
export function mapCardPublicName(industryId: string): string | null {
  if (isFailClosedIndustry(industryId) || !mapCardPin(industryId)) return null;
  return getIndustry(industryId)?.name ?? null;
}

export function cardsForLayer(layerId: MapLayerId): MapCardPin[] {
  if (layerId === DOOR_LAYER_ID) {
    return DOOR_INDUSTRY_IDS.map((id) => PIN_BY_INDUSTRY.get(id)).filter(
      (pin): pin is MapCardPin => Boolean(pin),
    );
  }
  if (layerId === ALL_LAYER_ID) {
    return MAP_CARD_PINS.slice();
  }
  return MAP_CARD_PINS.filter((pin) => pin.layerId === layerId);
}

export function doorLayerIsThree(): boolean {
  return cardsForLayer(DOOR_LAYER_ID).length === 3;
}

/** All paints every covered card. Stay-OFF never appear. */
export function allLayerIsTwentySeven(): boolean {
  const cards = cardsForLayer(ALL_LAYER_ID);
  if (cards.length !== 27) return false;
  return !cards.some((pin) => isFailClosedIndustry(pin.industryId));
}

/** Layer chips are buttons. Switching never navigates. */
export function mapLayerSwitchHref(_layerId: MapLayerId): null {
  return null;
}

/** Card desk is a live tutor sit — not a /demo or /explore catalog. */
export function mapCardDeskHref(industryId: string): string {
  return `/tutor?industry=${encodeURIComponent(industryId)}`;
}

export function mapCardOpensCatalog(href: string | null | undefined): boolean {
  if (!href) return false;
  const path = href.split(/[?#]/)[0] ?? href;
  return path === "/demo" || path.startsWith("/demo/") || path === "/explore";
}

/**
 * Sit a sector-layer card. Same resolution as ask / named-pack.
 * Does not invent a track. Stay-OFF fail closed.
 */
export function sitFromMapCard(industryId: string): SitFromNamedPackResult {
  if (isFailClosedIndustry(industryId) || !mapCardPin(industryId)) {
    return { ok: false, reason: "fail-closed", message: FAIL_CLOSED_COPY, sitId: null };
  }
  const sat = sittingForIndustry(industryId);
  if (!sat) {
    return { ok: false, reason: "fail-closed", message: FAIL_CLOSED_COPY, sitId: null };
  }
  return sat;
}

/** Prove card sit matches the existing named-pack path for the same industry. */
export function mapCardSitMatchesNamedPack(industryId: string): boolean {
  const pin = mapCardPin(industryId);
  const industry = getIndustry(industryId);
  if (!pin || !industry) return false;
  const fromCard = sitFromMapCard(industryId);
  const fromAsk = sitFromNamedPack(industry.name);
  if (!fromCard.ok || !fromAsk.ok) return false;
  return (
    fromCard.sitId === fromAsk.sitId &&
    fromCard.industryId === fromAsk.industryId &&
    fromCard.kind === fromAsk.kind
  );
}

function honeycombAt(index: number, spacing: number): Vec3 {
  if (index === 0) return { x: 0, y: 0, z: 0 };
  let ring = 1;
  let count = 1;
  while (count + ring * 6 <= index) {
    count += ring * 6;
    ring++;
  }
  const posInRing = index - count;
  const side = Math.floor(posInRing / ring);
  const sidePos = posInRing % ring;
  const dirs: [number, number][] = [
    [1, 0],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [0, -1],
    [1, -1],
  ];
  const sideSafe = ((side % 6) + 6) % 6;
  const dir = dirs[sideSafe] ?? dirs[0]!;
  const dir2 = dirs[(sideSafe + 2) % 6] ?? dirs[0]!;
  let q = dir[0] * ring;
  let r = dir[1] * ring;
  q += dir2[0] * sidePos;
  r += dir2[1] * sidePos;
  return {
    x: spacing * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r),
    y: 0,
    z: spacing * ((3 / 2) * r),
  };
}

/**
 * Honeycomb cell size. All (27) uses a tighter pitch so the corpus
 * fits on the board above the layer switcher. Sector layers stay 2.35.
 */
export function mapCardSpacing(count: number): number {
  if (count <= 7) return 2.35;
  if (count <= 12) return 2.05;
  return 1.62;
}

export function mapCardPositions(pins: readonly MapCardPin[]): Record<string, Vec3> {
  const spacing = mapCardSpacing(pins.length);
  const out: Record<string, Vec3> = {};
  pins.forEach((pin, i) => {
    out[mapCardId(pin.industryId)] = honeycombAt(i, spacing);
  });
  return out;
}

export function mapCardNode(pin: MapCardPin): HiveNode {
  const layer = getMapSectorLayer(pin.layerId);
  const publicName = mapCardPublicName(pin.industryId) ?? pin.shortLabel;
  return {
    id: mapCardId(pin.industryId),
    kind: "industry",
    acr: pin.shortLabel,
    title: "",
    description: publicName,
    how: "Sit this covered field — same path as asking or naming a pack.",
    color: layer?.color ?? "#94a3b8",
    href: mapCardDeskHref(pin.industryId),
    meta: pin.shortLabel,
  };
}

export function mapCardNodesForLayer(layerId: MapLayerId): HiveNode[] {
  if (layerId === DOOR_LAYER_ID) return [];
  return cardsForLayer(layerId).map(mapCardNode);
}

export function stayOffHasMapCard(): boolean {
  return MAP_STAY_OFF_INDUSTRY_IDS.some((id) => Boolean(mapCardPin(id)));
}

export function mapLayerLabels(): string[] {
  return MAP_SECTOR_LAYERS.map((layer) => layer.label);
}
