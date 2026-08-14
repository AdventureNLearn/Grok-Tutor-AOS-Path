/**
 * Reach a covered industry that is not on idle by asking or naming a pack.
 * Idle stays the three first-slice combs. No fourth comb. No invented track.
 * Civic / nursing / Construction Management / Law Enforcement / Media Literacy
 * fail closed — do not sit them.
 */
import { getIndustry, INDUSTRIES } from "./industries";
import {
  FIRST_SLICE_TRACK_IDS,
  firstSliceTrackById,
  getReasoningTrack,
  learnerCombPairing,
  learnerIndustryLabel,
} from "./reasoning-tracks";

export const FAIL_CLOSED_INDUSTRY_IDS = [
  "civic-intelligence",
  "nursing",
  "construction",
  "law-enforcement",
  "media-literacy",
] as const;

export const FAIL_CLOSED_COPY =
  "This sitting does not cover that field yet.";

/** Resource-safe named packs that must be reachable (not idle). */
export const REACHABLE_NAMED_PACKS = [
  "software",
  "welding",
  "carpentry",
] as const;

export const PACK_SIT_PREFIX = "pack:" as const;

export type SitFromNamedPackOk = {
  ok: true;
  sitId: string;
  industryId: string;
  pairing: string;
  usedExistingSample: boolean;
  kind: "track" | "pack";
};

export type SitFromNamedPackFail = {
  ok: false;
  reason: "fail-closed" | "unknown" | "empty";
  message: string;
  sitId: null;
};

export type SitFromNamedPackResult = SitFromNamedPackOk | SitFromNamedPackFail;

export type SittingResolution = {
  sitId: string;
  industryId: string;
  pairing: string;
  lessonId: string | null;
  kind: "track" | "pack";
};

const FAIL_CLOSED_SET = new Set<string>(FAIL_CLOSED_INDUSTRY_IDS);

/** Jobs / structures sit the industry — never a comb per job. */
const JOB_ALIASES: Record<string, readonly string[]> = {
  electrical: [
    "200a",
    "200 a",
    "service load",
    "load calc",
    "load calculation",
    "panel schedule",
    "gfci",
    "afci",
    "breaker",
    "conduit",
    "how much power is needed",
    "safety outlets",
  ],
  plumbing: [
    "dwv",
    "p trap",
    "vent stack",
    "drain and vent",
    "finding leaks",
    "fixtures",
  ],
  hvac: [
    "refrigerant",
    "heat pump",
    "epa 608",
    "airflow",
    "licensed boundary",
    "how cooling moves heat",
  ],
  welding: [
    "stick welding",
    "wire feed",
    "mig",
    "tig",
    "smaw",
    "gmaw",
    "weld",
    "fabrication",
    "preparing the joint",
  ],
  carpentry: [
    "framing",
    "stud wall",
    "joist",
    "stringer",
    "king stud",
    "how weight travels",
    "stairs",
    "nails screws and bolts",
  ],
  software: [
    "software engineering",
    "code review",
    "system design",
    "typescript",
    "finding and fixing bugs",
    "how programs connect",
  ],
};

const FAIL_CLOSED_PHRASES: { industryId: string; phrases: readonly string[] }[] = [
  {
    industryId: "civic-intelligence",
    phrases: [
      "civic",
      "civic intelligence",
      "public information literacy",
      "claim hygiene",
      "public career",
    ],
  },
  {
    industryId: "nursing",
    phrases: ["nursing", "nurse", "nurses"],
  },
  {
    industryId: "construction",
    phrases: [
      "construction management",
      "construction mgr",
      "four-agent field",
      "four agent field",
    ],
  },
  {
    industryId: "law-enforcement",
    phrases: ["law enforcement", "law-enforcement"],
  },
  {
    industryId: "media-literacy",
    phrases: ["media literacy", "narrative analysis"],
  },
];

export function isFailClosedIndustry(id: string | null | undefined): boolean {
  return Boolean(id && FAIL_CLOSED_SET.has(id));
}

export function packSitId(industryId: string): string {
  return `${PACK_SIT_PREFIX}${industryId}`;
}

export function industryIdFromPackSit(sitId: string | null | undefined): string | null {
  if (!sitId?.startsWith(PACK_SIT_PREFIX)) return null;
  return sitId.slice(PACK_SIT_PREFIX.length) || null;
}

export function firstSliceTrackForIndustry(industryId: string) {
  for (const id of FIRST_SLICE_TRACK_IDS) {
    const t = getReasoningTrack(id);
    if (t?.industryId === industryId) return t;
  }
  return undefined;
}

function normalize(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasPhrase(hay: string, needle: string): boolean {
  const n = normalize(needle);
  if (!n) return false;
  if (n.length <= 2) return hay === n;
  if (!n.includes(" ") && n.length <= 3) {
    return new RegExp(`(?:^| )${n}(?: |$)`).test(hay);
  }
  return hay.includes(n);
}

function namesFailClosedField(q: string): boolean {
  if (FAIL_CLOSED_SET.has(q)) return true;
  for (const row of FAIL_CLOSED_PHRASES) {
    if (row.phrases.some((p) => hasPhrase(q, p))) return true;
    const ind = getIndustry(row.industryId);
    if (ind && hasPhrase(q, ind.name)) return true;
    // "construction" alone is CM — handled below so carpentry/framing can still sit.
    if (row.industryId !== "construction" && hasPhrase(q, row.industryId)) return true;
  }
  // Bare "construction" is the CM industry id — do not sit it.
  if (/(?:^| )construction(?: |$)/.test(q) && !hasPhrase(q, "carpentry") && !hasPhrase(q, "framing")) {
    return true;
  }
  return false;
}

function scoreIndustry(q: string, industryId: string): number {
  const ind = getIndustry(industryId);
  if (!ind || isFailClosedIndustry(industryId)) return 0;
  let score = 0;
  const name = normalize(ind.name);
  const id = normalize(ind.id);
  if (q === name || q === id) score = Math.max(score, 100);
  if (hasPhrase(q, ind.name)) score = Math.max(score, 90);
  if (id.length >= 3 && hasPhrase(q, ind.id)) score = Math.max(score, 80);
  for (const alias of JOB_ALIASES[industryId] ?? []) {
    if (hasPhrase(q, alias)) score = Math.max(score, 70);
  }
  for (const topic of ind.topics) {
    const t = normalize(topic);
    if (t.length >= 6 && hasPhrase(q, topic)) score = Math.max(score, 45);
  }
  return score;
}

function pickCoveredIndustry(q: string): string | null {
  let bestId: string | null = null;
  let best = 0;
  for (const ind of INDUSTRIES) {
    if (isFailClosedIndustry(ind.id)) continue;
    const s = scoreIndustry(q, ind.id);
    if (s > best) {
      best = s;
      bestId = ind.id;
    }
  }
  return best >= 45 ? bestId : null;
}

export function sittingForIndustry(industryId: string): SitFromNamedPackOk | null {
  if (isFailClosedIndustry(industryId)) return null;
  const industry = getIndustry(industryId);
  if (!industry) return null;
  const existing = firstSliceTrackForIndustry(industryId);
  if (existing) {
    return {
      ok: true,
      sitId: existing.id,
      industryId: existing.industryId,
      pairing: learnerCombPairing(existing),
      usedExistingSample: true,
      kind: "track",
    };
  }
  // No reasoning track — sit the industry as the topic. Do not invent a track.
  return {
    ok: true,
    sitId: packSitId(industryId),
    industryId,
    pairing: learnerIndustryLabel(industryId),
    usedExistingSample: false,
    kind: "pack",
  };
}

/**
 * Ask a question or name a pack. Sits a covered industry.
 * Prefer an existing first-slice sample when one exists.
 */
export function sitFromNamedPack(query: string | null | undefined): SitFromNamedPackResult {
  const q = normalize(query ?? "");
  if (!q) {
    return { ok: false, reason: "empty", message: FAIL_CLOSED_COPY, sitId: null };
  }
  if (namesFailClosedField(q)) {
    return { ok: false, reason: "fail-closed", message: FAIL_CLOSED_COPY, sitId: null };
  }
  const industryId = pickCoveredIndustry(q);
  if (!industryId) {
    return { ok: false, reason: "unknown", message: FAIL_CLOSED_COPY, sitId: null };
  }
  const sat = sittingForIndustry(industryId);
  if (!sat) {
    return { ok: false, reason: "fail-closed", message: FAIL_CLOSED_COPY, sitId: null };
  }
  return sat;
}

/** Resolve a persisted sit token (first-slice track id or pack:<industryId>). */
export function resolveSitting(id: string | null | undefined): SittingResolution | null {
  if (!id) return null;
  const track = firstSliceTrackById(id);
  if (track) {
    return {
      sitId: track.id,
      industryId: track.industryId,
      pairing: learnerCombPairing(track),
      lessonId: track.id,
      kind: "track",
    };
  }
  const fromPack = industryIdFromPackSit(id);
  const industryId = fromPack ?? (getIndustry(id) && !isFailClosedIndustry(id) ? id : null);
  if (!industryId || isFailClosedIndustry(industryId)) return null;
  const sat = sittingForIndustry(industryId);
  if (!sat) return null;
  return {
    sitId: sat.sitId,
    industryId: sat.industryId,
    pairing: sat.pairing,
    lessonId: sat.kind === "track" ? sat.sitId : null,
    kind: sat.kind,
  };
}

export function isAllowedSittingId(id: string | null | undefined): boolean {
  return Boolean(resolveSitting(id));
}
