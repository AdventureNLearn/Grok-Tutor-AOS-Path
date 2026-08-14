/**
 * Generate PartMode literacy samples (20) — offline curriculum.
 * node scripts/generate-partmode-samples-20.mjs
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const families = [
  { id: "partmode-session", label: "Session & authority" },
  { id: "partmode-preview-commit", label: "Preview → commit" },
  { id: "partmode-inspect", label: "Inspect & evidence" },
  { id: "partmode-trades", label: "Trades bridge" },
  { id: "partmode-bom", label: "BOM & assemblies" },
];

const parts = [
  ["bracket-plate", "L-bracket training plate", "cnc"],
  ["shaft-collar", "set-screw shaft collar", "cnc"],
  ["flange-gasket", "flat flange gasket blank", "quality"],
  ["pipe-stub", "short pipe stub practice", "plumbing"],
  ["weld-tab", "weld-on tab plate", "welding"],
  ["enclosure-lid", "sheet-metal style lid", "electrical"],
  ["idler-pulley", "idler pulley blank", "automotive"],
  ["fixture-pin", "fixture locating pin", "cnc"],
  ["hinge-leaf", "simple hinge leaf", "construction"],
  ["manifold-block", "two-port manifold block", "quality"],
  ["spacer-stack", "stacked spacer ring", "design"],
  ["cable-clamp", "cable clamp body", "electrical"],
  ["bearing-cap", "bearing cap cover", "automotive"],
  ["gusset-plate", "triangular gusset", "welding"],
  ["mount-rail", "equipment mount rail", "construction"],
  ["orifice-disk", "orifice disk blank", "quality"],
  ["knob-insert", "press-fit knob insert", "design"],
  ["chain-guard", "simple chain guard half", "automotive"],
  ["tool-rest", "bench tool rest", "cnc"],
  ["cover-plate", "rectangular cover plate", "construction"],
];

const stages = ["brief", "architect", "coder", "qa", "repair", "print"];
const difficulties = ["beginner", "intermediate", "advanced"];
const integrity = ["Evidence", "Inference", "Assumption"];
const materials = ["PETG", "PLA", "aluminum intent", "mild steel intent", "nylon intent"];
const axes = ["X", "Y", "Z"];

const quizzes = [
  {
    prompt: (id, part) => `[${id}] An agent wants to change the ${part} model. What is the correct PartMode-style order?`,
    choices: [
      "Preview the typed operation, review diagnostics and revision, then commit only with the matching preview id",
      "Commit immediately so the human does not have to look",
      "Export STEP first, then invent geometry in a chat without a session",
      "Disable all checks and let the agent run until the mesh looks fine",
    ],
    answerIndex: 0,
    why: "PartMode literacy: mutations are preview-bound transactions. Commit needs matching preview + revision evidence.",
  },
  {
    prompt: (id) => `[${id}] Who should approve an agent CAD session on a training model?`,
    choices: [
      "Anyone with the public website open — no human needed",
      "A human with authority for that studio/session, who can also pause or revoke",
      "The agent itself after three successful mesh exports",
      "A random chat user without a scoped key or session",
    ],
    answerIndex: 1,
    why: "Human final call: browser-approved sessions keep authority visible; keys alone do not invent consent.",
  },
  {
    prompt: (id) => `[${id}] Which is the strongest Evidence that a training part is watertight enough to discuss export?`,
    choices: [
      "A screenshot that looks solid from one angle",
      "A claim in chat that the model is fine",
      "Inspect results: topology health, mass properties, and a settled revision/hash after checks",
      "Doubling the triangle count so errors hide",
    ],
    answerIndex: 2,
    why: "Evidence is re-checkable: inspect, mass, revision. Screenshots and vibes are weaker.",
  },
  {
    prompt: (id) => `[${id}] How should Grok Tutor relate to live PartMode?`,
    choices: [
      "This lab embeds the full AGPL kernel and auto-commits with a shared public agent key",
      "Offline literacy samples here; live CAD stays on partmode.com or a private self-host — no public agent keys",
      "Tutor replaces PartMode and issues manufacturing certifications",
      "Ignore licenses and copy the CAD engine into the public monorepo",
    ],
    answerIndex: 1,
    why: "Compose tools: Tutor teaches process; live CAD is external. AGPL + L0 keys stay out of public ship.",
  },
];

function sampleAt(i) {
  const n = i + 1;
  const id = `pm-${String(n).padStart(3, "0")}`;
  const [partId, partDesc, trade] = parts[i];
  const fam = families[i % families.length];
  const stage = stages[i % stages.length];
  const diff = difficulties[i % difficulties.length];
  const integ = integrity[i % integrity.length];
  const mat = materials[i % materials.length];
  const axis = axes[i % axes.length];
  const env = 20 + (i % 5) * 4;
  const h = 8 + (i % 4) * 2;
  const q = quizzes[i % quizzes.length];
  const qa = ["NONE", "DIMENSION", "TOPOLOGY", "FATAL"][i % 4];

  const features = [
    ["closed sketch profile", "parametric extrude", "fillet on outer edge"],
    ["through-hole", "parameter table", "mirror pattern"],
    ["revolve candidate", "section view intent", "mate plane label"],
    ["shell thickness target", "draft angle note", "configuration variant"],
  ][i % 4];

  const lessonByFam = {
    "partmode-session":
      "PartMode: agents join via scoped session; human approves in a visible studio. MAC parallel: human gate on FATAL QA.",
    "partmode-preview-commit":
      "PartMode: cad_preview then cad_commit with matching revision. MAC parallel: dual QA before export.",
    "partmode-inspect":
      "PartMode: inspect mass/topology as Evidence. MAC parallel: DIMENSION vs TOPOLOGY routing.",
    "partmode-trades":
      "Trades bridge: same claim hygiene whether CNC, weld, or install — educational geometry only.",
    "partmode-bom":
      "BOMWiki idea: name the assembly role of this stand-in part; do not invent real product serials.",
  };

  const hold =
    qa === "FATAL"
      ? "HOLD export until a human reviews topology/connectivity Evidence."
      : null;

  return {
    id,
    index: n,
    title: `${String(n).padStart(3, "0")} · ${partId} · PartMode`,
    family: fam.id,
    familyLabel: fam.label,
    partId,
    partDesc,
    difficulty: diff,
    pipelineStage: stage,
    materialIntent: mat,
    primaryAxis: axis,
    prompt: `PartMode literacy: design a ${partDesc} for training only. Units mm. Envelope about ${env}×${env}×${h} mm. Material intent: ${mat}. Primary axis ${axis}. Practice: session authority, preview-before-commit, and inspect Evidence. Sample ${id}. Trade link: ${trade}.`,
    features,
    dimensions: [
      { label: "envelope_xy", value: String(env), unit: "mm" },
      { label: "height_z", value: String(h), unit: "mm" },
      { label: "critical_feature", value: String(2 + (i % 3)), unit: "mm" },
      { label: "pattern_count", value: String(1 + (i % 4)), unit: "count" },
    ],
    qaErrorType: qa,
    integrityFocus: integ,
    tradeLink: trade,
    macLesson: lessonByFam[fam.id],
    checkList: [
      `Confirm overall envelope ≈ ${env}×${env}×${h} mm against a drawing or inspect readout (Evidence).`,
      `Feature present: ${features[0]}.`,
      `Feature present: ${features[1]}.`,
      "If an agent proposes a change: require preview diagnostics before any commit metaphor.",
      "Label spoken sizes as Evidence, Inference, or Assumption.",
      hold
        ? "FATAL-style issue: stop auto-loops; human final call before export talk."
        : "When checks pass, discuss STEP export as a deliverable — still educational only.",
    ],
    quiz: {
      prompt: q.prompt(id, partId),
      choices: q.choices,
      answerIndex: q.answerIndex,
      why: q.why,
    },
    scenarioHold: hold,
    humanReadableSummary: `Sample ${n}/20: ${partDesc}. Family: ${fam.label}. Focus: PartMode literacy (offline). Trade: ${trade}.`,
  };
}

const samples = Array.from({ length: 20 }, (_, i) => sampleAt(i));

// integrity
const ids = new Set();
const quizPrompts = new Set();
for (const s of samples) {
  if (ids.has(s.id)) throw new Error("dup " + s.id);
  ids.add(s.id);
  if (quizPrompts.has(s.quiz.prompt)) throw new Error("dup quiz " + s.id);
  quizzes.add(s.quiz.prompt);
}

const header = `/**
 * PartMode literacy sample pack — 20 unique offline items.
 * Complements MAC 100-pack: session authority, preview→commit, inspect Evidence, trades/BOM bridge.
 * Does NOT run PartMode kernel or MCP. Live CAD: https://partmode.com/
 * Generate: node scripts/generate-partmode-samples-20.mjs
 */

import type { CadSample } from "./cad-samples-100";

export const PARTMODE_SAMPLES_20: CadSample[] = `;

const footer = `;

export const PARTMODE_SAMPLE_COUNT = PARTMODE_SAMPLES_20.length;

export function getPartmodeSample(id: string): CadSample | undefined {
  return PARTMODE_SAMPLES_20.find((s) => s.id === id);
}

export function listPartmodeFamilies(): { id: string; label: string; count: number }[] {
  const map = new Map<string, { id: string; label: string; count: number }>();
  for (const s of PARTMODE_SAMPLES_20) {
    const cur = map.get(s.family) ?? { id: s.family, label: s.familyLabel, count: 0 };
    cur.count += 1;
    map.set(s.family, cur);
  }
  return [...map.values()].sort((a, b) => a.id.localeCompare(b.id));
}

/** Runtime integrity gate */
export function assertPartmodeSampleIntegrity(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (PARTMODE_SAMPLES_20.length !== 20) {
    errors.push(\`count \${PARTMODE_SAMPLES_20.length} !== 20\`);
  }
  const ids = new Set<string>();
  const titles = new Set<string>();
  const prompts = new Set<string>();
  const quizzes = new Set<string>();
  const banned =
    /municipality|city of |county of |parcel\\s*#|street address|ssn|social security|operator private|skill brand|PARTMODE_AGENT_KEY/i;
  for (const s of PARTMODE_SAMPLES_20) {
    if (!/^pm-\\d{3}$/.test(s.id)) errors.push(\`bad id \${s.id}\`);
    if (ids.has(s.id)) errors.push(\`dup id \${s.id}\`);
    ids.add(s.id);
    if (titles.has(s.title)) errors.push(\`dup title \${s.title}\`);
    titles.add(s.title);
    if (prompts.has(s.prompt)) errors.push(\`dup prompt \${s.id}\`);
    prompts.add(s.prompt);
    if (quizzes.has(s.quiz.prompt)) errors.push(\`dup quiz \${s.id}\`);
    quizzes.add(s.quiz.prompt);
    if (s.quiz.answerIndex < 0 || s.quiz.answerIndex >= s.quiz.choices.length) {
      errors.push(\`bad answerIndex \${s.id}\`);
    }
    if (!s.features.length) errors.push(\`no features \${s.id}\`);
    if (!s.checkList.length) errors.push(\`no checklist \${s.id}\`);
    if (!s.macLesson.trim()) errors.push(\`empty lesson \${s.id}\`);
    if (banned.test(s.prompt) || banned.test(s.quiz.prompt)) {
      errors.push(\`banned language \${s.id}\`);
    }
  }
  return { ok: errors.length === 0, errors };
}

/** Combined Plan Lab catalog: MAC 100 + PartMode 20 */
export function mergeCadCatalog(mac: CadSample[]): CadSample[] {
  return [...mac, ...PARTMODE_SAMPLES_20];
}
`;

const body = JSON.stringify(samples, null, 2);
const out = header + body + footer;
const dest = join(root, "src", "lib", "cad", "partmode-samples-20.ts");
writeFileSync(dest, out, "utf8");
console.log("wrote", dest, "count=", samples.length);
