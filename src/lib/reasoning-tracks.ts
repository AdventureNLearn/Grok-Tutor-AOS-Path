/**
 * Flagship example-reasoning lessons — the Hive's primary teaching field.
 * Each track is a real sample lesson bound to a reasoning shape (lens).
 * Bodies live at /corpus/reasoning-tracks/<id>/lesson.md (offline).
 */
import type { HiveShapeId } from "./hive-layout-shapes";
import type { HiveNode } from "./tutor-hive-map";

export type ReasoningTrack = {
  id: string;
  title: string;
  /** Short comb label */
  combTitle: string;
  acr: string;
  color: string;
  industryId: string;
  hiveShape: Exclude<HiveShapeId, "custom">;
  summary: string;
};

export const REASONING_TRACKS: ReasoningTrack[] = [
  {
    id: "civic-claim-hygiene",
    title: "Public information literacy — claim hygiene path",
    combTitle: "Claim hygiene",
    acr: "CLM",
    color: "#4ade80",
    industryId: "civic-intelligence",
    hiveShape: "integrity-triangle",
    summary: "Separate evidence, inference, and assumption before acting on a public claim.",
  },
  {
    id: "electrical-safety-ladder",
    title: "Electrical — safety-first learning ladder",
    combTitle: "Safety ladder",
    acr: "SAF",
    color: "#c4b5fd",
    industryId: "electrical",
    hiveShape: "spine",
    summary: "Frame → evidence → path → practice → honest handoff on a high-stakes trade.",
  },
  {
    id: "four-agent-field-ops",
    title: "Multi-role field thinking — four-agent style",
    combTitle: "Four-agent field",
    acr: "4AG",
    color: "#60a5fa",
    industryId: "construction",
    hiveShape: "four-agent",
    summary: "Same jobsite question through architect, builder, critic, and integrator lanes.",
  },
  {
    id: "plumbing-practice-depth",
    title: "Plumbing — practice and on-the-job depth",
    combTitle: "Practice depth",
    acr: "PRD",
    color: "#5eead4",
    industryId: "plumbing",
    hiveShape: "sense-orbit",
    summary: "Sense the site, reason the fault, then build the repair — not guess-and-cut.",
  },
  {
    id: "public-career-onboarding",
    title: "Public information literacy — first 90 days path",
    combTitle: "First 90 days",
    acr: "90D",
    color: "#f472b6",
    industryId: "civic-intelligence",
    hiveShape: "spine",
    summary: "Onboarding as a spine: frame the role, check sources, pick a lane, practice, deliver.",
  },
  {
    id: "hvac-safety-scenario",
    title: "HVAC — safety and licensed-boundary awareness",
    combTitle: "Safety boundary",
    acr: "BND",
    color: "#f0abfc",
    industryId: "hvac",
    hiveShape: "claim-diamond",
    summary: "Score what is supported, unproven, or disputed — human call at the licensed edge.",
  },
];

export function getReasoningTrack(id: string): ReasoningTrack | undefined {
  return REASONING_TRACKS.find((t) => t.id === id);
}

export function lessonHref(id: string): string {
  return `/demo/reason/${id}`;
}

export function lessonNodeId(id: string): string {
  return `lesson:${id}`;
}

export function trackFromNodeId(nodeId: string): ReasoningTrack | undefined {
  if (!nodeId.startsWith("lesson:")) return undefined;
  return getReasoningTrack(nodeId.slice("lesson:".length));
}

export function buildReasoningLessonCombs(): HiveNode[] {
  return REASONING_TRACKS.map((t) => ({
    id: lessonNodeId(t.id),
    kind: "workspace",
    acr: t.acr,
    title: t.combTitle,
    description: t.summary,
    how: `Open this sample through the ${shapeLabel(t.hiveShape)} lens — then switch lenses to see how the same catalog remaps.`,
    color: t.color,
    href: lessonHref(t.id),
    meta: `Example · ${shapeLabel(t.hiveShape)}`,
  }));
}

export function tracksForShape(shapeId: string): ReasoningTrack[] {
  if (shapeId === "honeycomb") return REASONING_TRACKS;
  return REASONING_TRACKS.filter((t) => t.hiveShape === shapeId);
}

export function lessonIdsForShape(shapeId: string): string[] {
  return tracksForShape(shapeId).map((t) => lessonNodeId(t.id));
}

/** Lenses that already have a flagship example (plus Honeycomb = all). */
export const EXAMPLE_LENSES: { id: Exclude<HiveShapeId, "custom">; name: string }[] =
  [
    { id: "honeycomb", name: "All examples" },
    { id: "integrity-triangle", name: "Integrity" },
    { id: "spine", name: "Spine" },
    { id: "claim-diamond", name: "Claim diamond" },
    { id: "sense-orbit", name: "Sense→Build" },
    { id: "four-agent", name: "Four-agent" },
    { id: "lpin-helix", name: "Field helix" },
    { id: "star-burst", name: "Star burst" },
  ];

function shapeLabel(id: ReasoningTrack["hiveShape"]): string {
  switch (id) {
    case "integrity-triangle":
      return "Integrity Triangle";
    case "spine":
      return "Mission Spine";
    case "claim-diamond":
      return "Claim Diamond";
    case "sense-orbit":
      return "Sense → Reason → Build";
    case "four-agent":
      return "Four-agent";
    case "lpin-helix":
      return "Field Helix";
    case "star-burst":
      return "Star Burst";
    default:
      return "Honeycomb";
  }
}
