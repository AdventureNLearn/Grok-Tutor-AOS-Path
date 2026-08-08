/**
 * Deep reasoning profiles — expansive multi-phase models for advanced Hive edit.
 * Educational only: teaches careful multi-layer thinking, not ops tradecraft.
 *
 * Standard shapes use short phase lists. Deep mode expands into richer
 * "universe" of checkpoints that can drive galactic-scale layouts later.
 */

import type { HiveNode } from "./tutor-hive-map";
import type { ReasoningPhase } from "./hive-layout-shapes";

export type ReasoningDepth = "standard" | "deep";

export type DeepReasoningProfile = {
  id: string;
  name: string;
  tagline: string;
  /** How this maps to a learning universe metaphor */
  universeMetaphor: string;
  phases: Omit<ReasoningPhase, "nodeIds">[];
};

/** Advanced deep-reasoning phase libraries (node binding applied at runtime) */
export const DEEP_REASONING_PROFILES: DeepReasoningProfile[] = [
  {
    id: "cosmic-claim",
    name: "Cosmic claim path",
    tagline: "From signal → structure → proof → handoff",
    universeMetaphor:
      "Like reading a sky chart: gather light, name constellations, test gravity, then share the map.",
    phases: [
      {
        id: "signal",
        label: "Gather signal",
        acr: "SIG",
        color: "#67e8f9",
        blurb: "What raw inputs do we actually have?",
      },
      {
        id: "frame",
        label: "Frame the question",
        acr: "FRM",
        color: "#a78bfa",
        blurb: "What are we trying to decide or learn?",
      },
      {
        id: "structure",
        label: "Structure the field",
        acr: "STR",
        color: "#5eead4",
        blurb: "Group ideas into stable bodies (claims, options, unknowns).",
      },
      {
        id: "gravity",
        label: "Test gravity",
        acr: "GRV",
        color: "#fbbf24",
        blurb: "Which claims pull weight? What evidence holds?",
      },
      {
        id: "orbit",
        label: "Check orbits",
        acr: "ORB",
        color: "#f472b6",
        blurb: "Dependencies, tradeoffs, and what moves together.",
      },
      {
        id: "anomaly",
        label: "Hunt anomalies",
        acr: "ANM",
        color: "#fb7185",
        blurb: "Where does the model break or drift?",
      },
      {
        id: "synthesis",
        label: "Synthesize",
        acr: "SYN",
        color: "#4ade80",
        blurb: "One coherent story with labeled uncertainty.",
      },
      {
        id: "handoff",
        label: "Clean handoff",
        acr: "HND",
        color: "#94a3b8",
        blurb: "What can leave the desk honestly?",
      },
    ],
  },
  {
    id: "galactic-build",
    name: "Galactic build loop",
    tagline: "Brief → architecture → forge → QA → repair → launch",
    universeMetaphor:
      "Like building a small solar system: brief the star, plan orbits, forge planets, then QA the gravity.",
    phases: [
      {
        id: "brief-star",
        label: "Brief the star",
        acr: "BST",
        color: "#fde68a",
        blurb: "Compact intent: size, bodies, critical dims.",
      },
      {
        id: "plan-orbits",
        label: "Plan orbits",
        acr: "ORB",
        color: "#93c5fd",
        blurb: "Feature order and acceptance checks before code.",
      },
      {
        id: "forge",
        label: "Forge bodies",
        acr: "FRG",
        color: "#5eead4",
        blurb: "Implement geometry / craft with controlled steps.",
      },
      {
        id: "qa-lenses",
        label: "Dual lenses",
        acr: "QA",
        color: "#c4b5fd",
        blurb: "Topology + numeric checks; route by error type.",
      },
      {
        id: "repair-loop",
        label: "Repair loop",
        acr: "RPR",
        color: "#fb923c",
        blurb: "Targeted fix with evidence — or halt on fatal.",
      },
      {
        id: "launch",
        label: "Launch check",
        acr: "LCH",
        color: "#4ade80",
        blurb: "Orientation, clearances, clean deliverable.",
      },
    ],
  },
];

export function getDeepProfile(id: string): DeepReasoningProfile {
  return (
    DEEP_REASONING_PROFILES.find((p) => p.id === id) ??
    DEEP_REASONING_PROFILES[0]!
  );
}

/**
 * Bind deep phases onto live nodes (round-robin by kind for a full-sky feel).
 */
export function buildDeepPhases(
  profileId: string,
  workspaces: HiveNode[],
  skills: HiveNode[],
  industries: HiveNode[],
): ReasoningPhase[] {
  const profile = getDeepProfile(profileId);
  const pool = [
    ...workspaces.map((n) => n.id),
    ...industries.map((n) => n.id),
    ...skills.map((n) => n.id),
  ];
  const n = Math.max(1, profile.phases.length);
  return profile.phases.map((p, i) => {
    const nodeIds: string[] = [];
    // Each phase lights a band of the pool + anchors a workspace when available
    for (let k = i; k < pool.length; k += n) {
      const id = pool[k];
      if (id) nodeIds.push(id);
    }
    if (workspaces[i % Math.max(1, workspaces.length)]) {
      const wid = workspaces[i % workspaces.length]!.id;
      if (!nodeIds.includes(wid)) nodeIds.unshift(wid);
    }
    return { ...p, nodeIds };
  });
}
