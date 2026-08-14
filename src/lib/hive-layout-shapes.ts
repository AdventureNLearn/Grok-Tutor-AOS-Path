/**
 * Intelligent hive shapes — 3D comb layouts that teach careful thinking
 * (spine, integrity triangle, sense→reason→build, etc.).
 * Each comb remains a node; shapes only reposition them for insight.
 * Public labels stay educational — no ops skill brands or place-specific work.
 */

import type { HiveNode } from "./tutor-hive-map";
import {
  IND_Y,
  IND_Y_JITTER,
  SK_Y,
  SK_Y_JITTER,
  WS_Y,
  WS_Y_JITTER,
  deoverlapPositions,
  packSpacing,
  tierRadialBias,
} from "./hive-pack";
import {
  collisionRadiusForNode,
  type HiveNodeStyle,
} from "./hive-node-style";

export type Vec3 = { x: number; y: number; z: number };

export type HiveShapeId =
  | "honeycomb"
  | "spine"
  | "integrity-triangle"
  | "claim-diamond"
  | "sense-orbit"
  | "four-agent"
  | "lpin-helix"
  | "star-burst"
  | "custom";

export type ReasoningPhase = {
  id: string;
  label: string;
  acr: string;
  color: string;
  /** Node ids that light up in this phase */
  nodeIds: string[];
  blurb: string;
};

export type OrchestrationEdge = {
  from: string;
  to: string;
  kind: "flow" | "gate" | "sense" | "deliver";
};

export type HiveShapeDef = {
  id: HiveShapeId;
  name: string;
  tagline: string;
  /** Maps AOS / LPIN reasoning doctrine */
  doctrine: string;
  phases: ReasoningPhase[];
};

function honeycombPosition(index: number, spacing: number) {
  if (index === 0) return { q: 0, r: 0, x: 0, z: 0 };
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
  const x = spacing * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const z = spacing * ((3 / 2) * r);
  return { q, r, x, z };
}

function ringSkip(ringOffset: number) {
  let skip = 0;
  for (let r = 0; r < ringOffset; r++) skip += r === 0 ? 1 : r * 6;
  return skip;
}

function honey(index: number, spacing: number, y: number, jitter = 0): Vec3 {
  const h = honeycombPosition(index, spacing);
  const yj =
    jitter !== 0
      ? ((h.q * 0.05 + h.r * 0.04) % jitter) - jitter * 0.35
      : 0;
  return { x: h.x, y: y + yj, z: h.z };
}

export const HIVE_SHAPES: HiveShapeDef[] = [
  {
    id: "honeycomb",
    name: "Honeycomb",
    tagline: "Default field — equal combs, open exploration",
    doctrine: "Browse-first catalog. No forced reasoning order.",
    phases: [
      {
        id: "explore",
        label: "Explore",
        acr: "EXP",
        color: "#a78bfa",
        nodeIds: [],
        blurb: "Learner chooses craft, tools, and mode freely.",
      },
    ],
  },
  {
    id: "spine",
    name: "Mission Spine",
    tagline: "Frame → Evidence → Route → Practice → Deliver",
    doctrine:
      "Educational flow: clear framing · evidence check · pick a mode · practice the craft · honest handoff.",
    phases: [
      {
        id: "sl",
        label: "Clear frame",
        acr: "FRM",
        color: "#c4b5fd",
        nodeIds: [],
        blurb: "Frame stakes, values, and stop conditions.",
      },
      {
        id: "eg",
        label: "Evidence check",
        acr: "EVD",
        color: "#5eead4",
        nodeIds: [],
        blurb: "Label claims Evidence / Inference / Assumption.",
      },
      {
        id: "orch",
        label: "Pick a path",
        acr: "PTH",
        color: "#60a5fa",
        nodeIds: [],
        blurb: "Route to the right desk and mode.",
      },
      {
        id: "desk",
        label: "Craft desk",
        acr: "DSK",
        color: "#fbbf24",
        nodeIds: [],
        blurb: "Trade, study, or content work on the craft.",
      },
      {
        id: "deliver",
        label: "Deliver",
        acr: "DLV",
        color: "#4ade80",
        nodeIds: [],
        blurb: "Package honest outputs — human final call.",
      },
    ],
  },
  {
    id: "integrity-triangle",
    name: "Integrity Triangle",
    tagline: "Evidence · Inference · Assumption",
    doctrine: "Every claim sits on one basis kind — keep them separate.",
    phases: [
      {
        id: "evidence",
        label: "Evidence",
        acr: "EVD",
        color: "#4ade80",
        nodeIds: [],
        blurb: "Primary records and direct observation.",
      },
      {
        id: "inference",
        label: "Inference",
        acr: "INF",
        color: "#60a5fa",
        nodeIds: [],
        blurb: "Reasoned from evidence — still provisional.",
      },
      {
        id: "assumption",
        label: "Assumption",
        acr: "ASM",
        color: "#fbbf24",
        nodeIds: [],
        blurb: "Working guess — must not masquerade as fact.",
      },
    ],
  },
  {
    id: "claim-diamond",
    name: "Claim Diamond",
    tagline: "Supported · Unproven · Disputed · Human call",
    doctrine: "Tri-state claims (+1 / 0 / −1) with human final call at the tip.",
    phases: [
      {
        id: "supported",
        label: "Supported",
        acr: "+1",
        color: "#4ade80",
        nodeIds: [],
        blurb: "Claim holds under current evidence.",
      },
      {
        id: "unproven",
        label: "Unproven",
        acr: "0",
        color: "#94a3b8",
        nodeIds: [],
        blurb: "Not enough yet — honest incomplete state.",
      },
      {
        id: "disputed",
        label: "Disputed",
        acr: "−1",
        color: "#f87171",
        nodeIds: [],
        blurb: "Contradicted or contested.",
      },
      {
        id: "human",
        label: "Human final call",
        acr: "HFC",
        color: "#f0abfc",
        nodeIds: [],
        blurb: "Software never auto-truths.",
      },
    ],
  },
  {
    id: "sense-orbit",
    name: "Sense → Reason → Build",
    tagline: "Outer sense · mid reason · core build",
    doctrine: "Tool-Building stack: Sense (reach) → Reason (providers) → Build (product).",
    phases: [
      {
        id: "sense",
        label: "Sense",
        acr: "SNS",
        color: "#22d3ee",
        nodeIds: [],
        blurb: "External signals in — never auto-promote to product.",
      },
      {
        id: "reason",
        label: "Reason",
        acr: "RSN",
        color: "#a78bfa",
        nodeIds: [],
        blurb: "Providers + judgment desks.",
      },
      {
        id: "build",
        label: "Build",
        acr: "BLD",
        color: "#2dd4bf",
        nodeIds: [],
        blurb: "Ship in the product tree under OPSEC.",
      },
    ],
  },
  {
    id: "four-agent",
    name: "4-Agent Lanes",
    tagline: "Architect · Builder · Critic · Integrator",
    doctrine: "AOS 4-agent orchestration — parallel lanes, single integrator.",
    phases: [
      {
        id: "architect",
        label: "Architect",
        acr: "ARC",
        color: "#c4b5fd",
        nodeIds: [],
        blurb: "Frame problem + constraints.",
      },
      {
        id: "builder",
        label: "Builder",
        acr: "BLD",
        color: "#2dd4bf",
        nodeIds: [],
        blurb: "Implement the slice.",
      },
      {
        id: "critic",
        label: "Critic",
        acr: "CRT",
        color: "#f87171",
        nodeIds: [],
        blurb: "Stress-test claims and gaps.",
      },
      {
        id: "integrator",
        label: "Integrator",
        acr: "INT",
        color: "#fbbf24",
        nodeIds: [],
        blurb: "Merge honest outcomes.",
      },
    ],
  },
  {
    id: "lpin-helix",
    name: "Field Helix",
    tagline: "Observe → Claim → Communicate → Progress spiral",
    doctrine: "Field learning loop: honest observation, careful claims, craft talk, then progress.",
    phases: [
      {
        id: "field",
        label: "Observe",
        acr: "OBS",
        color: "#5eead4",
        nodeIds: [],
        blurb: "What was actually observed.",
      },
      {
        id: "claims",
        label: "Claims",
        acr: "CLM",
        color: "#60a5fa",
        nodeIds: [],
        blurb: "Supported / unproven / disputed — keep them labeled.",
      },
      {
        id: "jobsite",
        label: "Craft talk",
        acr: "TLK",
        color: "#fbbf24",
        nodeIds: [],
        blurb: "Craft communication under stress.",
      },
      {
        id: "progress",
        label: "Progress",
        acr: "PRG",
        color: "#4ade80",
        nodeIds: [],
        blurb: "What moved — and what is still open.",
      },
    ],
  },
  {
    id: "star-burst",
    name: "Star Burst",
    tagline: "Workspace combs as star points",
    doctrine: "Product surfaces radiate from a shared integrity core.",
    phases: [
      {
        id: "core",
        label: "Integrity core",
        acr: "CORE",
        color: "#a78bfa",
        nodeIds: [],
        blurb: "Shared kernel every surface must honor.",
      },
      {
        id: "radiate",
        label: "Radiate",
        acr: "RAD",
        color: "#2dd4bf",
        nodeIds: [],
        blurb: "Learn · Samples · Industries · Tools · Path · Progress.",
      },
    ],
  },
];

export function getShapeDef(id: HiveShapeId): HiveShapeDef {
  return HIVE_SHAPES.find((s) => s.id === id) ?? HIVE_SHAPES[0]!;
}

function assignPhaseNodes(
  phases: ReasoningPhase[],
  buckets: string[][],
): ReasoningPhase[] {
  return phases.map((p, i) => ({
    ...p,
    nodeIds: buckets[i] ?? [],
  }));
}

function chunkRoundRobin(ids: string[], n: number): string[][] {
  const buckets: string[][] = Array.from({ length: Math.max(1, n) }, () => []);
  ids.forEach((id, i) => {
    buckets[i % buckets.length]!.push(id);
  });
  return buckets;
}

function buildRadii(
  workspaces: HiveNode[],
  skills: HiveNode[],
  industries: HiveNode[],
  style: HiveNodeStyle,
): Record<string, number> {
  const radii: Record<string, number> = {};
  workspaces.forEach((n, i) => {
    radii[n.id] = collisionRadiusForNode(
      "workspace",
      style,
      i,
      workspaces.length,
      { enabled: n.enabled, baseMeshScale: 1 },
    );
  });
  skills.forEach((n, i) => {
    radii[n.id] = collisionRadiusForNode("skill", style, i, skills.length, {
      enabled: n.enabled,
      baseMeshScale: 0.95,
    });
  });
  industries.forEach((n, i) => {
    radii[n.id] = collisionRadiusForNode(
      "industry",
      style,
      i,
      industries.length,
      { enabled: n.enabled, baseMeshScale: 0.9 },
    );
  });
  return radii;
}

/** Compute world positions for every node under a shape + optional custom offsets. */
export function computeLayoutPositions(
  shapeId: HiveShapeId,
  workspaces: HiveNode[],
  skills: HiveNode[],
  industries: HiveNode[],
  customOffsets: Record<string, Vec3> = {},
  nodeStyle: HiveNodeStyle = "geometric",
): Record<string, Vec3> {
  const out: Record<string, Vec3> = {};
  const style = nodeStyle === "galactic" ? "galactic" : "geometric";
  const packWs = packSpacing("workspace", style);
  const packSk = packSpacing("skill", style);
  const packInd = packSpacing("industry", style);
  const apply = (id: string, base: Vec3) => {
    const o = customOffsets[id];
    out[id] = o
      ? { x: base.x + o.x, y: base.y + o.y, z: base.z + o.z }
      : { ...base };
  };
  const finalize = (extraIters = 0) => {
    const kinds: Record<string, "workspace" | "skill" | "industry"> = {};
    workspaces.forEach((n) => {
      kinds[n.id] = "workspace";
    });
    skills.forEach((n) => {
      kinds[n.id] = "skill";
    });
    industries.forEach((n) => {
      kinds[n.id] = "industry";
    });
    const radii = buildRadii(workspaces, skills, industries, style);
    // Soft push so shape layouts never leave stacked/piled combs
    // Galactic needs more iterations — shells + priority scale inflate bodies
    const iters = (style === "galactic" ? 10 : 6) + extraIters;
    deoverlapPositions(out, kinds, {
      cardFill: 1,
      iterations: iters,
      radii,
      pushBias: style === "galactic" ? 1.14 : 1.08,
    });
    return out;
  };

  if (shapeId === "honeycomb" || shapeId === "custom") {
    workspaces.forEach((n, i) => {
      const p = honey(i, packWs, WS_Y, WS_Y_JITTER);
      const b = tierRadialBias("workspace");
      apply(n.id, { x: p.x * b, y: p.y, z: p.z * b });
    });
    skills.forEach((n, i) => {
      const p = honey(ringSkip(5) + i, packSk, SK_Y, SK_Y_JITTER);
      const b = tierRadialBias("skill");
      apply(n.id, { x: p.x * b, y: p.y, z: p.z * b });
    });
    industries.forEach((n, i) => {
      const p = honey(ringSkip(3) + i, packInd, IND_Y, IND_Y_JITTER);
      const b = tierRadialBias("industry");
      apply(n.id, { x: p.x * b, y: p.y, z: p.z * b });
    });
    return finalize();
  }

  if (shapeId === "spine") {
    /**
     * Classic vertical spine — workspaces stacked on Y (x=0, z=0).
     * Skills/industries as lateral ribs at matching heights.
     * Deoverlap locks the spine column so collision rules don't lean the tower.
     */
    const step = 1.65;
    workspaces.forEach((n, i) => {
      apply(n.id, {
        x: 0,
        y: 0.55 + i * step,
        z: 0,
      });
    });
    const spineH = Math.max(step, (workspaces.length - 1) * step);
    skills.forEach((n, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const row = Math.floor(i / 2);
      const y =
        0.35 +
        (row / Math.max(1, Math.ceil(skills.length / 2) - 1 || 1)) * spineH;
      apply(n.id, {
        x: side * (2.65 + (row % 3) * 0.7),
        y,
        z: ((row % 5) - 2) * 0.55,
      });
    });
    industries.forEach((n, i) => {
      const side = i % 2 === 0 ? 1 : -1;
      const t = i / Math.max(1, industries.length - 1);
      apply(n.id, {
        x: side * (4.2 + (i % 3) * 0.45),
        y: 0.9 + t * spineH * 0.92,
        z: Math.sin(i * 1.1) * 1.4,
      });
    });
    // Spine-aware collision: lock workspace XZ; push only ribs
    const kinds: Record<string, "workspace" | "skill" | "industry"> = {};
    const lock: string[] = [];
    workspaces.forEach((n) => {
      kinds[n.id] = "workspace";
      lock.push(n.id);
    });
    skills.forEach((n) => {
      kinds[n.id] = "skill";
    });
    industries.forEach((n) => {
      kinds[n.id] = "industry";
    });
    deoverlapPositions(out, kinds, {
      cardFill: 1,
      iterations: style === "galactic" ? 10 : 6,
      lockXZ: lock,
      axis: "xz",
      radii: buildRadii(workspaces, skills, industries, style),
      pushBias: style === "galactic" ? 1.14 : 1.08,
    });
    return out;
  }

  if (shapeId === "integrity-triangle") {
    const verts: Vec3[] = [
      { x: 0, y: 2.2, z: -3.2 },
      { x: -4.2, y: 0.6, z: 2.4 },
      { x: 4.2, y: 0.6, z: 2.4 },
    ];
    workspaces.forEach((n, i) => {
      const v = verts[i % 3]!;
      const t = i / Math.max(1, workspaces.length);
      apply(n.id, {
        x: v.x * (0.55 + t * 0.2),
        y: v.y + (i % 2) * 0.25,
        z: v.z * (0.55 + t * 0.2),
      });
    });
    skills.forEach((n, i) => {
      const edge = i % 3;
      const t = (Math.floor(i / 3) + 0.5) / 8;
      const a = verts[edge]!;
      const b = verts[(edge + 1) % 3]!;
      apply(n.id, {
        x: a.x + (b.x - a.x) * t,
        y: 0.1 + (i % 3) * 0.08,
        z: a.z + (b.z - a.z) * t,
      });
    });
    industries.forEach((n, i) => {
      const a = (i / Math.max(1, industries.length)) * Math.PI * 2;
      apply(n.id, {
        x: Math.cos(a) * 2.4,
        y: 1.1,
        z: Math.sin(a) * 2.4 - 0.4,
      });
    });
    return finalize();
  }

  if (shapeId === "claim-diamond") {
    const tips: Vec3[] = [
      { x: 0, y: 3.2, z: 0 }, // human tip
      { x: 0, y: 1.6, z: -3.4 }, // supported
      { x: -3.6, y: 1.0, z: 1.8 }, // unproven
      { x: 3.6, y: 1.0, z: 1.8 }, // disputed
    ];
    workspaces.forEach((n, i) => {
      const v = tips[i % tips.length]!;
      apply(n.id, { x: v.x, y: v.y, z: v.z });
    });
    skills.forEach((n, i) => {
      const a = (i / Math.max(1, skills.length)) * Math.PI * 2;
      const r = 2.2 + (i % 3) * 0.35;
      apply(n.id, {
        x: Math.cos(a) * r,
        y: 0.05,
        z: Math.sin(a) * r,
      });
    });
    industries.forEach((n, i) => {
      const a = (i / Math.max(1, industries.length)) * Math.PI * 2 + 0.4;
      apply(n.id, {
        x: Math.cos(a) * 5.2,
        y: 0.65,
        z: Math.sin(a) * 5.2,
      });
    });
    return finalize();
  }

  if (shapeId === "sense-orbit") {
    // Core = workspaces, mid ring industries, outer skills
    workspaces.forEach((n, i) => {
      const a = (i / Math.max(1, workspaces.length)) * Math.PI * 2;
      apply(n.id, {
        x: Math.cos(a) * 1.6,
        y: 1.5,
        z: Math.sin(a) * 1.6,
      });
    });
    industries.forEach((n, i) => {
      const a = (i / Math.max(1, industries.length)) * Math.PI * 2;
      apply(n.id, {
        x: Math.cos(a) * 4.2,
        y: 0.7,
        z: Math.sin(a) * 4.2,
      });
    });
    skills.forEach((n, i) => {
      const a = (i / Math.max(1, skills.length)) * Math.PI * 2;
      apply(n.id, {
        x: Math.cos(a) * 7.2,
        y: 0.05 + (i % 4) * 0.04,
        z: Math.sin(a) * 7.2,
      });
    });
    return finalize();
  }

  if (shapeId === "four-agent") {
    const lanes: Vec3[] = [
      { x: -4.5, y: 1.2, z: -2.5 },
      { x: 4.5, y: 1.2, z: -2.5 },
      { x: -4.5, y: 1.2, z: 2.5 },
      { x: 4.5, y: 1.2, z: 2.5 },
    ];
    workspaces.forEach((n, i) => {
      const lane = lanes[i % 4]!;
      apply(n.id, {
        x: lane.x + (i % 2) * 0.4,
        y: lane.y + Math.floor(i / 4) * 0.5,
        z: lane.z,
      });
    });
    skills.forEach((n, i) => {
      const lane = i % 4;
      const v = lanes[lane]!;
      apply(n.id, {
        x: v.x + ((i % 5) - 2) * 0.45,
        y: 0.1,
        z: v.z + Math.floor(i / 5) * 0.5 * (lane < 2 ? 1 : -1),
      });
    });
    industries.forEach((n, i) => {
      apply(n.id, {
        x: ((i % 6) - 2.5) * 1.3,
        y: 0.55,
        z: 0,
      });
    });
    return finalize();
  }

  if (shapeId === "lpin-helix") {
    const all = [...workspaces, ...industries, ...skills];
    all.forEach((n, i) => {
      const t = i / Math.max(1, all.length - 1);
      const turns = 2.4;
      const a = t * Math.PI * 2 * turns;
      const r = 1.2 + t * 5.5;
      apply(n.id, {
        x: Math.cos(a) * r,
        y: 0.15 + t * 3.8,
        z: Math.sin(a) * r,
      });
    });
    return finalize();
  }

  if (shapeId === "star-burst") {
    workspaces.forEach((n, i) => {
      const a = (i / Math.max(1, workspaces.length)) * Math.PI * 2 - Math.PI / 2;
      apply(n.id, {
        x: Math.cos(a) * 4.8,
        y: 1.6,
        z: Math.sin(a) * 4.8,
      });
    });
    // core cluster of first few industries
    industries.forEach((n, i) => {
      const a = (i / Math.max(1, industries.length)) * Math.PI * 2;
      apply(n.id, {
        x: Math.cos(a) * 1.4,
        y: 0.85,
        z: Math.sin(a) * 1.4,
      });
    });
    skills.forEach((n, i) => {
      const a = (i / Math.max(1, skills.length)) * Math.PI * 2 + 0.2;
      apply(n.id, {
        x: Math.cos(a) * 7.5,
        y: 0.05,
        z: Math.sin(a) * 7.5,
      });
    });
    return finalize();
  }

  // fallback honeycomb
  return computeLayoutPositions(
    "honeycomb",
    workspaces,
    skills,
    industries,
    customOffsets,
  );
}

/** Build phase node membership for orchestration playback. */
export function buildPhasesForShape(
  shapeId: HiveShapeId,
  workspaces: HiveNode[],
  skills: HiveNode[],
  industries: HiveNode[],
): ReasoningPhase[] {
  const def = getShapeDef(shapeId);
  const ws = workspaces.map((n) => n.id);
  const sk = skills.map((n) => n.id);
  const ind = industries.map((n) => n.id);

  if (shapeId === "spine") {
    const buckets = chunkRoundRobin([...ws, ...sk.slice(0, 12)], def.phases.length);
    return assignPhaseNodes(def.phases, buckets);
  }
  if (shapeId === "integrity-triangle") {
    return assignPhaseNodes(def.phases, chunkRoundRobin([...ws, ...sk], 3));
  }
  if (shapeId === "claim-diamond") {
    return assignPhaseNodes(def.phases, chunkRoundRobin([...ws, ...ind], 4));
  }
  if (shapeId === "sense-orbit") {
    return assignPhaseNodes(def.phases, [sk, ind, ws]);
  }
  if (shapeId === "four-agent") {
    return assignPhaseNodes(def.phases, chunkRoundRobin([...ws, ...sk], 4));
  }
  if (shapeId === "lpin-helix") {
    return assignPhaseNodes(def.phases, chunkRoundRobin([...ws, ...ind, ...sk], 4));
  }
  if (shapeId === "star-burst") {
    return assignPhaseNodes(def.phases, [ind.slice(0, 8), ws]);
  }
  return assignPhaseNodes(def.phases, [[...ws, ...ind, ...sk]]);
}

export function buildOrchestrationEdges(
  phases: ReasoningPhase[],
): OrchestrationEdge[] {
  const edges: OrchestrationEdge[] = [];
  for (let i = 0; i < phases.length - 1; i++) {
    const fromIds = phases[i]!.nodeIds;
    const toIds = phases[i + 1]!.nodeIds;
    const a = fromIds[0];
    const b = toIds[0];
    if (a && b) {
      edges.push({
        from: a,
        to: b,
        kind: i === phases.length - 2 ? "deliver" : "flow",
      });
    }
    // secondary links for denser viz
    if (fromIds[1] && toIds[1]) {
      edges.push({ from: fromIds[1], to: toIds[1], kind: "gate" });
    }
  }
  return edges;
}
