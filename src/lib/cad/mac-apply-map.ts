/**
 * Multi-Agent CAD (Pan-Chera/MAC) — educational map for Plan Lab.
 * Not a runtime import of the Python CAD kernel.
 *
 * Research clone: C:\AOS\workspace\research\Multi-Agent-CAD
 * Upstream: https://github.com/Pan-Chera/Multi-Agent-CAD
 */

export const MAC_UPSTREAM = {
  org: "Pan-Chera",
  repo: "Multi-Agent-CAD",
  url: "https://github.com/Pan-Chera/Multi-Agent-CAD",
  license: "MIT",
  language: "Python 3.11+",
  /** Public-only pointer — never emit host filesystem paths in product UI */
  researchNote: "Optional offline research clone may exist on the operator host (not shipped).",
} as const;

/** Pipeline roles (how MAC thinks about a part) */
export const MAC_AGENTS = [
  {
    id: "spec-planner",
    name: "Spec Planner",
    output: "CADBrief",
    job: "Turn a short request into clear goals: size, body count, watertightness, key features.",
    tutorLens: "Evidence check + context checklist (What)",
    hiveShape: "sense-orbit / context stack",
  },
  {
    id: "geometric-architect",
    name: "Geometric Architect",
    output: "ArchitectPlan",
    job: "Plan sketches, steps, and key dimensions before writing geometry code.",
    tutorLens: "Architect lane + tradeoff thinking",
    hiveShape: "four-agent / tradeoff lattice",
  },
  {
    id: "python-coder",
    name: "Python Coder",
    output: "build123d Python → STEP/STL",
    job: "Turn the plan into geometry code — deterministic first, repair when needed.",
    tutorLens: "Builder lane",
    hiveShape: "four-agent",
  },
  {
    id: "dual-engine-qa",
    name: "Dual-Engine QA + Repair",
    output: "QAReport + repair loop",
    job: "Check topology and mesh quality; fix or stop based on the kind of error.",
    tutorLens: "Critic + drift watch + iteration",
    hiveShape: "drift ring / iteration coil / claim diamond",
  },
] as const;

/** What learners practice in Plan Lab (positive scope) */
export const MAC_APPLIES_TO = [
  {
    id: "text-to-cad",
    title: "From words to a part idea",
    detail:
      "Practice turning a short natural-language request into a clear geometry brief.",
  },
  {
    id: "constrained-ttc",
    title: "Compact handoffs between stages",
    detail:
      "See how a multi-step CAD agent can pass structured briefs instead of replaying a long chat.",
  },
  {
    id: "feature-qa",
    title: "Checking the model",
    detail:
      "Learn to ask for dimensions, solid bodies, and watertightness — and what to do when a check fails.",
  },
  {
    id: "print-in-place",
    title: "Clearances that move",
    detail:
      "Study print-in-place ideas: separate bodies with small gaps so parts can move after printing.",
  },
  {
    id: "mechanical-patterns",
    title: "Common mechanical features",
    detail:
      "Holes, fillets, cuts, patterns, and simple multi-body assemblies as teaching examples.",
  },
  {
    id: "tutor-education",
    title: "Learning in Grok Tutor",
    detail:
      "Offline samples, checklists, and quizzes — no CAD kernel running in this browser page.",
  },
] as const;

/**
 * Internal scope notes for maintainers (not a scare list for learners).
 * Prefer positive framing on Plan Lab UI.
 */
export const MAC_SCOPE_INTERNAL = [
  "Training geometry and process literacy — educational samples, not a full desktop CAD product",
  "Samples use generic practice parts only",
  "Not a safety certification of printed or machined parts",
] as const;

/** Map MAC stages → Grok Tutor hive shapes (public educational labels) */
export const MAC_TO_HIVE = [
  { mac: "user_request", tutor: "Learn / CAD lab prompt", shape: "honeycomb" },
  { mac: "CADBrief", tutor: "Context checklist (What)", shape: "overlay-context-stack" },
  { mac: "ArchitectPlan", tutor: "Tradeoff thinking / Architect lane", shape: "tradeoff-lattice" },
  { mac: "build123d code", tutor: "Builder practice (offline explain)", shape: "four-agent" },
  { mac: "QA DIMENSION", tutor: "Watch numeric drift", shape: "overlay-drift-ring" },
  { mac: "QA TOPOLOGY", tutor: "Re-plan on structure issues", shape: "overlay-drift-ring" },
  { mac: "QA FATAL", tutor: "Halt + human final call", shape: "claim-diamond" },
  { mac: "repair loop", tutor: "Iteration on Field Helix", shape: "iteration-coil" },
  { mac: "STEP/STL export", tutor: "Deliver when checks pass", shape: "spine" },
] as const;

export function macOneLiner(): string {
  return "Plan Lab teaches how multi-agent CAD pipelines think — briefs, plans, checks, and repair — with offline samples you can quiz yourself on. It does not run a full CAD program in this browser.";
}
