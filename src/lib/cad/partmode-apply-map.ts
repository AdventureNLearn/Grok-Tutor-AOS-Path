/**
 * PartMode (BOMWiki) — educational map for Plan Lab.
 * Offline curriculum only. Does NOT embed the AGPL CAD kernel or MCP keys.
 *
 * Live: https://partmode.com/
 * Source: https://github.com/BOMWiki/partmode (AGPL-3.0)
 * Brain: Projects/Grok-Tutor/18-PARTMODE-AND-BOMWIKI-MAP
 */

export const PARTMODE_UPSTREAM = {
  name: "PartMode",
  org: "BOMWiki",
  repo: "partmode",
  url: "https://github.com/BOMWiki/partmode",
  live: "https://partmode.com/",
  help: "https://partmode.com/help",
  about: "https://partmode.com/about",
  mcpEndpoint: "https://partmode.com/mcp",
  license: "AGPL-3.0",
  maker: "Sphinx (@protosphinx)",
  sibling: {
    name: "BOMWiki",
    url: "https://github.com/BOMWiki/bomwiki",
    site: "https://bomwiki.com",
    role: "Bills-of-materials encyclopedia (products → assemblies → parts graph)",
  },
} as const;

/** Human + agent workflow stages (typed ops, not pointer automation) */
export const PARTMODE_STAGES = [
  {
    id: "intent",
    name: "Intent & units",
    output: "Project brief",
    job: "Name the part goal, units (mm/in), and what success looks like before sketching.",
    tutorLens: "Context checklist (What)",
    hiveShape: "sense-orbit / context stack",
  },
  {
    id: "sketch-history",
    name: "Sketch + feature history",
    output: "Parametric tree",
    job: "Closed profiles, extrude/revolve/cut, parameters — history is the source of truth.",
    tutorLens: "Architect + Builder lanes",
    hiveShape: "four-agent / tradeoff lattice",
  },
  {
    id: "session-approve",
    name: "Agent session (human approve)",
    output: "Scoped session",
    job: "If an agent joins, it asks for a limited session; a human approves, pauses, or revokes.",
    tutorLens: "Claim diamond / human final call",
    hiveShape: "claim-diamond",
  },
  {
    id: "preview-commit",
    name: "Preview → commit",
    output: "Revision + evidence",
    job: "Mutations preview first (diagnostics, revision). Commit only with matching preview id.",
    tutorLens: "Drift watch + iteration coil",
    hiveShape: "overlay-drift-ring / iteration-coil",
  },
  {
    id: "inspect-export",
    name: "Inspect + export",
    output: "STEP / drawing / mass props",
    job: "Check topology, mass, measurements; export exact STEP when checks pass.",
    tutorLens: "Deliver + clean-share gate",
    hiveShape: "spine",
  },
] as const;

export const PARTMODE_APPLIES_TO = [
  {
    id: "exact-brep-literacy",
    title: "Exact geometry literacy",
    detail:
      "Practice talking about sketches, parameters, and feature history — not just pretty meshes.",
  },
  {
    id: "human-agent-cad",
    title: "Human + agent on one model",
    detail:
      "Learn the permission pattern: visible studio, scoped session, preview before commit.",
  },
  {
    id: "evidence-on-parts",
    title: "Evidence on parts",
    detail:
      "Treat revision, mass properties, and STEP hashes as Evidence — not vibes about fit.",
  },
  {
    id: "trades-bridge",
    title: "Trades bridge",
    detail:
      "CNC, welding, construction, automotive, quality, and design learners share the same claim hygiene.",
  },
  {
    id: "bom-awareness",
    title: "BOM awareness",
    detail:
      "Parts live in assemblies and BOMs (BOMWiki idea) — name what a stand-in part is for, generically.",
  },
  {
    id: "offline-tutor",
    title: "Offline in Grok Tutor",
    detail:
      "These samples run here without the PartMode kernel. Live CAD stays on partmode.com or a self-host.",
  },
] as const;

/** MAC stage → PartMode analogue (compose, do not collapse) */
export const MAC_TO_PARTMODE = [
  { mac: "CADBrief", partmode: "Intent & units", tutor: "Context checklist" },
  { mac: "ArchitectPlan", partmode: "Sketch + feature history plan", tutor: "Architect lane" },
  { mac: "Python coder", partmode: "Typed preview ops (live tool)", tutor: "Builder metaphor" },
  { mac: "Dual QA", partmode: "Inspect / mass / topology", tutor: "Drift monitor" },
  { mac: "Repair loop", partmode: "New preview from current revision", tutor: "Iteration coil" },
  { mac: "STEP export", partmode: "STEP / drawing export", tutor: "Deliver" },
  { mac: "Human gate", partmode: "Session approve + commit budget", tutor: "Final call" },
] as const;

export const PARTMODE_TO_HIVE = [
  { pm: "intent", tutor: "Context checklist (What)", shape: "overlay-context-stack" },
  { pm: "sketch-history", tutor: "Architect + Builder practice", shape: "four-agent" },
  { pm: "session-approve", tutor: "Human final call", shape: "claim-diamond" },
  { pm: "preview", tutor: "Watch before commit", shape: "overlay-drift-ring" },
  { pm: "commit", tutor: "Iteration / settle revision", shape: "iteration-coil" },
  { pm: "inspect-export", tutor: "Deliver when checks pass", shape: "spine" },
] as const;

export const PARTMODE_SCOPE_INTERNAL = [
  "Educational literacy only — does not ship AGPL PartMode source in this app",
  "No MCP agent keys in public Tutor, git, or model context (L0)",
  "No claim of PE stamp, CAM certification, or full SolidWorks replacement",
  "Training geometry only — generic parts, no customer job files",
] as const;

export function partmodeOneLiner(): string {
  return "PartMode literacy teaches how people and typed agents share exact parametric CAD — session approve, preview before commit, inspect, then export. Live CAD is on partmode.com; this lab is offline practice.";
}
