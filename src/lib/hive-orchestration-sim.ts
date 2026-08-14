/**
 * Full orchestration scenarios — not just lights.
 * Each phase binds real skill tools + workspaces + a simulation beat
 * the learner can reason with (claim, question, thinking move).
 */

import type { HiveNode } from "./tutor-hive-map";
import type { HiveShapeId, OrchestrationEdge, ReasoningPhase } from "./hive-layout-shapes";
import type { ReasoningDepth } from "./hive-deep-reasoning";

export type OrchClaimBasis =
  | "Evidence"
  | "Inference"
  | "Assumption"
  | "mixed"
  | "unknown";

/** One step of a runnable simulation */
export type OrchSimStep = {
  phaseId: string;
  label: string;
  acr: string;
  color: string;
  blurb: string;
  /** Public skill ids (AOS skill id, not sk: prefix) */
  skillIds: string[];
  /** Workspace comb ids without ws: or with (ws:learn) */
  workspaceIds: string[];
  /** Industry ids (electrical, welding, …) optional */
  industryIds?: string[];
  /** Scenario narrative */
  situation: string;
  question: string;
  claim: string;
  claimBasis: OrchClaimBasis;
  thinkingMove: string;
  /** What a multi-agent / multi-skill sim would do this beat */
  simulationBeat: string;
  /** Suggested learner action */
  practiceHint: string;
};

export type OrchScenario = {
  id: string;
  title: string;
  craft: string;
  /** Shapes this scenario is tuned for; * = any */
  shapes: HiveShapeId[] | "*";
  depth: ReasoningDepth | "any";
  steps: OrchSimStep[];
};

/** Skills that must appear on the field for orchestration to feel real */
export const ORCH_PRIORITY_SKILLS = [
  "sovereign-lens",
  "evidence-gate",
  "4-agent-orchestration",
  "mission-spine-guard",
  "values-alignment-check",
  "agnostic-evidence-analyst",
  "anti-pattern-scanner",
  "reasoning-architect",
  "report-operator",
  "construction-oversight",
  "content-ops",
  "visual-systems-architect",
  "shatter-protocol",
  "evenhandedness-illusion-breaker",
  "working-doc-manager",
  "paste-bridge-validator",
] as const;

/**
 * Catalog of full scenarios. Picked by shape + depth when Play runs.
 */
export const ORCH_SCENARIOS: OrchScenario[] = [
  {
    id: "spine-job-hold",
    title: "Job-site hold — frame to deliver",
    craft: "Electrical / construction craft literacy",
    shapes: ["spine", "lpin-helix", "honeycomb", "custom"],
    depth: "any",
    steps: [
      {
        phaseId: "sl",
        label: "Clear frame",
        acr: "FRM",
        color: "#c4b5fd",
        blurb: "Frame stakes, values, and stop conditions.",
        skillIds: ["sovereign-lens", "values-alignment-check", "mission-spine-guard"],
        workspaceIds: ["ws:path", "ws:help"],
        industryIds: ["electrical"],
        situation:
          "A second-year apprentice sees a panel cover off and wires hanging. The lead is on a call. The clock is pushing for energize.",
        question: "What must be true before anyone calls this panel safe to close?",
        claim: "“It’s fine — we did this last week.”",
        claimBasis: "Assumption",
        thinkingMove: "Separate urgency from safety criteria. Name stop conditions out loud.",
        simulationBeat:
          "Clear Lens + Values Alignment open. Spine holds: no energize until cover, labels, and a competent check are present.",
        practiceHint: "Open Clear Lens, then Path — write three stop conditions before continuing.",
      },
      {
        phaseId: "eg",
        label: "Evidence check",
        acr: "EVD",
        color: "#5eead4",
        blurb: "Label claims Evidence / Inference / Assumption.",
        skillIds: ["evidence-gate", "agnostic-evidence-analyst", "anti-pattern-scanner"],
        workspaceIds: ["ws:samples", "ws:skills"],
        industryIds: ["electrical"],
        situation:
          "Someone points at the open panel and says the torque marks prove the lugs are tight.",
        question: "What can you actually call Evidence vs Inference here?",
        claim: "“Torque marks mean the lugs are still at spec.”",
        claimBasis: "Inference",
        thinkingMove:
          "Marks are a clue, not a measurement. Ask what was measured, when, and by whom.",
        simulationBeat:
          "Evidence Check labels the claim as Inference. Samples desk surfaces a similar dialogue beat for practice.",
        practiceHint: "Open Evidence Check and Samples — quiz yourself on claim labels.",
      },
      {
        phaseId: "orch",
        label: "Pick a path",
        acr: "PTH",
        color: "#60a5fa",
        blurb: "Route to the right desk and mode.",
        skillIds: ["4-agent-orchestration", "reasoning-architect", "working-doc-manager"],
        workspaceIds: ["ws:industries", "ws:learn", "ws:cad-lab"],
        industryIds: ["electrical", "construction"],
        situation:
          "You need either a live practice session, a sample dialogue, or a plan-lab style checklist before field talk.",
        question: "Which surface matches the learning goal right now?",
        claim: "“Just wing the talk with the lead.”",
        claimBasis: "Assumption",
        thinkingMove: "Route: Learn for live practice, Samples for offline sim, Plan Lab for structured checks.",
        simulationBeat:
          "Four-agent orchestration lights the handoff: Architect (plan) → Builder (practice) → Critic (check).",
        practiceHint: "Open Industries → Electrical, then Learn in practice mode.",
      },
      {
        phaseId: "desk",
        label: "Craft desk",
        acr: "DSK",
        color: "#fbbf24",
        blurb: "Trade, study, or content work on the craft.",
        skillIds: ["construction-oversight", "content-ops", "report-operator"],
        workspaceIds: ["ws:learn", "ws:samples"],
        industryIds: ["electrical", "construction"],
        situation:
          "You draft a short radio-style message to the lead: panel state, what you saw, what you need.",
        question: "Does the message state observation, ask, and hold — without overclaiming?",
        claim: "“Panel is ready for power.”",
        claimBasis: "unknown",
        thinkingMove: "Practice the craft message. Hold language until evidence is logged.",
        simulationBeat:
          "Live Learn / Samples run a multi-turn craft dialogue. Construction Oversight keeps field honesty in frame.",
        practiceHint: "Start a Live session (practice) or open an electrical sample.",
      },
      {
        phaseId: "deliver",
        label: "Deliver",
        acr: "DLV",
        color: "#4ade80",
        blurb: "Package honest outputs — human final call.",
        skillIds: ["report-operator", "paste-bridge-validator", "working-doc-manager"],
        workspaceIds: ["ws:progress", "ws:path"],
        situation:
          "End of beat: you either log a hold, a clean handoff note, or a request for a competent check.",
        question: "What can leave the desk without faking certainty?",
        claim: "“We’re good to energize.”",
        claimBasis: "mixed",
        thinkingMove: "Human final call. Only ship what evidence supports; name the gaps.",
        simulationBeat:
          "Deliver phase: Progress captures the learning beat; handoff note stays tri-state honest.",
        practiceHint: "Open Progress — log what you practiced and what is still unproven.",
      },
    ],
  },
  {
    id: "integrity-claim-lab",
    title: "Claim basis lab",
    craft: "General clear thinking",
    shapes: ["integrity-triangle", "claim-diamond"],
    depth: "any",
    steps: [
      {
        phaseId: "evidence",
        label: "Evidence",
        acr: "EVD",
        color: "#4ade80",
        blurb: "Primary records and direct observation.",
        skillIds: ["evidence-gate", "agnostic-evidence-analyst"],
        workspaceIds: ["ws:samples", "ws:skills"],
        situation: "A screenshot shows a meter reading of 120.1 V on L1.",
        question: "What part of that is Evidence you can cite?",
        claim: "“Voltage is normal.”",
        claimBasis: "Inference",
        thinkingMove: "The number on the photo is evidence of a display; ‘normal’ is a judgment.",
        simulationBeat: "Evidence Check isolates the photo reading as primary; ‘normal’ stays Inference.",
        practiceHint: "Open Evidence Check — label three claims from a sample lesson.",
      },
      {
        phaseId: "inference",
        label: "Inference",
        acr: "INF",
        color: "#60a5fa",
        blurb: "Reasoned from evidence — still provisional.",
        skillIds: ["reasoning-architect", "evenhandedness-illusion-breaker"],
        workspaceIds: ["ws:learn", "ws:path"],
        situation: "Same photo, plus a spec sheet that says nominal 120 V ±5%.",
        question: "What inference is licensed — and what still needs a check?",
        claim: "“We are inside tolerance.”",
        claimBasis: "Inference",
        thinkingMove: "Link measurement to the written band; note meter calibration unknowns.",
        simulationBeat: "Reasoning Architect chains evidence → inference without promoting it to fact.",
        practiceHint: "In Learn (explain mode), ask for Evidence vs Inference on a craft claim.",
      },
      {
        phaseId: "assumption",
        label: "Assumption",
        acr: "ASM",
        color: "#fbbf24",
        blurb: "Working guess — must not masquerade as fact.",
        skillIds: ["anti-pattern-scanner", "shatter-protocol"],
        workspaceIds: ["ws:help", "ws:skills"],
        situation: "Someone says the meter was calibrated last month — no sticker visible.",
        question: "How do you hold that as Assumption without killing the work?",
        claim: "“Meter is calibrated.”",
        claimBasis: "Assumption",
        thinkingMove: "Park as Assumption; seek sticker/log or re-measure with known tool.",
        simulationBeat: "Anti-pattern scan flags ‘trust without record’. Help desk explains claim hygiene.",
        practiceHint: "Open Help → integrity section; restate the claim with a basis label.",
      },
      {
        phaseId: "supported",
        label: "Supported",
        acr: "+1",
        color: "#4ade80",
        blurb: "Claim holds under current evidence.",
        skillIds: ["evidence-gate", "report-operator"],
        workspaceIds: ["ws:progress"],
        situation: "A second meter and a log entry both match the band.",
        question: "What claim can you mark Supported?",
        claim: "“L1 is within the written band on this check.”",
        claimBasis: "Evidence",
        thinkingMove: "Narrow the claim to what was checked — not the whole system forever.",
        simulationBeat: "Claim Diamond tip stays human: Supported for this measurement set only.",
        practiceHint: "Log the Supported claim in Progress with sources named.",
      },
      {
        phaseId: "unproven",
        label: "Unproven",
        acr: "0",
        color: "#94a3b8",
        blurb: "Not enough to decide.",
        skillIds: ["agnostic-evidence-analyst", "working-doc-manager"],
        workspaceIds: ["ws:path"],
        situation: "No second check available; crew wants a yes/no.",
        question: "What stays Unproven without inventing certainty?",
        claim: "“Whole service is healthy.”",
        claimBasis: "unknown",
        thinkingMove: "Keep 0. List what would move it to +1 or −1.",
        simulationBeat: "Working doc captures open questions instead of fake green.",
        practiceHint: "Write two tests that would resolve the Unproven claim.",
      },
      {
        phaseId: "disputed",
        label: "Disputed",
        acr: "−1",
        color: "#f87171",
        blurb: "Conflict in sources or readings.",
        skillIds: ["shatter-protocol", "evenhandedness-illusion-breaker"],
        workspaceIds: ["ws:samples"],
        situation: "Meter A 118 V, Meter B 129 V on the same lug.",
        question: "How do you treat the conflict?",
        claim: "“Pick the nicer number.”",
        claimBasis: "Assumption",
        thinkingMove: "Mark Disputed. Re-measure with a third method or stop.",
        simulationBeat: "Shatter protocol refuses to average away conflict.",
        practiceHint: "Find a sample dialogue where two readings disagree — practice the hold.",
      },
      {
        phaseId: "human",
        label: "Human call",
        acr: "HUM",
        color: "#e9d5ff",
        blurb: "Final judgment with named uncertainty.",
        skillIds: ["sovereign-lens", "report-operator", "paste-bridge-validator"],
        workspaceIds: ["ws:progress", "ws:learn"],
        situation: "You must tell the lead what you know and what you don’t.",
        question: "What sentence is honest enough to hand off?",
        claim: "Whatever you will actually say.",
        claimBasis: "mixed",
        thinkingMove: "Human final call — state basis kinds, not vibes.",
        simulationBeat: "Clear Lens + Report craft a clean handoff. Progress stores the beat.",
        practiceHint: "Deliver a 3-line handoff: Evidence / Inference / Assumption.",
      },
    ],
  },
  {
    id: "four-agent-cad-loop",
    title: "Four-agent plan loop",
    craft: "Plan Lab / multi-step CAD thinking",
    shapes: ["four-agent", "star-burst", "sense-orbit"],
    depth: "any",
    steps: [
      {
        phaseId: "sense",
        label: "Sense",
        acr: "SNS",
        color: "#22d3ee",
        blurb: "Take in the request and constraints.",
        skillIds: ["sovereign-lens", "evidence-gate"],
        workspaceIds: ["ws:cad-lab", "ws:learn"],
        situation: "Brief: print-in-place hinge, 0.4 mm gap, two bodies, PLA.",
        question: "What constraints are explicit vs assumed?",
        claim: "“Any hinge design will print fine.”",
        claimBasis: "Assumption",
        thinkingMove: "Extract envelope, body count, gap, material — list unknowns.",
        simulationBeat: "Sense orbit: Clear Lens + Evidence Check load the brief fields.",
        practiceHint: "Open Plan Lab — pick a sample and list its constraints.",
      },
      {
        phaseId: "architect",
        label: "Architect",
        acr: "ARC",
        color: "#a78bfa",
        blurb: "Plan features and acceptance checks.",
        skillIds: ["reasoning-architect", "4-agent-orchestration", "visual-systems-architect"],
        workspaceIds: ["ws:cad-lab", "ws:skills"],
        situation: "You must order: sketches → pin bore → gap → QA checks.",
        question: "What acceptance checks belong in the plan before code?",
        claim: "“We’ll QA after it looks cool.”",
        claimBasis: "Assumption",
        thinkingMove: "Architect plan first: feature order + numeric/topology checks.",
        simulationBeat: "Architect lane lights Reasoning Architect + Four-agent map.",
        practiceHint: "In Plan Lab, read the checklist for one sample before the quiz.",
      },
      {
        phaseId: "build",
        label: "Build",
        acr: "BLD",
        color: "#5eead4",
        blurb: "Execute the plan in controlled steps.",
        skillIds: ["content-ops", "working-doc-manager"],
        workspaceIds: ["ws:cad-lab", "ws:learn"],
        situation: "Implement gap and two bodies without fusing solids.",
        question: "What step proves bodies stayed separate?",
        claim: "“Boolean succeeded so it’s fine.”",
        claimBasis: "Inference",
        thinkingMove: "Controlled build: verify body count after each boolean.",
        simulationBeat: "Builder beat — Plan Lab sample + Learn practice mode.",
        practiceHint: "Run a Plan Lab quiz on print-in-place clearances.",
      },
      {
        phaseId: "critic",
        label: "Critic / QA",
        acr: "QA",
        color: "#fbbf24",
        blurb: "Check, route repair, or halt.",
        skillIds: ["anti-pattern-scanner", "evidence-gate", "report-operator"],
        workspaceIds: ["ws:cad-lab", "ws:progress"],
        situation: "QA reports DIMENSION on pin bore.",
        question: "What is the correct next agent step?",
        claim: "“Ship STL anyway.”",
        claimBasis: "Assumption",
        thinkingMove: "Route numeric repair; keep plan if structure is sound.",
        simulationBeat: "Critic phase — dual-engine style routing in educational form.",
        practiceHint: "Plan Lab quiz: DIMENSION vs TOPOLOGY vs FATAL next actions.",
      },
    ],
  },
  {
    id: "deep-cosmic-claim",
    title: "Deep cosmic claim path",
    craft: "Expansive multi-layer reasoning",
    shapes: "*",
    depth: "deep",
    steps: [
      {
        phaseId: "signal",
        label: "Gather signal",
        acr: "SIG",
        color: "#67e8f9",
        blurb: "What raw inputs do we actually have?",
        skillIds: ["evidence-gate", "public-records-forensics", "agnostic-evidence-analyst"],
        workspaceIds: ["ws:samples", "ws:skills"],
        situation: "Inbox: photo, short voice note, and a chat claim from a coworker.",
        question: "What is raw signal vs interpretation?",
        claim: "“Everyone agrees it’s safe.”",
        claimBasis: "Assumption",
        thinkingMove: "Inventory artifacts. Don’t promote chat consensus to evidence.",
        simulationBeat: "Deep profile Signal — gather only. Skills light for intake hygiene.",
        practiceHint: "List three artifacts and their type (photo / audio / chat).",
      },
      {
        phaseId: "frame",
        label: "Frame the question",
        acr: "FRM",
        color: "#a78bfa",
        blurb: "What are we trying to decide or learn?",
        skillIds: ["sovereign-lens", "mission-spine-guard", "values-alignment-check"],
        workspaceIds: ["ws:path", "ws:help"],
        situation: "Decision: practice a hold message vs ship a confident all-clear.",
        question: "What decision is actually on the table?",
        claim: "“We need to look decisive.”",
        claimBasis: "Assumption",
        thinkingMove: "Frame learning goal and safety goal separately.",
        simulationBeat: "Clear frame with values + spine — no fake urgency.",
        practiceHint: "Write the decision in one sentence without the word ‘fine’.",
      },
      {
        phaseId: "structure",
        label: "Structure the field",
        acr: "STR",
        color: "#5eead4",
        blurb: "Group ideas into stable bodies.",
        skillIds: ["reasoning-architect", "4-agent-orchestration", "working-doc-manager"],
        workspaceIds: ["ws:skills", "ws:learn"],
        situation: "Claims pile up: safety, schedule, ego, incomplete tools.",
        question: "How do you bucket claims without mixing basis kinds?",
        claim: "“It’s one big mess.”",
        claimBasis: "mixed",
        thinkingMove: "Structure: safety claims / schedule claims / unknowns.",
        simulationBeat: "Architect structure — multi-agent map of the claim field.",
        practiceHint: "Make three buckets on paper; place each claim once.",
      },
      {
        phaseId: "gravity",
        label: "Test gravity",
        acr: "GRV",
        color: "#fbbf24",
        blurb: "Which claims pull weight?",
        skillIds: ["evidence-gate", "anti-pattern-scanner"],
        workspaceIds: ["ws:samples"],
        situation: "Two claims compete for attention: schedule slip vs open cover.",
        question: "Which claim has more evidentiary mass?",
        claim: "“Schedule always wins.”",
        claimBasis: "Assumption",
        thinkingMove: "Weight by evidence strength and harm if wrong.",
        simulationBeat: "Gravity test — evidence mass over loudness.",
        practiceHint: "Score each claim 0–2 for evidence strength.",
      },
      {
        phaseId: "orbit",
        label: "Check orbits",
        acr: "ORB",
        color: "#f472b6",
        blurb: "Dependencies and tradeoffs.",
        skillIds: ["4-agent-orchestration", "visual-systems-architect"],
        workspaceIds: ["ws:industries", "ws:cad-lab"],
        situation: "Fixing the cover needs a tool that is on another truck.",
        question: "What moves together if you change the plan?",
        claim: "“We can ignore the dependency.”",
        claimBasis: "Assumption",
        thinkingMove: "Map dependencies: people, tools, permissions, time.",
        simulationBeat: "Orbit check — tradeoff lattice style dependency map.",
        practiceHint: "Draw three arrows: claim → dependency → next action.",
      },
      {
        phaseId: "anomaly",
        label: "Hunt anomalies",
        acr: "ANM",
        color: "#fb7185",
        blurb: "Where does the model break?",
        skillIds: ["shatter-protocol", "anti-pattern-scanner", "psyop-narrative-detector"],
        workspaceIds: ["ws:help", "ws:skills"],
        situation: "Story says ‘always done this way’ but the photo shows a different lug count.",
        question: "What anomaly forces a re-frame?",
        claim: "“Tradition is the procedure.”",
        claimBasis: "Assumption",
        thinkingMove: "Name the mismatch. Don’t smooth it over.",
        simulationBeat: "Anomaly hunt — shatter fake consistency.",
        practiceHint: "Write one sentence that states the mismatch only.",
      },
      {
        phaseId: "synthesis",
        label: "Synthesize",
        acr: "SYN",
        color: "#4ade80",
        blurb: "One coherent story with labeled uncertainty.",
        skillIds: ["reasoning-architect", "content-ops", "report-operator"],
        workspaceIds: ["ws:learn", "ws:progress"],
        situation: "You need a short synthesis for the lead and for your learning log.",
        question: "Can you tell one story without erasing basis labels?",
        claim: "Your synthesis draft.",
        claimBasis: "mixed",
        thinkingMove: "Synthesize with tags: EVD / INF / ASM inline.",
        simulationBeat: "Synthesis — coherent narrative, honest gaps.",
        practiceHint: "Write 5 lines max with basis tags.",
      },
      {
        phaseId: "handoff",
        label: "Clean handoff",
        acr: "HND",
        color: "#94a3b8",
        blurb: "What can leave the desk honestly?",
        skillIds: ["paste-bridge-validator", "report-operator", "working-doc-manager"],
        workspaceIds: ["ws:progress", "ws:path"],
        situation: "End of deep run — package for self and for a peer.",
        question: "What ships, what stays local, what needs a human call?",
        claim: "Final handoff package.",
        claimBasis: "mixed",
        thinkingMove: "Clean-share gate: no secrets, no fake certainty.",
        simulationBeat: "Handoff — Progress + Path capture the learning universe beat.",
        practiceHint: "Save Progress note: decision, open questions, next practice.",
      },
    ],
  },
];

function normWs(id: string) {
  return id.startsWith("ws:") ? id : `ws:${id}`;
}
function normSk(id: string) {
  return id.startsWith("sk:") ? id : `sk:${id}`;
}
function normInd(id: string) {
  return id.startsWith("ind:") ? id : `ind:${id}`;
}

export function pickScenario(
  shapeId: HiveShapeId,
  depth: ReasoningDepth,
): OrchScenario {
  // Deep mode prefers deep profiles first; standard prefers shape-tuned runs
  const pool =
    depth === "deep"
      ? [
          ...ORCH_SCENARIOS.filter((s) => s.depth === "deep"),
          ...ORCH_SCENARIOS.filter((s) => s.depth === "any"),
        ]
      : ORCH_SCENARIOS.filter((s) => s.depth !== "deep");
  const shaped = pool.filter(
    (s) => s.shapes === "*" || s.shapes.includes(shapeId),
  );
  // Prefer exact shape match over wildcard
  const exact = shaped.find((s) => s.shapes !== "*" && s.shapes.includes(shapeId));
  return exact ?? shaped[0] ?? pool[0] ?? ORCH_SCENARIOS[0]!;
}

/**
 * Bind a scenario to live hive nodes → ReasoningPhase[] with real skill lights.
 */
export function buildScenarioPhases(
  scenario: OrchScenario,
  workspaces: HiveNode[],
  skills: HiveNode[],
  industries: HiveNode[],
): ReasoningPhase[] {
  const skSet = new Set(skills.map((n) => n.id));
  const wsSet = new Set(workspaces.map((n) => n.id));
  const indSet = new Set(industries.map((n) => n.id));

  return scenario.steps.map((step) => {
    const nodeIds: string[] = [];
    for (const id of step.skillIds) {
      const full = normSk(id);
      if (skSet.has(full)) nodeIds.push(full);
    }
    for (const id of step.workspaceIds) {
      const full = normWs(id);
      if (wsSet.has(full)) nodeIds.push(full);
    }
    for (const id of step.industryIds ?? []) {
      const full = normInd(id);
      if (indSet.has(full)) nodeIds.push(full);
    }
    // Fallback: if priority skills missing from field, still light related category
    if (nodeIds.filter((id) => id.startsWith("sk:")).length === 0) {
      const anyCore = skills.filter((s) => s.id.includes("evidence") || s.meta?.includes("Clear"));
      anyCore.slice(0, 2).forEach((s) => nodeIds.push(s.id));
    }
    if (nodeIds.filter((id) => id.startsWith("ws:")).length === 0 && workspaces[0]) {
      nodeIds.push(workspaces[0].id);
    }
    return {
      id: step.phaseId,
      label: step.label,
      acr: step.acr,
      color: step.color,
      blurb: step.blurb,
      nodeIds: [...new Set(nodeIds)],
    };
  });
}

/** Rich edges: skill→workspace and phase-to-phase skill chains */
export function buildScenarioEdges(
  scenario: OrchScenario,
  phases: ReasoningPhase[],
): OrchestrationEdge[] {
  const edges: OrchestrationEdge[] = [];
  for (let i = 0; i < phases.length; i++) {
    const step = scenario.steps[i];
    const phase = phases[i];
    if (!step || !phase) continue;
    const skills = phase.nodeIds.filter((id) => id.startsWith("sk:"));
    const desks = phase.nodeIds.filter((id) => id.startsWith("ws:"));
    // Within phase: first skill → primary desk
    if (skills[0] && desks[0]) {
      edges.push({ from: skills[0], to: desks[0], kind: "sense" });
    }
    if (skills[0] && skills[1]) {
      edges.push({ from: skills[0], to: skills[1], kind: "gate" });
    }
    // Between phases: deliver forward
    const next = phases[i + 1];
    if (next) {
      const from = skills[0] || desks[0] || phase.nodeIds[0];
      const toSk = next.nodeIds.find((id) => id.startsWith("sk:"));
      const to = toSk || next.nodeIds[0];
      if (from && to) {
        edges.push({
          from,
          to,
          kind: i === phases.length - 2 ? "deliver" : "flow",
        });
      }
    }
  }
  return edges;
}

export function getScenarioStep(
  scenario: OrchScenario,
  phaseIndex: number,
): OrchSimStep | null {
  if (!scenario.steps.length) return null;
  const i = ((phaseIndex % scenario.steps.length) + scenario.steps.length) % scenario.steps.length;
  return scenario.steps[i] ?? null;
}

/** Resolve skill titles for HUD from live nodes */
export function skillTitlesForStep(
  step: OrchSimStep,
  skills: HiveNode[],
): { id: string; title: string; acr: string; color: string; href: string }[] {
  return step.skillIds
    .map((id) => {
      const full = normSk(id);
      const n = skills.find((s) => s.id === full);
      if (!n) return null;
      return {
        id: n.id,
        title: n.title,
        acr: n.acr,
        color: n.color,
        href: n.href,
      };
    })
    .filter(Boolean) as {
    id: string;
    title: string;
    acr: string;
    color: string;
    href: string;
  }[];
}
