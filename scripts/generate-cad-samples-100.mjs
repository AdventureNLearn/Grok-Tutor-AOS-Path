/**
 * Generate 100 unique Multi-Agent CAD educational samples.
 * Quizzes: plausible distractors, shuffled answerIndex, no place/PII/ops scare copy.
 * Run: node scripts/generate-cad-samples-100.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outPath = join(root, "src", "lib", "cad", "cad-samples-100.ts");

const families = [
  { id: "mac-pipeline", label: "Multi-Agent pipeline", stages: ["brief", "architect", "coder", "qa", "repair"] },
  { id: "mechanical", label: "Mechanical features", stages: ["architect", "coder", "qa"] },
  { id: "trades-plan", label: "Craft plan literacy", stages: ["brief", "architect", "qa"] },
  { id: "print-clearance", label: "Print-in-place clearances", stages: ["architect", "qa", "print"] },
  { id: "assembly", label: "Multi-body assembly", stages: ["architect", "coder", "qa"] },
  { id: "integrity", label: "Integrity on geometry", stages: ["brief", "qa", "repair"] },
  { id: "boolean-ops", label: "Boolean and cut features", stages: ["coder", "qa", "repair"] },
  { id: "patterns", label: "Patterns and arrays", stages: ["architect", "coder", "qa"] },
  { id: "tolerances", label: "Fit and tolerance", stages: ["brief", "qa"] },
  { id: "safety-geometry", label: "Safety-critical dims", stages: ["brief", "qa", "repair"] },
];

const materials = [
  "PLA",
  "PETG",
  "ABS",
  "aluminum 6061",
  "mild steel plate",
  "plywood panel",
  "HDPE sheet",
  "nylon PA12",
];
const axes = ["X", "Y", "Z"];
const errors = ["DIMENSION", "TOPOLOGY", "FATAL", "NONE"];
const basis = ["Evidence", "Inference", "Assumption"];

const parts = [
  ["flange", "circular plate with bolt circle"],
  ["l-bracket", "right-angle support bracket"],
  ["stepped-shaft", "multi-diameter shaft"],
  ["open-enclosure", "box with open top"],
  ["clevis", "U-shaped link with pin hole"],
  ["impeller", "radial blade hub"],
  ["geneva-wheel", "intermittent drive disk"],
  ["brake-rotor", "vented disc blank"],
  ["honeycomb-tray", "hex cell organizer"],
  ["phone-stand", "angled rest"],
  ["ball-cage", "cube cage trapping a ball"],
  ["gyro-ring", "outer ring with pivots"],
  ["pipe-hanger", "U-strap with base"],
  ["junction-blank", "cover plate with knockouts"],
  ["duct-collar", "round-to-rect transition stub"],
  ["wall-plate", "bottom plate with stud marks"],
  ["vent-boot", "generic roof vent base"],
  ["cable-tray", "ladder tray segment"],
  ["bearing-block", "pillow block housing"],
  ["gear-blank", "spur gear blank before teeth"],
  ["counterbore-boss", "raised boss with counterbore"],
  ["heat-sink", "base with parallel fins"],
  ["manifold-block", "block with crossed ports"],
  ["hinge-leaf", "leaf with knuckle half"],
  ["clamp-collar", "split shaft collar"],
  ["spacer-stack", "stepped spacer"],
  ["cam-lobe", "simple plate cam"],
  ["rail-clip", "snap clip for T-slot"],
  ["nozzle-tip", "conical orifice"],
  ["filter-frame", "square frame with mesh seat"],
  ["ladder-rung", "rung with end tenons"],
  ["scaffold-coupler", "pipe coupler training part"],
  ["weld-coupon", "test plate with bevel prep"],
  ["conduit-cover", "threaded cover blank"],
  ["mud-ring", "device ring training geometry"],
  ["flange-spacer", "generic spacer ring"],
  ["shower-curb", "curb section profile"],
  ["register-boot", "HVAC boot transition"],
  ["solar-rail-end", "rail end cap"],
  ["pallet-corner", "reinforced corner block"],
  ["drone-arm-mount", "arm root plate"],
  ["gimbal-yoke", "yoke with through-bore"],
  ["gripper-finger", "finger pad blank"],
  ["test-cube", "calibration cube"],
  ["thread-gauge", "go/no-go style training plate"],
  ["keyway-shaft", "shaft with single keyway"],
  ["dovetail-slide", "male dovetail"],
  ["t-nut", "T-nut body"],
  ["linear-housing", "linear bearing housing blank"],
  ["timing-pulley", "pulley blank without teeth"],
];

const featuresBank = [
  "through-hole array",
  "fillet on outer edges",
  "chamfer on top rim",
  "counterbore",
  "countersink",
  "linear pattern",
  "circular pattern",
  "helical sweep",
  "boolean cut pocket",
  "boolean union boss",
  "shell thickness",
  "draft angle",
  "rib",
  "slot",
  "keyway",
  "thread relief groove",
  "pilot hole",
  "mounting pad",
  "clearance gap 0.4 mm",
  "clearance gap 1.0 mm",
  "print orientation flat on base",
  "water-tight solid",
  "single body",
  "two independent bodies",
  "overall bounding box check",
  "minimum wall 1.2 mm",
  "hole diameter tolerance ±0.1 mm",
  "symmetry about midplane",
];

const tradeLinks = [
  "welding",
  "electrical",
  "plumbing",
  "hvac",
  "carpentry",
  "quality",
  "construction",
  "automotive",
  "energy",
  null,
  null,
];

const stageLesson = {
  brief:
    "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
  architect:
    "Geometric Architect plans sketches, steps, selectors, and iron rules — not freehand code yet.",
  coder:
    "Python Coder / build123d path turns plan into executable geometry code; deterministic first, LLM repair second.",
  qa: "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
  repair: "Repair agents edit code from QA evidence; max iterations; fatal errors halt.",
  print: "Print orientation and clearance gaps matter for articulable / print-in-place parts.",
};

function pick(arr, i) {
  return arr[i % arr.length];
}

/** Deterministic PRNG — stable regeneration, shuffled answers per sample */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 4 choices: 1 correct + 3 distractors (2+ plausible, ≤1 obvious miss).
 * Shuffled so answerIndex is not fixed. No place / PII / ops scare strings.
 */
function makeQuiz(correct, distractors, seed) {
  const wrongs = distractors.filter((d) => d && d !== correct).slice(0, 3);
  while (wrongs.length < 3) {
    wrongs.push("Skip verification and treat the model as finished");
  }
  const items = [
    { text: correct, ok: true },
    ...wrongs.slice(0, 3).map((text) => ({ text, ok: false })),
  ];
  const rand = mulberry32(seed);
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = items[i];
    items[i] = items[j];
    items[j] = tmp;
  }
  return {
    choices: items.map((x) => x.text),
    answerIndex: items.findIndex((x) => x.ok),
  };
}

function buildQuiz(ctx) {
  const {
    id,
    partId,
    partDesc,
    err,
    featA,
    featB,
    stage,
    d1,
    d2,
    d3,
    holeN,
    mat,
    axis,
    i,
  } = ctx;
  const kind = i % 6;

  if (kind === 0) {
    const prompt = `[${id}] Dual-engine QA on ${partId} reports ${err === "NONE" ? "NONE (pass)" : err}. What is the best next step?`;
    let correct;
    let distractors;
    if (err === "FATAL") {
      correct =
        "Stop auto-repair loops; treat connectivity/watertightness as blocked until a human reviews the report";
      distractors = [
        "Keep running the same repair agent until it eventually exports something",
        "Lower mesh resolution so the topology error disappears from the report",
        "Export STL now and note the issue in a chat message later",
      ];
    } else if (err === "NONE") {
      correct =
        "Keep the pass report with the part and move on to orientation/clearance checks for print or handoff";
      distractors = [
        "Delete the QA report to save space — the part already passed once",
        "Re-run Spec Planner from a blank chat even though geometry already matches the brief",
        "Skip clearance checks because a green QA always means print-ready",
      ];
    } else if (err === "DIMENSION") {
      correct =
        "Send a targeted numeric repair (coder/repair) against the brief tolerances; keep the architect plan if structure is still sound";
      distractors = [
        "Throw away the whole Architect plan and invent a new part family from scratch",
        "Ignore the dimension delta if the mesh still looks smooth in the viewer",
        "Mark the sample complete without recording which dimension failed",
      ];
    } else {
      correct =
        "Route topology/connectivity issues back to plan or structural repair — do not only nudge unrelated dimensions";
      distractors = [
        "Scale the whole model by 1% and re-export without checking bodies",
        "Treat it as a pure dimension miss and only edit hole diameters",
        "Disable the topology engine so the next run shows green",
      ];
    }
    const q = makeQuiz(correct, distractors, 1000 + i * 17);
    return {
      prompt,
      ...q,
      why: "QA error type should drive the next step: halt on fatal, numeric repair on dimension, structural re-plan on topology, keep evidence on pass.",
    };
  }

  if (kind === 1) {
    const prompt = `[${id}] Spec Planner for a ${partDesc}: what should the compact CAD brief emphasize?`;
    const correct =
      "Envelope size, body count, watertightness, and key features in structured fields — not a full chat replay";
    const distractors = [
      "A free-form essay of every idea discussed, including abandoned sketches",
      "Only the material brand name, with no size or body-count targets",
      "A single emoji reaction instead of measurable goals",
    ];
    const q = makeQuiz(correct, distractors, 2000 + i * 13);
    return {
      prompt,
      ...q,
      why: "Compact briefs keep multi-agent handoffs testable: sizes, bodies, seals, and named features.",
    };
  }

  if (kind === 2) {
    const prompt = `[${id}] Someone says “${featA} on ${partId} is proven correct” but no measurement or QA note exists. Best claim label?`;
    const correct =
      "Assumption (or unproven) — confidence without a recorded check is not evidence";
    const distractors = [
      "Evidence — on-screen shading is enough proof for production geometry",
      "Inference — the feature looks standard for this part family, so it is fine",
      "Evidence — because the brief mentioned the feature name",
    ];
    const q = makeQuiz(correct, distractors, 3000 + i * 11);
    return {
      prompt,
      ...q,
      why: "Call it evidence only when a measurement, QA report, or primary record backs it.",
    };
  }

  if (kind === 3) {
    const prompt = `[${id}] Before writing build code for ${partId}, what should the Geometric Architect produce?`;
    const correct =
      "A step plan: sketches, feature order, critical dimensions, and checks — not finished mesh export";
    const distractors = [
      "Only a pretty render with no dimension targets",
      "Immediate STEP export so coding can be skipped",
      "A random feature list with no order or acceptance checks",
    ];
    const q = makeQuiz(correct, distractors, 4000 + i * 19);
    return {
      prompt,
      ...q,
      why: "Architect plans structure and acceptance; coder implements. Skipping the plan invites untestable geometry.",
    };
  }

  if (kind === 4) {
    const gap = i % 2 === 0 ? "0.4 mm" : "1.0 mm";
    const prompt = `[${id}] ${partDesc} is planned as print-in-place with moving parts (${mat}). What is a sound clearance habit?`;
    const correct = `Keep intentional gaps (about ${gap} class) between bodies that must move after print, and verify body count stays separate`;
    const distractors = [
      "Fuse all bodies into one solid so the slicer never sees seams",
      "Use zero gap everywhere and sand the print until it moves",
      "Ignore orientation because clearance only matters in CAD, not on the bed",
    ];
    const q = makeQuiz(correct, distractors, 5000 + i * 23);
    return {
      prompt,
      ...q,
      why: "Print-in-place needs designed clearance and independent bodies; fusing or zero-gap usually locks the mechanism.",
    };
  }

  // kind === 5 — stage-aware verification
  const prompt = `[${id}] At the ${stage} stage for ${partId} (${d3}×${d3}×${d1} mm, ${holeN} critical dims along ${axis}), what is a solid verification move?`;
  let correct;
  let distractors;
  if (stage === "brief") {
    correct =
      "Confirm the brief lists envelope, body count, and which dimensions are critical before anyone codes";
    distractors = [
      "Start coding features that were never named in the brief",
      "Assume the envelope is “about phone-sized” without numbers",
      "Skip body-count because single-body is always fine",
    ];
  } else if (stage === "qa" || stage === "repair") {
    correct = `Compare critical feature size (target ~${d2} mm) and topology/mesh reports to the brief before export`;
    distractors = [
      "Export first; only open the QA report if someone complains later",
      "Only check the pretty preview camera angle",
      "Change material intent to hide a failed dimension check",
    ];
  } else if (stage === "print") {
    correct =
      "Pick orientation and support strategy that protect thin walls and clearances called out in the brief";
    distractors = [
      "Orient randomly each time to average out warping",
      "Always stand the part on its weakest wall for drama",
      "Disable all clearance checks if print time is short",
    ];
  } else {
    correct = `Implement ${featA} and ${featB} in a controlled order, then re-check envelope ≈ ${d3}×${d3}×${d1} mm`;
    distractors = [
      "Add extra unrequested features first so the model looks busier",
      "Skip re-measure after boolean cuts because the sketch was once correct",
      "Delete the second feature if the first one compiled",
    ];
  }
  const q = makeQuiz(correct, distractors, 6000 + i * 29 + stage.length);
  return {
    prompt,
    ...q,
    why: "Each pipeline stage has a verification duty: brief completeness, planned features, measured dims, and print-aware checks.",
  };
}

const samples = [];
const seenTitles = new Set();
const seenPrompts = new Set();
const seenQuizPrompts = new Set();

for (let i = 0; i < 100; i++) {
  const fam = pick(families, i);
  const [partId, partDesc] = pick(parts, i * 3 + 7);
  const mat = pick(materials, i * 5 + 1);
  const axis = pick(axes, i);
  const stage = pick(fam.stages, i);
  const err = pick(errors, i + 2);
  const bas = pick(basis, i);
  const d1 = 10 + (i % 40);
  const d2 = 2 + (i % 12);
  const d3 = 20 + (i % 60);
  const holeN = 2 + (i % 6);
  const featA = pick(featuresBank, i);
  const featB = pick(featuresBank, i + 11);
  const featC = pick(featuresBank, i + 23);
  const trade = tradeLinks[i % tradeLinks.length];
  const id = `cad-${String(i + 1).padStart(3, "0")}`;

  let title = `${String(i + 1).padStart(3, "0")} · ${partId.replace(/-/g, " ")} · ${fam.label.split(" ")[0]}`;
  if (seenTitles.has(title)) title += ` · v${i}`;
  seenTitles.add(title);

  let prompt = `Design a ${partDesc} for training. Material intent: ${mat}. Overall envelope about ${d3}×${d3}×${d1} mm. Include ${featA} and ${featB}. Primary axis ${axis}. Feature count target: ${holeN} critical dims. Sample ID ${id}.`;
  if (seenPrompts.has(prompt)) prompt += ` Variant ${i}-B.`;
  seenPrompts.add(prompt);

  const quiz = buildQuiz({
    id,
    partId,
    partDesc,
    err,
    featA,
    featB,
    stage,
    d1,
    d2,
    d3,
    holeN,
    mat,
    axis,
    i,
  });
  if (seenQuizPrompts.has(quiz.prompt)) {
    quiz.prompt = `${quiz.prompt} (variant ${i})`;
  }
  seenQuizPrompts.add(quiz.prompt);

  samples.push({
    id,
    index: i + 1,
    title,
    family: fam.id,
    familyLabel: fam.label,
    partId,
    partDesc,
    difficulty: i < 30 ? "beginner" : i < 70 ? "intermediate" : "advanced",
    pipelineStage: stage,
    materialIntent: mat,
    primaryAxis: axis,
    prompt,
    features: [featA, featB, featC].filter((v, idx, a) => a.indexOf(v) === idx),
    dimensions: [
      { label: "envelope_xy", value: String(d3), unit: "mm" },
      { label: "height_z", value: String(d1), unit: "mm" },
      { label: "critical_feature", value: String(d2), unit: "mm" },
      { label: "pattern_count", value: String(holeN), unit: "count" },
    ],
    qaErrorType: err,
    integrityFocus: bas,
    tradeLink: trade,
    macLesson: stageLesson[stage],
    checkList: [
      `Confirm overall envelope ≈ ${d3}×${d3}×${d1} mm against the model or drawing.`,
      `Feature present: ${featA}.`,
      `Feature present: ${featB}.`,
      err === "NONE"
        ? "QA pass: keep the report with the artifact."
        : `If QA reports ${err}: choose the matching repair path before export.`,
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured.",
    ],
    quiz: {
      prompt: quiz.prompt,
      choices: quiz.choices,
      answerIndex: quiz.answerIndex,
      why: quiz.why,
    },
    scenarioHold:
      err === "FATAL"
        ? "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled."
        : err === "DIMENSION"
          ? "Hold final STEP until critical dimensions match the brief within stated tolerance."
          : null,
    humanReadableSummary: `Sample ${i + 1}/100: ${partDesc}. Family: ${fam.label}. Stage focus: ${stage}.`,
  });
}

if (new Set(samples.map((s) => s.id)).size !== 100) throw new Error("id dup");
if (new Set(samples.map((s) => s.title)).size !== 100) throw new Error("title dup");
if (new Set(samples.map((s) => s.prompt)).size !== 100) throw new Error("prompt dup");
if (new Set(samples.map((s) => s.quiz.prompt)).size !== 100) throw new Error("quiz dup");

// Guard: no fixed answerIndex monopoly; no banned learner-facing strings
const idxDist = { 0: 0, 1: 0, 2: 0, 3: 0 };
const banned =
  /municipality|city of |county of |parcel|street address|ssn|social security|operator private|skill brand|jurisdiction-ops|sovereign lens|sim-corps/i;
for (const s of samples) {
  idxDist[s.quiz.answerIndex] = (idxDist[s.quiz.answerIndex] || 0) + 1;
  const blob = `${s.quiz.prompt} ${s.quiz.choices.join(" ")} ${s.checkList.join(" ")}`;
  if (banned.test(blob)) {
    throw new Error(`banned learner string in ${s.id}`);
  }
}
const usedSlots = Object.values(idxDist).filter((n) => n > 0).length;
if (usedSlots < 3) {
  throw new Error(`answerIndex not shuffled enough: ${JSON.stringify(idxDist)}`);
}
const maxShare = Math.max(...Object.values(idxDist));
if (maxShare > 45) {
  throw new Error(`answerIndex too peaked: ${JSON.stringify(idxDist)}`);
}

mkdirSync(dirname(outPath), { recursive: true });

const header = `/**
 * Multi-Agent CAD educational sample pack — 100 unique, human-readable, testable items.
 * Offline curriculum aligned with Pan-Chera/Multi-Agent-CAD pipeline stages
 * (Spec Planner → Geometric Architect → Python Coder → Dual-Engine QA → Repair).
 *
 * Does NOT execute the Python CAD kernel or emit real STEP in-browser.
 * Teaches briefs, plans, QA routing, clearances, and integrity labels.
 *
 * Training geometry only — generic educational parts, no real site data.
 * Generate: node scripts/generate-cad-samples-100.mjs
 */

export type CadPipelineStage =
  | "brief"
  | "architect"
  | "coder"
  | "qa"
  | "repair"
  | "print";

export type CadSampleDifficulty = "beginner" | "intermediate" | "advanced";

export type CadDimension = {
  label: string;
  value: string;
  unit: string;
};

export type CadQuizItem = {
  prompt: string;
  choices: string[];
  answerIndex: number;
  why: string;
};

export type CadSample = {
  id: string;
  index: number;
  title: string;
  family: string;
  familyLabel: string;
  partId: string;
  partDesc: string;
  difficulty: CadSampleDifficulty;
  pipelineStage: CadPipelineStage;
  materialIntent: string;
  primaryAxis: string;
  prompt: string;
  features: string[];
  dimensions: CadDimension[];
  qaErrorType: "NONE" | "DIMENSION" | "TOPOLOGY" | "FATAL";
  integrityFocus: "Evidence" | "Inference" | "Assumption";
  tradeLink: string | null;
  macLesson: string;
  checkList: string[];
  quiz: CadQuizItem;
  scenarioHold: string | null;
  humanReadableSummary: string;
};

export const CAD_SAMPLES_100: CadSample[] = `;

const footer = `;

export const CAD_SAMPLE_COUNT = CAD_SAMPLES_100.length;

export function getCadSample(id: string): CadSample | undefined {
  return CAD_SAMPLES_100.find((s) => s.id === id);
}

export function listCadFamilies(): { id: string; label: string; count: number }[] {
  const map = new Map<string, { id: string; label: string; count: number }>();
  for (const s of CAD_SAMPLES_100) {
    const cur = map.get(s.family) ?? { id: s.family, label: s.familyLabel, count: 0 };
    cur.count += 1;
    map.set(s.family, cur);
  }
  return [...map.values()].sort((a, b) => a.id.localeCompare(b.id));
}

/** Runtime integrity gate used by e2e and lab UI */
export function assertCadSampleIntegrity(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (CAD_SAMPLES_100.length !== 100) {
    errors.push(\`count \${CAD_SAMPLES_100.length} !== 100\`);
  }
  const ids = new Set<string>();
  const titles = new Set<string>();
  const prompts = new Set<string>();
  const quizzes = new Set<string>();
  const idxDist: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
  const banned =
    /municipality|city of |county of |parcel\\s*#|street address|ssn|social security|operator private|skill brand/i;
  for (const s of CAD_SAMPLES_100) {
    if (!/^cad-\\d{3}$/.test(s.id)) errors.push(\`bad id \${s.id}\`);
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
    idxDist[s.quiz.answerIndex] = (idxDist[s.quiz.answerIndex] ?? 0) + 1;
    if (!s.features.length) errors.push(\`no features \${s.id}\`);
    if (!s.checkList.length) errors.push(\`no checklist \${s.id}\`);
    if (!s.macLesson.trim()) errors.push(\`empty lesson \${s.id}\`);
    if (!s.humanReadableSummary.trim()) errors.push(\`empty summary \${s.id}\`);
    for (const c of s.quiz.choices) {
      if (!c || c.length < 8) errors.push(\`weak choice \${s.id}\`);
      if (banned.test(c)) errors.push(\`banned choice language \${s.id}\`);
    }
    if (banned.test(s.quiz.prompt) || banned.test(s.prompt)) {
      errors.push(\`banned prompt language \${s.id}\`);
    }
  }
  const used = Object.values(idxDist).filter((n) => n > 0).length;
  if (used < 3) errors.push(\`answerIndex not distributed: \${JSON.stringify(idxDist)}\`);
  return { ok: errors.length === 0, errors };
}
`;

writeFileSync(outPath, header + JSON.stringify(samples, null, 2) + footer, "utf8");
console.log("Wrote", outPath);
console.log("count", samples.length, "families", new Set(samples.map((s) => s.family)).size);
console.log("answerIndex dist", idxDist);
