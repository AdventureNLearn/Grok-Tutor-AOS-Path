/**
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

export const CAD_SAMPLES_100: CadSample[] = [
  {
    "id": "cad-001",
    "index": 1,
    "title": "001 · brake rotor · Multi-Agent",
    "family": "mac-pipeline",
    "familyLabel": "Multi-Agent pipeline",
    "partId": "brake-rotor",
    "partDesc": "vented disc blank",
    "difficulty": "beginner",
    "pipelineStage": "brief",
    "materialIntent": "PETG",
    "primaryAxis": "X",
    "prompt": "Design a vented disc blank for training. Material intent: PETG. Overall envelope about 20×20×10 mm. Include through-hole array and draft angle. Primary axis X. Feature count target: 2 critical dims. Sample ID cad-001.",
    "features": [
      "through-hole array",
      "draft angle",
      "two independent bodies"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "20",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "10",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "2",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "2",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Evidence",
    "tradeLink": "welding",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 20×20×10 mm against the model or drawing.",
      "Feature present: through-hole array.",
      "Feature present: draft angle.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-001] Dual-engine QA on brake-rotor reports FATAL. What is the best next step?",
      "choices": [
        "Stop auto-repair loops; treat connectivity/watertightness as blocked until a human reviews the report",
        "Keep running the same repair agent until it eventually exports something",
        "Lower mesh resolution so the topology error disappears from the report",
        "Export STL now and note the issue in a chat message later"
      ],
      "answerIndex": 0,
      "why": "QA error type should drive the next step: halt on fatal, numeric repair on dimension, structural re-plan on topology, keep evidence on pass."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 1/100: vented disc blank. Family: Multi-Agent pipeline. Stage focus: brief."
  },
  {
    "id": "cad-002",
    "index": 2,
    "title": "002 · ball cage · Mechanical",
    "family": "mechanical",
    "familyLabel": "Mechanical features",
    "partId": "ball-cage",
    "partDesc": "cube cage trapping a ball",
    "difficulty": "beginner",
    "pipelineStage": "coder",
    "materialIntent": "HDPE sheet",
    "primaryAxis": "Y",
    "prompt": "Design a cube cage trapping a ball for training. Material intent: HDPE sheet. Overall envelope about 21×21×11 mm. Include fillet on outer edges and rib. Primary axis Y. Feature count target: 3 critical dims. Sample ID cad-002.",
    "features": [
      "fillet on outer edges",
      "rib",
      "overall bounding box check"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "21",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "11",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "3",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "3",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Inference",
    "tradeLink": "electrical",
    "macLesson": "Python Coder / build123d path turns plan into executable geometry code; deterministic first, LLM repair second.",
    "checkList": [
      "Confirm overall envelope ≈ 21×21×11 mm against the model or drawing.",
      "Feature present: fillet on outer edges.",
      "Feature present: rib.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-002] Spec Planner for a cube cage trapping a ball: what should the compact CAD brief emphasize?",
      "choices": [
        "A single emoji reaction instead of measurable goals",
        "Only the material brand name, with no size or body-count targets",
        "Envelope size, body count, watertightness, and key features in structured fields — not a full chat replay",
        "A free-form essay of every idea discussed, including abandoned sketches"
      ],
      "answerIndex": 2,
      "why": "Compact briefs keep multi-agent handoffs testable: sizes, bodies, seals, and named features."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 2/100: cube cage trapping a ball. Family: Mechanical features. Stage focus: coder."
  },
  {
    "id": "cad-003",
    "index": 3,
    "title": "003 · junction blank · Craft",
    "family": "trades-plan",
    "familyLabel": "Craft plan literacy",
    "partId": "junction-blank",
    "partDesc": "cover plate with knockouts",
    "difficulty": "beginner",
    "pipelineStage": "qa",
    "materialIntent": "aluminum 6061",
    "primaryAxis": "Z",
    "prompt": "Design a cover plate with knockouts for training. Material intent: aluminum 6061. Overall envelope about 22×22×12 mm. Include chamfer on top rim and slot. Primary axis Z. Feature count target: 4 critical dims. Sample ID cad-003.",
    "features": [
      "chamfer on top rim",
      "slot",
      "minimum wall 1.2 mm"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "22",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "12",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "4",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "4",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Assumption",
    "tradeLink": "plumbing",
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 22×22×12 mm against the model or drawing.",
      "Feature present: chamfer on top rim.",
      "Feature present: slot.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-003] Someone says “chamfer on top rim on junction-blank is proven correct” but no measurement or QA note exists. Best claim label?",
      "choices": [
        "Evidence — because the brief mentioned the feature name",
        "Inference — the feature looks standard for this part family, so it is fine",
        "Evidence — on-screen shading is enough proof for production geometry",
        "Assumption (or unproven) — confidence without a recorded check is not evidence"
      ],
      "answerIndex": 3,
      "why": "Call it evidence only when a measurement, QA report, or primary record backs it."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 3/100: cover plate with knockouts. Family: Craft plan literacy. Stage focus: qa."
  },
  {
    "id": "cad-004",
    "index": 4,
    "title": "004 · vent boot · Print-in-place",
    "family": "print-clearance",
    "familyLabel": "Print-in-place clearances",
    "partId": "vent-boot",
    "partDesc": "generic roof vent base",
    "difficulty": "beginner",
    "pipelineStage": "architect",
    "materialIntent": "PLA",
    "primaryAxis": "X",
    "prompt": "Design a generic roof vent base for training. Material intent: PLA. Overall envelope about 23×23×13 mm. Include counterbore and keyway. Primary axis X. Feature count target: 5 critical dims. Sample ID cad-004.",
    "features": [
      "counterbore",
      "keyway",
      "hole diameter tolerance ±0.1 mm"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "23",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "13",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "5",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "5",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Evidence",
    "tradeLink": "hvac",
    "macLesson": "Geometric Architect plans sketches, steps, selectors, and iron rules — not freehand code yet.",
    "checkList": [
      "Confirm overall envelope ≈ 23×23×13 mm against the model or drawing.",
      "Feature present: counterbore.",
      "Feature present: keyway.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-004] Before writing build code for vent-boot, what should the Geometric Architect produce?",
      "choices": [
        "Only a pretty render with no dimension targets",
        "A random feature list with no order or acceptance checks",
        "A step plan: sketches, feature order, critical dimensions, and checks — not finished mesh export",
        "Immediate STEP export so coding can be skipped"
      ],
      "answerIndex": 2,
      "why": "Architect plans structure and acceptance; coder implements. Skipping the plan invites untestable geometry."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 4/100: generic roof vent base. Family: Print-in-place clearances. Stage focus: architect."
  },
  {
    "id": "cad-005",
    "index": 5,
    "title": "005 · gear blank · Multi-body",
    "family": "assembly",
    "familyLabel": "Multi-body assembly",
    "partId": "gear-blank",
    "partDesc": "spur gear blank before teeth",
    "difficulty": "beginner",
    "pipelineStage": "coder",
    "materialIntent": "plywood panel",
    "primaryAxis": "Y",
    "prompt": "Design a spur gear blank before teeth for training. Material intent: plywood panel. Overall envelope about 24×24×14 mm. Include countersink and thread relief groove. Primary axis Y. Feature count target: 6 critical dims. Sample ID cad-005.",
    "features": [
      "countersink",
      "thread relief groove",
      "symmetry about midplane"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "24",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "14",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "6",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "6",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Inference",
    "tradeLink": "carpentry",
    "macLesson": "Python Coder / build123d path turns plan into executable geometry code; deterministic first, LLM repair second.",
    "checkList": [
      "Confirm overall envelope ≈ 24×24×14 mm against the model or drawing.",
      "Feature present: countersink.",
      "Feature present: thread relief groove.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-005] spur gear blank before teeth is planned as print-in-place with moving parts (plywood panel). What is a sound clearance habit?",
      "choices": [
        "Ignore orientation because clearance only matters in CAD, not on the bed",
        "Keep intentional gaps (about 0.4 mm class) between bodies that must move after print, and verify body count stays separate",
        "Use zero gap everywhere and sand the print until it moves",
        "Fuse all bodies into one solid so the slicer never sees seams"
      ],
      "answerIndex": 1,
      "why": "Print-in-place needs designed clearance and independent bodies; fusing or zero-gap usually locks the mechanism."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 5/100: spur gear blank before teeth. Family: Multi-body assembly. Stage focus: coder."
  },
  {
    "id": "cad-006",
    "index": 6,
    "title": "006 · manifold block · Integrity",
    "family": "integrity",
    "familyLabel": "Integrity on geometry",
    "partId": "manifold-block",
    "partDesc": "block with crossed ports",
    "difficulty": "beginner",
    "pipelineStage": "repair",
    "materialIntent": "ABS",
    "primaryAxis": "Z",
    "prompt": "Design a block with crossed ports for training. Material intent: ABS. Overall envelope about 25×25×15 mm. Include linear pattern and pilot hole. Primary axis Z. Feature count target: 7 critical dims. Sample ID cad-006.",
    "features": [
      "linear pattern",
      "pilot hole",
      "through-hole array"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "25",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "15",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "7",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "7",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Assumption",
    "tradeLink": "quality",
    "macLesson": "Repair agents edit code from QA evidence; max iterations; fatal errors halt.",
    "checkList": [
      "Confirm overall envelope ≈ 25×25×15 mm against the model or drawing.",
      "Feature present: linear pattern.",
      "Feature present: pilot hole.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-006] At the repair stage for manifold-block (25×25×15 mm, 7 critical dims along Z), what is a solid verification move?",
      "choices": [
        "Export first; only open the QA report if someone complains later",
        "Change material intent to hide a failed dimension check",
        "Compare critical feature size (target ~7 mm) and topology/mesh reports to the brief before export",
        "Only check the pretty preview camera angle"
      ],
      "answerIndex": 2,
      "why": "Each pipeline stage has a verification duty: brief completeness, planned features, measured dims, and print-aware checks."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 6/100: block with crossed ports. Family: Integrity on geometry. Stage focus: repair."
  },
  {
    "id": "cad-007",
    "index": 7,
    "title": "007 · spacer stack · Boolean",
    "family": "boolean-ops",
    "familyLabel": "Boolean and cut features",
    "partId": "spacer-stack",
    "partDesc": "stepped spacer",
    "difficulty": "beginner",
    "pipelineStage": "coder",
    "materialIntent": "nylon PA12",
    "primaryAxis": "X",
    "prompt": "Design a stepped spacer for training. Material intent: nylon PA12. Overall envelope about 26×26×16 mm. Include circular pattern and mounting pad. Primary axis X. Feature count target: 2 critical dims. Sample ID cad-007.",
    "features": [
      "circular pattern",
      "mounting pad",
      "fillet on outer edges"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "26",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "16",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "8",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "2",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Evidence",
    "tradeLink": "construction",
    "macLesson": "Python Coder / build123d path turns plan into executable geometry code; deterministic first, LLM repair second.",
    "checkList": [
      "Confirm overall envelope ≈ 26×26×16 mm against the model or drawing.",
      "Feature present: circular pattern.",
      "Feature present: mounting pad.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-007] Dual-engine QA on spacer-stack reports DIMENSION. What is the best next step?",
      "choices": [
        "Send a targeted numeric repair (coder/repair) against the brief tolerances; keep the architect plan if structure is still sound",
        "Mark the sample complete without recording which dimension failed",
        "Ignore the dimension delta if the mesh still looks smooth in the viewer",
        "Throw away the whole Architect plan and invent a new part family from scratch"
      ],
      "answerIndex": 0,
      "why": "QA error type should drive the next step: halt on fatal, numeric repair on dimension, structural re-plan on topology, keep evidence on pass."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 7/100: stepped spacer. Family: Boolean and cut features. Stage focus: coder."
  },
  {
    "id": "cad-008",
    "index": 8,
    "title": "008 · nozzle tip · Patterns",
    "family": "patterns",
    "familyLabel": "Patterns and arrays",
    "partId": "nozzle-tip",
    "partDesc": "conical orifice",
    "difficulty": "beginner",
    "pipelineStage": "coder",
    "materialIntent": "mild steel plate",
    "primaryAxis": "Y",
    "prompt": "Design a conical orifice for training. Material intent: mild steel plate. Overall envelope about 27×27×17 mm. Include helical sweep and clearance gap 0.4 mm. Primary axis Y. Feature count target: 3 critical dims. Sample ID cad-008.",
    "features": [
      "helical sweep",
      "clearance gap 0.4 mm",
      "chamfer on top rim"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "27",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "17",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "9",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "3",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Inference",
    "tradeLink": "automotive",
    "macLesson": "Python Coder / build123d path turns plan into executable geometry code; deterministic first, LLM repair second.",
    "checkList": [
      "Confirm overall envelope ≈ 27×27×17 mm against the model or drawing.",
      "Feature present: helical sweep.",
      "Feature present: clearance gap 0.4 mm.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-008] Spec Planner for a conical orifice: what should the compact CAD brief emphasize?",
      "choices": [
        "A free-form essay of every idea discussed, including abandoned sketches",
        "Only the material brand name, with no size or body-count targets",
        "Envelope size, body count, watertightness, and key features in structured fields — not a full chat replay",
        "A single emoji reaction instead of measurable goals"
      ],
      "answerIndex": 2,
      "why": "Compact briefs keep multi-agent handoffs testable: sizes, bodies, seals, and named features."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 8/100: conical orifice. Family: Patterns and arrays. Stage focus: coder."
  },
  {
    "id": "cad-009",
    "index": 9,
    "title": "009 · scaffold coupler · Fit",
    "family": "tolerances",
    "familyLabel": "Fit and tolerance",
    "partId": "scaffold-coupler",
    "partDesc": "pipe coupler training part",
    "difficulty": "beginner",
    "pipelineStage": "brief",
    "materialIntent": "PETG",
    "primaryAxis": "Z",
    "prompt": "Design a pipe coupler training part for training. Material intent: PETG. Overall envelope about 28×28×18 mm. Include boolean cut pocket and clearance gap 1.0 mm. Primary axis Z. Feature count target: 4 critical dims. Sample ID cad-009.",
    "features": [
      "boolean cut pocket",
      "clearance gap 1.0 mm",
      "counterbore"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "28",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "18",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "10",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "4",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Assumption",
    "tradeLink": "energy",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 28×28×18 mm against the model or drawing.",
      "Feature present: boolean cut pocket.",
      "Feature present: clearance gap 1.0 mm.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-009] Someone says “boolean cut pocket on scaffold-coupler is proven correct” but no measurement or QA note exists. Best claim label?",
      "choices": [
        "Evidence — because the brief mentioned the feature name",
        "Assumption (or unproven) — confidence without a recorded check is not evidence",
        "Inference — the feature looks standard for this part family, so it is fine",
        "Evidence — on-screen shading is enough proof for production geometry"
      ],
      "answerIndex": 1,
      "why": "Call it evidence only when a measurement, QA report, or primary record backs it."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 9/100: pipe coupler training part. Family: Fit and tolerance. Stage focus: brief."
  },
  {
    "id": "cad-010",
    "index": 10,
    "title": "010 · mud ring · Safety-critical",
    "family": "safety-geometry",
    "familyLabel": "Safety-critical dims",
    "partId": "mud-ring",
    "partDesc": "device ring training geometry",
    "difficulty": "beginner",
    "pipelineStage": "brief",
    "materialIntent": "HDPE sheet",
    "primaryAxis": "X",
    "prompt": "Design a device ring training geometry for training. Material intent: HDPE sheet. Overall envelope about 29×29×19 mm. Include boolean union boss and print orientation flat on base. Primary axis X. Feature count target: 5 critical dims. Sample ID cad-010.",
    "features": [
      "boolean union boss",
      "print orientation flat on base",
      "countersink"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "29",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "19",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "11",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "5",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Evidence",
    "tradeLink": null,
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 29×29×19 mm against the model or drawing.",
      "Feature present: boolean union boss.",
      "Feature present: print orientation flat on base.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-010] Before writing build code for mud-ring, what should the Geometric Architect produce?",
      "choices": [
        "A random feature list with no order or acceptance checks",
        "Immediate STEP export so coding can be skipped",
        "A step plan: sketches, feature order, critical dimensions, and checks — not finished mesh export",
        "Only a pretty render with no dimension targets"
      ],
      "answerIndex": 2,
      "why": "Architect plans structure and acceptance; coder implements. Skipping the plan invites untestable geometry."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 10/100: device ring training geometry. Family: Safety-critical dims. Stage focus: brief."
  },
  {
    "id": "cad-011",
    "index": 11,
    "title": "011 · register boot · Multi-Agent",
    "family": "mac-pipeline",
    "familyLabel": "Multi-Agent pipeline",
    "partId": "register-boot",
    "partDesc": "HVAC boot transition",
    "difficulty": "beginner",
    "pipelineStage": "brief",
    "materialIntent": "aluminum 6061",
    "primaryAxis": "Y",
    "prompt": "Design a HVAC boot transition for training. Material intent: aluminum 6061. Overall envelope about 30×30×20 mm. Include shell thickness and water-tight solid. Primary axis Y. Feature count target: 6 critical dims. Sample ID cad-011.",
    "features": [
      "shell thickness",
      "water-tight solid",
      "linear pattern"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "30",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "20",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "12",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "6",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Inference",
    "tradeLink": null,
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 30×30×20 mm against the model or drawing.",
      "Feature present: shell thickness.",
      "Feature present: water-tight solid.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-011] HVAC boot transition is planned as print-in-place with moving parts (aluminum 6061). What is a sound clearance habit?",
      "choices": [
        "Use zero gap everywhere and sand the print until it moves",
        "Fuse all bodies into one solid so the slicer never sees seams",
        "Ignore orientation because clearance only matters in CAD, not on the bed",
        "Keep intentional gaps (about 0.4 mm class) between bodies that must move after print, and verify body count stays separate"
      ],
      "answerIndex": 3,
      "why": "Print-in-place needs designed clearance and independent bodies; fusing or zero-gap usually locks the mechanism."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 11/100: HVAC boot transition. Family: Multi-Agent pipeline. Stage focus: brief."
  },
  {
    "id": "cad-012",
    "index": 12,
    "title": "012 · drone arm mount · Mechanical",
    "family": "mechanical",
    "familyLabel": "Mechanical features",
    "partId": "drone-arm-mount",
    "partDesc": "arm root plate",
    "difficulty": "beginner",
    "pipelineStage": "qa",
    "materialIntent": "PLA",
    "primaryAxis": "Z",
    "prompt": "Design a arm root plate for training. Material intent: PLA. Overall envelope about 31×31×21 mm. Include draft angle and single body. Primary axis Z. Feature count target: 7 critical dims. Sample ID cad-012.",
    "features": [
      "draft angle",
      "single body",
      "circular pattern"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "31",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "21",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "13",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "7",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Assumption",
    "tradeLink": "welding",
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 31×31×21 mm against the model or drawing.",
      "Feature present: draft angle.",
      "Feature present: single body.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-012] At the qa stage for drone-arm-mount (31×31×21 mm, 7 critical dims along Z), what is a solid verification move?",
      "choices": [
        "Compare critical feature size (target ~13 mm) and topology/mesh reports to the brief before export",
        "Export first; only open the QA report if someone complains later",
        "Change material intent to hide a failed dimension check",
        "Only check the pretty preview camera angle"
      ],
      "answerIndex": 0,
      "why": "Each pipeline stage has a verification duty: brief completeness, planned features, measured dims, and print-aware checks."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 12/100: arm root plate. Family: Mechanical features. Stage focus: qa."
  },
  {
    "id": "cad-013",
    "index": 13,
    "title": "013 · test cube · Craft",
    "family": "trades-plan",
    "familyLabel": "Craft plan literacy",
    "partId": "test-cube",
    "partDesc": "calibration cube",
    "difficulty": "beginner",
    "pipelineStage": "brief",
    "materialIntent": "plywood panel",
    "primaryAxis": "X",
    "prompt": "Design a calibration cube for training. Material intent: plywood panel. Overall envelope about 32×32×22 mm. Include rib and two independent bodies. Primary axis X. Feature count target: 2 critical dims. Sample ID cad-013.",
    "features": [
      "rib",
      "two independent bodies",
      "helical sweep"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "32",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "22",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "2",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "2",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Evidence",
    "tradeLink": "electrical",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 32×32×22 mm against the model or drawing.",
      "Feature present: rib.",
      "Feature present: two independent bodies.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-013] Dual-engine QA on test-cube reports FATAL. What is the best next step?",
      "choices": [
        "Export STL now and note the issue in a chat message later",
        "Stop auto-repair loops; treat connectivity/watertightness as blocked until a human reviews the report",
        "Lower mesh resolution so the topology error disappears from the report",
        "Keep running the same repair agent until it eventually exports something"
      ],
      "answerIndex": 1,
      "why": "QA error type should drive the next step: halt on fatal, numeric repair on dimension, structural re-plan on topology, keep evidence on pass."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 13/100: calibration cube. Family: Craft plan literacy. Stage focus: brief."
  },
  {
    "id": "cad-014",
    "index": 14,
    "title": "014 · dovetail slide · Print-in-place",
    "family": "print-clearance",
    "familyLabel": "Print-in-place clearances",
    "partId": "dovetail-slide",
    "partDesc": "male dovetail",
    "difficulty": "beginner",
    "pipelineStage": "qa",
    "materialIntent": "ABS",
    "primaryAxis": "Y",
    "prompt": "Design a male dovetail for training. Material intent: ABS. Overall envelope about 33×33×23 mm. Include slot and overall bounding box check. Primary axis Y. Feature count target: 3 critical dims. Sample ID cad-014.",
    "features": [
      "slot",
      "overall bounding box check",
      "boolean cut pocket"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "33",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "23",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "3",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "3",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Inference",
    "tradeLink": "plumbing",
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 33×33×23 mm against the model or drawing.",
      "Feature present: slot.",
      "Feature present: overall bounding box check.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-014] Spec Planner for a male dovetail: what should the compact CAD brief emphasize?",
      "choices": [
        "A free-form essay of every idea discussed, including abandoned sketches",
        "A single emoji reaction instead of measurable goals",
        "Envelope size, body count, watertightness, and key features in structured fields — not a full chat replay",
        "Only the material brand name, with no size or body-count targets"
      ],
      "answerIndex": 2,
      "why": "Compact briefs keep multi-agent handoffs testable: sizes, bodies, seals, and named features."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 14/100: male dovetail. Family: Print-in-place clearances. Stage focus: qa."
  },
  {
    "id": "cad-015",
    "index": 15,
    "title": "015 · timing pulley · Multi-body",
    "family": "assembly",
    "familyLabel": "Multi-body assembly",
    "partId": "timing-pulley",
    "partDesc": "pulley blank without teeth",
    "difficulty": "beginner",
    "pipelineStage": "qa",
    "materialIntent": "nylon PA12",
    "primaryAxis": "Z",
    "prompt": "Design a pulley blank without teeth for training. Material intent: nylon PA12. Overall envelope about 34×34×24 mm. Include keyway and minimum wall 1.2 mm. Primary axis Z. Feature count target: 4 critical dims. Sample ID cad-015.",
    "features": [
      "keyway",
      "minimum wall 1.2 mm",
      "boolean union boss"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "34",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "24",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "4",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "4",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Assumption",
    "tradeLink": "hvac",
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 34×34×24 mm against the model or drawing.",
      "Feature present: keyway.",
      "Feature present: minimum wall 1.2 mm.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-015] Someone says “keyway on timing-pulley is proven correct” but no measurement or QA note exists. Best claim label?",
      "choices": [
        "Evidence — because the brief mentioned the feature name",
        "Assumption (or unproven) — confidence without a recorded check is not evidence",
        "Inference — the feature looks standard for this part family, so it is fine",
        "Evidence — on-screen shading is enough proof for production geometry"
      ],
      "answerIndex": 1,
      "why": "Call it evidence only when a measurement, QA report, or primary record backs it."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 15/100: pulley blank without teeth. Family: Multi-body assembly. Stage focus: qa."
  },
  {
    "id": "cad-016",
    "index": 16,
    "title": "016 · stepped shaft · Integrity",
    "family": "integrity",
    "familyLabel": "Integrity on geometry",
    "partId": "stepped-shaft",
    "partDesc": "multi-diameter shaft",
    "difficulty": "beginner",
    "pipelineStage": "brief",
    "materialIntent": "mild steel plate",
    "primaryAxis": "X",
    "prompt": "Design a multi-diameter shaft for training. Material intent: mild steel plate. Overall envelope about 35×35×25 mm. Include thread relief groove and hole diameter tolerance ±0.1 mm. Primary axis X. Feature count target: 5 critical dims. Sample ID cad-016.",
    "features": [
      "thread relief groove",
      "hole diameter tolerance ±0.1 mm",
      "shell thickness"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "35",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "25",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "5",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "5",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Evidence",
    "tradeLink": "carpentry",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 35×35×25 mm against the model or drawing.",
      "Feature present: thread relief groove.",
      "Feature present: hole diameter tolerance ±0.1 mm.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-016] Before writing build code for stepped-shaft, what should the Geometric Architect produce?",
      "choices": [
        "A random feature list with no order or acceptance checks",
        "Only a pretty render with no dimension targets",
        "A step plan: sketches, feature order, critical dimensions, and checks — not finished mesh export",
        "Immediate STEP export so coding can be skipped"
      ],
      "answerIndex": 2,
      "why": "Architect plans structure and acceptance; coder implements. Skipping the plan invites untestable geometry."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 16/100: multi-diameter shaft. Family: Integrity on geometry. Stage focus: brief."
  },
  {
    "id": "cad-017",
    "index": 17,
    "title": "017 · impeller · Boolean",
    "family": "boolean-ops",
    "familyLabel": "Boolean and cut features",
    "partId": "impeller",
    "partDesc": "radial blade hub",
    "difficulty": "beginner",
    "pipelineStage": "qa",
    "materialIntent": "PETG",
    "primaryAxis": "Y",
    "prompt": "Design a radial blade hub for training. Material intent: PETG. Overall envelope about 36×36×26 mm. Include pilot hole and symmetry about midplane. Primary axis Y. Feature count target: 6 critical dims. Sample ID cad-017.",
    "features": [
      "pilot hole",
      "symmetry about midplane",
      "draft angle"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "36",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "26",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "6",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "6",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Inference",
    "tradeLink": "quality",
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 36×36×26 mm against the model or drawing.",
      "Feature present: pilot hole.",
      "Feature present: symmetry about midplane.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-017] radial blade hub is planned as print-in-place with moving parts (PETG). What is a sound clearance habit?",
      "choices": [
        "Ignore orientation because clearance only matters in CAD, not on the bed",
        "Use zero gap everywhere and sand the print until it moves",
        "Fuse all bodies into one solid so the slicer never sees seams",
        "Keep intentional gaps (about 0.4 mm class) between bodies that must move after print, and verify body count stays separate"
      ],
      "answerIndex": 3,
      "why": "Print-in-place needs designed clearance and independent bodies; fusing or zero-gap usually locks the mechanism."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 17/100: radial blade hub. Family: Boolean and cut features. Stage focus: qa."
  },
  {
    "id": "cad-018",
    "index": 18,
    "title": "018 · honeycomb tray · Patterns",
    "family": "patterns",
    "familyLabel": "Patterns and arrays",
    "partId": "honeycomb-tray",
    "partDesc": "hex cell organizer",
    "difficulty": "beginner",
    "pipelineStage": "qa",
    "materialIntent": "HDPE sheet",
    "primaryAxis": "Z",
    "prompt": "Design a hex cell organizer for training. Material intent: HDPE sheet. Overall envelope about 37×37×27 mm. Include mounting pad and through-hole array. Primary axis Z. Feature count target: 7 critical dims. Sample ID cad-018.",
    "features": [
      "mounting pad",
      "through-hole array",
      "rib"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "37",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "27",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "7",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "7",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Assumption",
    "tradeLink": "construction",
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 37×37×27 mm against the model or drawing.",
      "Feature present: mounting pad.",
      "Feature present: through-hole array.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-018] At the qa stage for honeycomb-tray (37×37×27 mm, 7 critical dims along Z), what is a solid verification move?",
      "choices": [
        "Compare critical feature size (target ~7 mm) and topology/mesh reports to the brief before export",
        "Change material intent to hide a failed dimension check",
        "Only check the pretty preview camera angle",
        "Export first; only open the QA report if someone complains later"
      ],
      "answerIndex": 0,
      "why": "Each pipeline stage has a verification duty: brief completeness, planned features, measured dims, and print-aware checks."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 18/100: hex cell organizer. Family: Patterns and arrays. Stage focus: qa."
  },
  {
    "id": "cad-019",
    "index": 19,
    "title": "019 · gyro ring · Fit",
    "family": "tolerances",
    "familyLabel": "Fit and tolerance",
    "partId": "gyro-ring",
    "partDesc": "outer ring with pivots",
    "difficulty": "beginner",
    "pipelineStage": "brief",
    "materialIntent": "aluminum 6061",
    "primaryAxis": "X",
    "prompt": "Design a outer ring with pivots for training. Material intent: aluminum 6061. Overall envelope about 38×38×28 mm. Include clearance gap 0.4 mm and fillet on outer edges. Primary axis X. Feature count target: 2 critical dims. Sample ID cad-019.",
    "features": [
      "clearance gap 0.4 mm",
      "fillet on outer edges",
      "slot"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "38",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "28",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "8",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "2",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Evidence",
    "tradeLink": "automotive",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 38×38×28 mm against the model or drawing.",
      "Feature present: clearance gap 0.4 mm.",
      "Feature present: fillet on outer edges.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-019] Dual-engine QA on gyro-ring reports DIMENSION. What is the best next step?",
      "choices": [
        "Send a targeted numeric repair (coder/repair) against the brief tolerances; keep the architect plan if structure is still sound",
        "Ignore the dimension delta if the mesh still looks smooth in the viewer",
        "Throw away the whole Architect plan and invent a new part family from scratch",
        "Mark the sample complete without recording which dimension failed"
      ],
      "answerIndex": 0,
      "why": "QA error type should drive the next step: halt on fatal, numeric repair on dimension, structural re-plan on topology, keep evidence on pass."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 19/100: outer ring with pivots. Family: Fit and tolerance. Stage focus: brief."
  },
  {
    "id": "cad-020",
    "index": 20,
    "title": "020 · duct collar · Safety-critical",
    "family": "safety-geometry",
    "familyLabel": "Safety-critical dims",
    "partId": "duct-collar",
    "partDesc": "round-to-rect transition stub",
    "difficulty": "beginner",
    "pipelineStage": "qa",
    "materialIntent": "PLA",
    "primaryAxis": "Y",
    "prompt": "Design a round-to-rect transition stub for training. Material intent: PLA. Overall envelope about 39×39×29 mm. Include clearance gap 1.0 mm and chamfer on top rim. Primary axis Y. Feature count target: 3 critical dims. Sample ID cad-020.",
    "features": [
      "clearance gap 1.0 mm",
      "chamfer on top rim",
      "keyway"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "39",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "29",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "9",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "3",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Inference",
    "tradeLink": "energy",
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 39×39×29 mm against the model or drawing.",
      "Feature present: clearance gap 1.0 mm.",
      "Feature present: chamfer on top rim.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-020] Spec Planner for a round-to-rect transition stub: what should the compact CAD brief emphasize?",
      "choices": [
        "Only the material brand name, with no size or body-count targets",
        "A free-form essay of every idea discussed, including abandoned sketches",
        "A single emoji reaction instead of measurable goals",
        "Envelope size, body count, watertightness, and key features in structured fields — not a full chat replay"
      ],
      "answerIndex": 3,
      "why": "Compact briefs keep multi-agent handoffs testable: sizes, bodies, seals, and named features."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 20/100: round-to-rect transition stub. Family: Safety-critical dims. Stage focus: qa."
  },
  {
    "id": "cad-021",
    "index": 21,
    "title": "021 · cable tray · Multi-Agent",
    "family": "mac-pipeline",
    "familyLabel": "Multi-Agent pipeline",
    "partId": "cable-tray",
    "partDesc": "ladder tray segment",
    "difficulty": "beginner",
    "pipelineStage": "brief",
    "materialIntent": "plywood panel",
    "primaryAxis": "Z",
    "prompt": "Design a ladder tray segment for training. Material intent: plywood panel. Overall envelope about 40×40×30 mm. Include print orientation flat on base and counterbore. Primary axis Z. Feature count target: 4 critical dims. Sample ID cad-021.",
    "features": [
      "print orientation flat on base",
      "counterbore",
      "thread relief groove"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "40",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "30",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "10",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "4",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Assumption",
    "tradeLink": null,
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 40×40×30 mm against the model or drawing.",
      "Feature present: print orientation flat on base.",
      "Feature present: counterbore.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-021] Someone says “print orientation flat on base on cable-tray is proven correct” but no measurement or QA note exists. Best claim label?",
      "choices": [
        "Inference — the feature looks standard for this part family, so it is fine",
        "Assumption (or unproven) — confidence without a recorded check is not evidence",
        "Evidence — on-screen shading is enough proof for production geometry",
        "Evidence — because the brief mentioned the feature name"
      ],
      "answerIndex": 1,
      "why": "Call it evidence only when a measurement, QA report, or primary record backs it."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 21/100: ladder tray segment. Family: Multi-Agent pipeline. Stage focus: brief."
  },
  {
    "id": "cad-022",
    "index": 22,
    "title": "022 · counterbore boss · Mechanical",
    "family": "mechanical",
    "familyLabel": "Mechanical features",
    "partId": "counterbore-boss",
    "partDesc": "raised boss with counterbore",
    "difficulty": "beginner",
    "pipelineStage": "architect",
    "materialIntent": "ABS",
    "primaryAxis": "X",
    "prompt": "Design a raised boss with counterbore for training. Material intent: ABS. Overall envelope about 41×41×31 mm. Include water-tight solid and countersink. Primary axis X. Feature count target: 5 critical dims. Sample ID cad-022.",
    "features": [
      "water-tight solid",
      "countersink",
      "pilot hole"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "41",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "31",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "11",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "5",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Evidence",
    "tradeLink": null,
    "macLesson": "Geometric Architect plans sketches, steps, selectors, and iron rules — not freehand code yet.",
    "checkList": [
      "Confirm overall envelope ≈ 41×41×31 mm against the model or drawing.",
      "Feature present: water-tight solid.",
      "Feature present: countersink.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-022] Before writing build code for counterbore-boss, what should the Geometric Architect produce?",
      "choices": [
        "A step plan: sketches, feature order, critical dimensions, and checks — not finished mesh export",
        "Only a pretty render with no dimension targets",
        "A random feature list with no order or acceptance checks",
        "Immediate STEP export so coding can be skipped"
      ],
      "answerIndex": 0,
      "why": "Architect plans structure and acceptance; coder implements. Skipping the plan invites untestable geometry."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 22/100: raised boss with counterbore. Family: Mechanical features. Stage focus: architect."
  },
  {
    "id": "cad-023",
    "index": 23,
    "title": "023 · hinge leaf · Craft",
    "family": "trades-plan",
    "familyLabel": "Craft plan literacy",
    "partId": "hinge-leaf",
    "partDesc": "leaf with knuckle half",
    "difficulty": "beginner",
    "pipelineStage": "architect",
    "materialIntent": "nylon PA12",
    "primaryAxis": "Y",
    "prompt": "Design a leaf with knuckle half for training. Material intent: nylon PA12. Overall envelope about 42×42×32 mm. Include single body and linear pattern. Primary axis Y. Feature count target: 6 critical dims. Sample ID cad-023.",
    "features": [
      "single body",
      "linear pattern",
      "mounting pad"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "42",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "32",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "12",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "6",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Inference",
    "tradeLink": "welding",
    "macLesson": "Geometric Architect plans sketches, steps, selectors, and iron rules — not freehand code yet.",
    "checkList": [
      "Confirm overall envelope ≈ 42×42×32 mm against the model or drawing.",
      "Feature present: single body.",
      "Feature present: linear pattern.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-023] leaf with knuckle half is planned as print-in-place with moving parts (nylon PA12). What is a sound clearance habit?",
      "choices": [
        "Use zero gap everywhere and sand the print until it moves",
        "Ignore orientation because clearance only matters in CAD, not on the bed",
        "Keep intentional gaps (about 0.4 mm class) between bodies that must move after print, and verify body count stays separate",
        "Fuse all bodies into one solid so the slicer never sees seams"
      ],
      "answerIndex": 2,
      "why": "Print-in-place needs designed clearance and independent bodies; fusing or zero-gap usually locks the mechanism."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 23/100: leaf with knuckle half. Family: Craft plan literacy. Stage focus: architect."
  },
  {
    "id": "cad-024",
    "index": 24,
    "title": "024 · cam lobe · Print-in-place",
    "family": "print-clearance",
    "familyLabel": "Print-in-place clearances",
    "partId": "cam-lobe",
    "partDesc": "simple plate cam",
    "difficulty": "beginner",
    "pipelineStage": "print",
    "materialIntent": "mild steel plate",
    "primaryAxis": "Z",
    "prompt": "Design a simple plate cam for training. Material intent: mild steel plate. Overall envelope about 43×43×33 mm. Include two independent bodies and circular pattern. Primary axis Z. Feature count target: 7 critical dims. Sample ID cad-024.",
    "features": [
      "two independent bodies",
      "circular pattern",
      "clearance gap 0.4 mm"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "43",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "33",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "13",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "7",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Assumption",
    "tradeLink": "electrical",
    "macLesson": "Print orientation and clearance gaps matter for articulable / print-in-place parts.",
    "checkList": [
      "Confirm overall envelope ≈ 43×43×33 mm against the model or drawing.",
      "Feature present: two independent bodies.",
      "Feature present: circular pattern.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-024] At the print stage for cam-lobe (43×43×33 mm, 7 critical dims along Z), what is a solid verification move?",
      "choices": [
        "Always stand the part on its weakest wall for drama",
        "Pick orientation and support strategy that protect thin walls and clearances called out in the brief",
        "Orient randomly each time to average out warping",
        "Disable all clearance checks if print time is short"
      ],
      "answerIndex": 1,
      "why": "Each pipeline stage has a verification duty: brief completeness, planned features, measured dims, and print-aware checks."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 24/100: simple plate cam. Family: Print-in-place clearances. Stage focus: print."
  },
  {
    "id": "cad-025",
    "index": 25,
    "title": "025 · filter frame · Multi-body",
    "family": "assembly",
    "familyLabel": "Multi-body assembly",
    "partId": "filter-frame",
    "partDesc": "square frame with mesh seat",
    "difficulty": "beginner",
    "pipelineStage": "architect",
    "materialIntent": "PETG",
    "primaryAxis": "X",
    "prompt": "Design a square frame with mesh seat for training. Material intent: PETG. Overall envelope about 44×44×34 mm. Include overall bounding box check and helical sweep. Primary axis X. Feature count target: 2 critical dims. Sample ID cad-025.",
    "features": [
      "overall bounding box check",
      "helical sweep",
      "clearance gap 1.0 mm"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "44",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "34",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "2",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "2",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Evidence",
    "tradeLink": "plumbing",
    "macLesson": "Geometric Architect plans sketches, steps, selectors, and iron rules — not freehand code yet.",
    "checkList": [
      "Confirm overall envelope ≈ 44×44×34 mm against the model or drawing.",
      "Feature present: overall bounding box check.",
      "Feature present: helical sweep.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-025] Dual-engine QA on filter-frame reports FATAL. What is the best next step?",
      "choices": [
        "Lower mesh resolution so the topology error disappears from the report",
        "Export STL now and note the issue in a chat message later",
        "Stop auto-repair loops; treat connectivity/watertightness as blocked until a human reviews the report",
        "Keep running the same repair agent until it eventually exports something"
      ],
      "answerIndex": 2,
      "why": "QA error type should drive the next step: halt on fatal, numeric repair on dimension, structural re-plan on topology, keep evidence on pass."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 25/100: square frame with mesh seat. Family: Multi-body assembly. Stage focus: architect."
  },
  {
    "id": "cad-026",
    "index": 26,
    "title": "026 · weld coupon · Integrity",
    "family": "integrity",
    "familyLabel": "Integrity on geometry",
    "partId": "weld-coupon",
    "partDesc": "test plate with bevel prep",
    "difficulty": "beginner",
    "pipelineStage": "qa",
    "materialIntent": "HDPE sheet",
    "primaryAxis": "Y",
    "prompt": "Design a test plate with bevel prep for training. Material intent: HDPE sheet. Overall envelope about 45×45×35 mm. Include minimum wall 1.2 mm and boolean cut pocket. Primary axis Y. Feature count target: 3 critical dims. Sample ID cad-026.",
    "features": [
      "minimum wall 1.2 mm",
      "boolean cut pocket",
      "print orientation flat on base"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "45",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "35",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "3",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "3",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Inference",
    "tradeLink": "hvac",
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 45×45×35 mm against the model or drawing.",
      "Feature present: minimum wall 1.2 mm.",
      "Feature present: boolean cut pocket.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-026] Spec Planner for a test plate with bevel prep: what should the compact CAD brief emphasize?",
      "choices": [
        "A single emoji reaction instead of measurable goals",
        "Envelope size, body count, watertightness, and key features in structured fields — not a full chat replay",
        "Only the material brand name, with no size or body-count targets",
        "A free-form essay of every idea discussed, including abandoned sketches"
      ],
      "answerIndex": 1,
      "why": "Compact briefs keep multi-agent handoffs testable: sizes, bodies, seals, and named features."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 26/100: test plate with bevel prep. Family: Integrity on geometry. Stage focus: qa."
  },
  {
    "id": "cad-027",
    "index": 27,
    "title": "027 · flange spacer · Boolean",
    "family": "boolean-ops",
    "familyLabel": "Boolean and cut features",
    "partId": "flange-spacer",
    "partDesc": "generic spacer ring",
    "difficulty": "beginner",
    "pipelineStage": "repair",
    "materialIntent": "aluminum 6061",
    "primaryAxis": "Z",
    "prompt": "Design a generic spacer ring for training. Material intent: aluminum 6061. Overall envelope about 46×46×36 mm. Include hole diameter tolerance ±0.1 mm and boolean union boss. Primary axis Z. Feature count target: 4 critical dims. Sample ID cad-027.",
    "features": [
      "hole diameter tolerance ±0.1 mm",
      "boolean union boss",
      "water-tight solid"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "46",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "36",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "4",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "4",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Assumption",
    "tradeLink": "carpentry",
    "macLesson": "Repair agents edit code from QA evidence; max iterations; fatal errors halt.",
    "checkList": [
      "Confirm overall envelope ≈ 46×46×36 mm against the model or drawing.",
      "Feature present: hole diameter tolerance ±0.1 mm.",
      "Feature present: boolean union boss.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-027] Someone says “hole diameter tolerance ±0.1 mm on flange-spacer is proven correct” but no measurement or QA note exists. Best claim label?",
      "choices": [
        "Inference — the feature looks standard for this part family, so it is fine",
        "Evidence — on-screen shading is enough proof for production geometry",
        "Evidence — because the brief mentioned the feature name",
        "Assumption (or unproven) — confidence without a recorded check is not evidence"
      ],
      "answerIndex": 3,
      "why": "Call it evidence only when a measurement, QA report, or primary record backs it."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 27/100: generic spacer ring. Family: Boolean and cut features. Stage focus: repair."
  },
  {
    "id": "cad-028",
    "index": 28,
    "title": "028 · solar rail end · Patterns",
    "family": "patterns",
    "familyLabel": "Patterns and arrays",
    "partId": "solar-rail-end",
    "partDesc": "rail end cap",
    "difficulty": "beginner",
    "pipelineStage": "architect",
    "materialIntent": "PLA",
    "primaryAxis": "X",
    "prompt": "Design a rail end cap for training. Material intent: PLA. Overall envelope about 47×47×37 mm. Include symmetry about midplane and shell thickness. Primary axis X. Feature count target: 5 critical dims. Sample ID cad-028.",
    "features": [
      "symmetry about midplane",
      "shell thickness",
      "single body"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "47",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "37",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "5",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "5",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Evidence",
    "tradeLink": "quality",
    "macLesson": "Geometric Architect plans sketches, steps, selectors, and iron rules — not freehand code yet.",
    "checkList": [
      "Confirm overall envelope ≈ 47×47×37 mm against the model or drawing.",
      "Feature present: symmetry about midplane.",
      "Feature present: shell thickness.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-028] Before writing build code for solar-rail-end, what should the Geometric Architect produce?",
      "choices": [
        "Only a pretty render with no dimension targets",
        "Immediate STEP export so coding can be skipped",
        "A step plan: sketches, feature order, critical dimensions, and checks — not finished mesh export",
        "A random feature list with no order or acceptance checks"
      ],
      "answerIndex": 2,
      "why": "Architect plans structure and acceptance; coder implements. Skipping the plan invites untestable geometry."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 28/100: rail end cap. Family: Patterns and arrays. Stage focus: architect."
  },
  {
    "id": "cad-029",
    "index": 29,
    "title": "029 · gimbal yoke · Fit",
    "family": "tolerances",
    "familyLabel": "Fit and tolerance",
    "partId": "gimbal-yoke",
    "partDesc": "yoke with through-bore",
    "difficulty": "beginner",
    "pipelineStage": "brief",
    "materialIntent": "plywood panel",
    "primaryAxis": "Y",
    "prompt": "Design a yoke with through-bore for training. Material intent: plywood panel. Overall envelope about 48×48×38 mm. Include through-hole array and draft angle. Primary axis Y. Feature count target: 6 critical dims. Sample ID cad-029.",
    "features": [
      "through-hole array",
      "draft angle",
      "two independent bodies"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "48",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "38",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "6",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "6",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Inference",
    "tradeLink": "construction",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 48×48×38 mm against the model or drawing.",
      "Feature present: through-hole array.",
      "Feature present: draft angle.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-029] yoke with through-bore is planned as print-in-place with moving parts (plywood panel). What is a sound clearance habit?",
      "choices": [
        "Use zero gap everywhere and sand the print until it moves",
        "Ignore orientation because clearance only matters in CAD, not on the bed",
        "Keep intentional gaps (about 0.4 mm class) between bodies that must move after print, and verify body count stays separate",
        "Fuse all bodies into one solid so the slicer never sees seams"
      ],
      "answerIndex": 2,
      "why": "Print-in-place needs designed clearance and independent bodies; fusing or zero-gap usually locks the mechanism."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 29/100: yoke with through-bore. Family: Fit and tolerance. Stage focus: brief."
  },
  {
    "id": "cad-030",
    "index": 30,
    "title": "030 · thread gauge · Safety-critical",
    "family": "safety-geometry",
    "familyLabel": "Safety-critical dims",
    "partId": "thread-gauge",
    "partDesc": "go/no-go style training plate",
    "difficulty": "beginner",
    "pipelineStage": "repair",
    "materialIntent": "ABS",
    "primaryAxis": "Z",
    "prompt": "Design a go/no-go style training plate for training. Material intent: ABS. Overall envelope about 49×49×39 mm. Include fillet on outer edges and rib. Primary axis Z. Feature count target: 7 critical dims. Sample ID cad-030.",
    "features": [
      "fillet on outer edges",
      "rib",
      "overall bounding box check"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "49",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "39",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "7",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "7",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Assumption",
    "tradeLink": "automotive",
    "macLesson": "Repair agents edit code from QA evidence; max iterations; fatal errors halt.",
    "checkList": [
      "Confirm overall envelope ≈ 49×49×39 mm against the model or drawing.",
      "Feature present: fillet on outer edges.",
      "Feature present: rib.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-030] At the repair stage for thread-gauge (49×49×39 mm, 7 critical dims along Z), what is a solid verification move?",
      "choices": [
        "Only check the pretty preview camera angle",
        "Export first; only open the QA report if someone complains later",
        "Compare critical feature size (target ~7 mm) and topology/mesh reports to the brief before export",
        "Change material intent to hide a failed dimension check"
      ],
      "answerIndex": 2,
      "why": "Each pipeline stage has a verification duty: brief completeness, planned features, measured dims, and print-aware checks."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 30/100: go/no-go style training plate. Family: Safety-critical dims. Stage focus: repair."
  },
  {
    "id": "cad-031",
    "index": 31,
    "title": "031 · t nut · Multi-Agent",
    "family": "mac-pipeline",
    "familyLabel": "Multi-Agent pipeline",
    "partId": "t-nut",
    "partDesc": "T-nut body",
    "difficulty": "intermediate",
    "pipelineStage": "brief",
    "materialIntent": "nylon PA12",
    "primaryAxis": "X",
    "prompt": "Design a T-nut body for training. Material intent: nylon PA12. Overall envelope about 50×50×40 mm. Include chamfer on top rim and slot. Primary axis X. Feature count target: 2 critical dims. Sample ID cad-031.",
    "features": [
      "chamfer on top rim",
      "slot",
      "minimum wall 1.2 mm"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "50",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "40",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "8",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "2",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Evidence",
    "tradeLink": "energy",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 50×50×40 mm against the model or drawing.",
      "Feature present: chamfer on top rim.",
      "Feature present: slot.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-031] Dual-engine QA on t-nut reports DIMENSION. What is the best next step?",
      "choices": [
        "Mark the sample complete without recording which dimension failed",
        "Ignore the dimension delta if the mesh still looks smooth in the viewer",
        "Send a targeted numeric repair (coder/repair) against the brief tolerances; keep the architect plan if structure is still sound",
        "Throw away the whole Architect plan and invent a new part family from scratch"
      ],
      "answerIndex": 2,
      "why": "QA error type should drive the next step: halt on fatal, numeric repair on dimension, structural re-plan on topology, keep evidence on pass."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 31/100: T-nut body. Family: Multi-Agent pipeline. Stage focus: brief."
  },
  {
    "id": "cad-032",
    "index": 32,
    "title": "032 · flange · Mechanical",
    "family": "mechanical",
    "familyLabel": "Mechanical features",
    "partId": "flange",
    "partDesc": "circular plate with bolt circle",
    "difficulty": "intermediate",
    "pipelineStage": "coder",
    "materialIntent": "mild steel plate",
    "primaryAxis": "Y",
    "prompt": "Design a circular plate with bolt circle for training. Material intent: mild steel plate. Overall envelope about 51×51×41 mm. Include counterbore and keyway. Primary axis Y. Feature count target: 3 critical dims. Sample ID cad-032.",
    "features": [
      "counterbore",
      "keyway",
      "hole diameter tolerance ±0.1 mm"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "51",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "41",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "9",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "3",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Inference",
    "tradeLink": null,
    "macLesson": "Python Coder / build123d path turns plan into executable geometry code; deterministic first, LLM repair second.",
    "checkList": [
      "Confirm overall envelope ≈ 51×51×41 mm against the model or drawing.",
      "Feature present: counterbore.",
      "Feature present: keyway.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-032] Spec Planner for a circular plate with bolt circle: what should the compact CAD brief emphasize?",
      "choices": [
        "A free-form essay of every idea discussed, including abandoned sketches",
        "A single emoji reaction instead of measurable goals",
        "Only the material brand name, with no size or body-count targets",
        "Envelope size, body count, watertightness, and key features in structured fields — not a full chat replay"
      ],
      "answerIndex": 3,
      "why": "Compact briefs keep multi-agent handoffs testable: sizes, bodies, seals, and named features."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 32/100: circular plate with bolt circle. Family: Mechanical features. Stage focus: coder."
  },
  {
    "id": "cad-033",
    "index": 33,
    "title": "033 · open enclosure · Craft",
    "family": "trades-plan",
    "familyLabel": "Craft plan literacy",
    "partId": "open-enclosure",
    "partDesc": "box with open top",
    "difficulty": "intermediate",
    "pipelineStage": "qa",
    "materialIntent": "PETG",
    "primaryAxis": "Z",
    "prompt": "Design a box with open top for training. Material intent: PETG. Overall envelope about 52×52×42 mm. Include countersink and thread relief groove. Primary axis Z. Feature count target: 4 critical dims. Sample ID cad-033.",
    "features": [
      "countersink",
      "thread relief groove",
      "symmetry about midplane"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "52",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "42",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "10",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "4",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Assumption",
    "tradeLink": null,
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 52×52×42 mm against the model or drawing.",
      "Feature present: countersink.",
      "Feature present: thread relief groove.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-033] Someone says “countersink on open-enclosure is proven correct” but no measurement or QA note exists. Best claim label?",
      "choices": [
        "Assumption (or unproven) — confidence without a recorded check is not evidence",
        "Evidence — on-screen shading is enough proof for production geometry",
        "Inference — the feature looks standard for this part family, so it is fine",
        "Evidence — because the brief mentioned the feature name"
      ],
      "answerIndex": 0,
      "why": "Call it evidence only when a measurement, QA report, or primary record backs it."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 33/100: box with open top. Family: Craft plan literacy. Stage focus: qa."
  },
  {
    "id": "cad-034",
    "index": 34,
    "title": "034 · geneva wheel · Print-in-place",
    "family": "print-clearance",
    "familyLabel": "Print-in-place clearances",
    "partId": "geneva-wheel",
    "partDesc": "intermittent drive disk",
    "difficulty": "intermediate",
    "pipelineStage": "architect",
    "materialIntent": "HDPE sheet",
    "primaryAxis": "X",
    "prompt": "Design a intermittent drive disk for training. Material intent: HDPE sheet. Overall envelope about 53×53×43 mm. Include linear pattern and pilot hole. Primary axis X. Feature count target: 5 critical dims. Sample ID cad-034.",
    "features": [
      "linear pattern",
      "pilot hole",
      "through-hole array"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "53",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "43",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "11",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "5",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Evidence",
    "tradeLink": "welding",
    "macLesson": "Geometric Architect plans sketches, steps, selectors, and iron rules — not freehand code yet.",
    "checkList": [
      "Confirm overall envelope ≈ 53×53×43 mm against the model or drawing.",
      "Feature present: linear pattern.",
      "Feature present: pilot hole.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-034] Before writing build code for geneva-wheel, what should the Geometric Architect produce?",
      "choices": [
        "Only a pretty render with no dimension targets",
        "A random feature list with no order or acceptance checks",
        "A step plan: sketches, feature order, critical dimensions, and checks — not finished mesh export",
        "Immediate STEP export so coding can be skipped"
      ],
      "answerIndex": 2,
      "why": "Architect plans structure and acceptance; coder implements. Skipping the plan invites untestable geometry."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 34/100: intermittent drive disk. Family: Print-in-place clearances. Stage focus: architect."
  },
  {
    "id": "cad-035",
    "index": 35,
    "title": "035 · phone stand · Multi-body",
    "family": "assembly",
    "familyLabel": "Multi-body assembly",
    "partId": "phone-stand",
    "partDesc": "angled rest",
    "difficulty": "intermediate",
    "pipelineStage": "coder",
    "materialIntent": "aluminum 6061",
    "primaryAxis": "Y",
    "prompt": "Design a angled rest for training. Material intent: aluminum 6061. Overall envelope about 54×54×44 mm. Include circular pattern and mounting pad. Primary axis Y. Feature count target: 6 critical dims. Sample ID cad-035.",
    "features": [
      "circular pattern",
      "mounting pad",
      "fillet on outer edges"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "54",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "44",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "12",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "6",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Inference",
    "tradeLink": "electrical",
    "macLesson": "Python Coder / build123d path turns plan into executable geometry code; deterministic first, LLM repair second.",
    "checkList": [
      "Confirm overall envelope ≈ 54×54×44 mm against the model or drawing.",
      "Feature present: circular pattern.",
      "Feature present: mounting pad.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-035] angled rest is planned as print-in-place with moving parts (aluminum 6061). What is a sound clearance habit?",
      "choices": [
        "Fuse all bodies into one solid so the slicer never sees seams",
        "Ignore orientation because clearance only matters in CAD, not on the bed",
        "Use zero gap everywhere and sand the print until it moves",
        "Keep intentional gaps (about 0.4 mm class) between bodies that must move after print, and verify body count stays separate"
      ],
      "answerIndex": 3,
      "why": "Print-in-place needs designed clearance and independent bodies; fusing or zero-gap usually locks the mechanism."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 35/100: angled rest. Family: Multi-body assembly. Stage focus: coder."
  },
  {
    "id": "cad-036",
    "index": 36,
    "title": "036 · pipe hanger · Integrity",
    "family": "integrity",
    "familyLabel": "Integrity on geometry",
    "partId": "pipe-hanger",
    "partDesc": "U-strap with base",
    "difficulty": "intermediate",
    "pipelineStage": "repair",
    "materialIntent": "PLA",
    "primaryAxis": "Z",
    "prompt": "Design a U-strap with base for training. Material intent: PLA. Overall envelope about 55×55×45 mm. Include helical sweep and clearance gap 0.4 mm. Primary axis Z. Feature count target: 7 critical dims. Sample ID cad-036.",
    "features": [
      "helical sweep",
      "clearance gap 0.4 mm",
      "chamfer on top rim"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "55",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "45",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "13",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "7",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Assumption",
    "tradeLink": "plumbing",
    "macLesson": "Repair agents edit code from QA evidence; max iterations; fatal errors halt.",
    "checkList": [
      "Confirm overall envelope ≈ 55×55×45 mm against the model or drawing.",
      "Feature present: helical sweep.",
      "Feature present: clearance gap 0.4 mm.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-036] At the repair stage for pipe-hanger (55×55×45 mm, 7 critical dims along Z), what is a solid verification move?",
      "choices": [
        "Only check the pretty preview camera angle",
        "Change material intent to hide a failed dimension check",
        "Compare critical feature size (target ~13 mm) and topology/mesh reports to the brief before export",
        "Export first; only open the QA report if someone complains later"
      ],
      "answerIndex": 2,
      "why": "Each pipeline stage has a verification duty: brief completeness, planned features, measured dims, and print-aware checks."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 36/100: U-strap with base. Family: Integrity on geometry. Stage focus: repair."
  },
  {
    "id": "cad-037",
    "index": 37,
    "title": "037 · wall plate · Boolean",
    "family": "boolean-ops",
    "familyLabel": "Boolean and cut features",
    "partId": "wall-plate",
    "partDesc": "bottom plate with stud marks",
    "difficulty": "intermediate",
    "pipelineStage": "coder",
    "materialIntent": "plywood panel",
    "primaryAxis": "X",
    "prompt": "Design a bottom plate with stud marks for training. Material intent: plywood panel. Overall envelope about 56×56×46 mm. Include boolean cut pocket and clearance gap 1.0 mm. Primary axis X. Feature count target: 2 critical dims. Sample ID cad-037.",
    "features": [
      "boolean cut pocket",
      "clearance gap 1.0 mm",
      "counterbore"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "56",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "46",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "2",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "2",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Evidence",
    "tradeLink": "hvac",
    "macLesson": "Python Coder / build123d path turns plan into executable geometry code; deterministic first, LLM repair second.",
    "checkList": [
      "Confirm overall envelope ≈ 56×56×46 mm against the model or drawing.",
      "Feature present: boolean cut pocket.",
      "Feature present: clearance gap 1.0 mm.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-037] Dual-engine QA on wall-plate reports FATAL. What is the best next step?",
      "choices": [
        "Stop auto-repair loops; treat connectivity/watertightness as blocked until a human reviews the report",
        "Keep running the same repair agent until it eventually exports something",
        "Lower mesh resolution so the topology error disappears from the report",
        "Export STL now and note the issue in a chat message later"
      ],
      "answerIndex": 0,
      "why": "QA error type should drive the next step: halt on fatal, numeric repair on dimension, structural re-plan on topology, keep evidence on pass."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 37/100: bottom plate with stud marks. Family: Boolean and cut features. Stage focus: coder."
  },
  {
    "id": "cad-038",
    "index": 38,
    "title": "038 · bearing block · Patterns",
    "family": "patterns",
    "familyLabel": "Patterns and arrays",
    "partId": "bearing-block",
    "partDesc": "pillow block housing",
    "difficulty": "intermediate",
    "pipelineStage": "coder",
    "materialIntent": "ABS",
    "primaryAxis": "Y",
    "prompt": "Design a pillow block housing for training. Material intent: ABS. Overall envelope about 57×57×47 mm. Include boolean union boss and print orientation flat on base. Primary axis Y. Feature count target: 3 critical dims. Sample ID cad-038.",
    "features": [
      "boolean union boss",
      "print orientation flat on base",
      "countersink"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "57",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "47",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "3",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "3",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Inference",
    "tradeLink": "carpentry",
    "macLesson": "Python Coder / build123d path turns plan into executable geometry code; deterministic first, LLM repair second.",
    "checkList": [
      "Confirm overall envelope ≈ 57×57×47 mm against the model or drawing.",
      "Feature present: boolean union boss.",
      "Feature present: print orientation flat on base.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-038] Spec Planner for a pillow block housing: what should the compact CAD brief emphasize?",
      "choices": [
        "A single emoji reaction instead of measurable goals",
        "Envelope size, body count, watertightness, and key features in structured fields — not a full chat replay",
        "Only the material brand name, with no size or body-count targets",
        "A free-form essay of every idea discussed, including abandoned sketches"
      ],
      "answerIndex": 1,
      "why": "Compact briefs keep multi-agent handoffs testable: sizes, bodies, seals, and named features."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 38/100: pillow block housing. Family: Patterns and arrays. Stage focus: coder."
  },
  {
    "id": "cad-039",
    "index": 39,
    "title": "039 · heat sink · Fit",
    "family": "tolerances",
    "familyLabel": "Fit and tolerance",
    "partId": "heat-sink",
    "partDesc": "base with parallel fins",
    "difficulty": "intermediate",
    "pipelineStage": "brief",
    "materialIntent": "nylon PA12",
    "primaryAxis": "Z",
    "prompt": "Design a base with parallel fins for training. Material intent: nylon PA12. Overall envelope about 58×58×48 mm. Include shell thickness and water-tight solid. Primary axis Z. Feature count target: 4 critical dims. Sample ID cad-039.",
    "features": [
      "shell thickness",
      "water-tight solid",
      "linear pattern"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "58",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "48",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "4",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "4",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Assumption",
    "tradeLink": "quality",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 58×58×48 mm against the model or drawing.",
      "Feature present: shell thickness.",
      "Feature present: water-tight solid.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-039] Someone says “shell thickness on heat-sink is proven correct” but no measurement or QA note exists. Best claim label?",
      "choices": [
        "Evidence — on-screen shading is enough proof for production geometry",
        "Assumption (or unproven) — confidence without a recorded check is not evidence",
        "Inference — the feature looks standard for this part family, so it is fine",
        "Evidence — because the brief mentioned the feature name"
      ],
      "answerIndex": 1,
      "why": "Call it evidence only when a measurement, QA report, or primary record backs it."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 39/100: base with parallel fins. Family: Fit and tolerance. Stage focus: brief."
  },
  {
    "id": "cad-040",
    "index": 40,
    "title": "040 · clamp collar · Safety-critical",
    "family": "safety-geometry",
    "familyLabel": "Safety-critical dims",
    "partId": "clamp-collar",
    "partDesc": "split shaft collar",
    "difficulty": "intermediate",
    "pipelineStage": "brief",
    "materialIntent": "mild steel plate",
    "primaryAxis": "X",
    "prompt": "Design a split shaft collar for training. Material intent: mild steel plate. Overall envelope about 59×59×49 mm. Include draft angle and single body. Primary axis X. Feature count target: 5 critical dims. Sample ID cad-040.",
    "features": [
      "draft angle",
      "single body",
      "circular pattern"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "59",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "49",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "5",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "5",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Evidence",
    "tradeLink": "construction",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 59×59×49 mm against the model or drawing.",
      "Feature present: draft angle.",
      "Feature present: single body.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-040] Before writing build code for clamp-collar, what should the Geometric Architect produce?",
      "choices": [
        "Only a pretty render with no dimension targets",
        "A random feature list with no order or acceptance checks",
        "A step plan: sketches, feature order, critical dimensions, and checks — not finished mesh export",
        "Immediate STEP export so coding can be skipped"
      ],
      "answerIndex": 2,
      "why": "Architect plans structure and acceptance; coder implements. Skipping the plan invites untestable geometry."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 40/100: split shaft collar. Family: Safety-critical dims. Stage focus: brief."
  },
  {
    "id": "cad-041",
    "index": 41,
    "title": "041 · rail clip · Multi-Agent",
    "family": "mac-pipeline",
    "familyLabel": "Multi-Agent pipeline",
    "partId": "rail-clip",
    "partDesc": "snap clip for T-slot",
    "difficulty": "intermediate",
    "pipelineStage": "brief",
    "materialIntent": "PETG",
    "primaryAxis": "Y",
    "prompt": "Design a snap clip for T-slot for training. Material intent: PETG. Overall envelope about 60×60×10 mm. Include rib and two independent bodies. Primary axis Y. Feature count target: 6 critical dims. Sample ID cad-041.",
    "features": [
      "rib",
      "two independent bodies",
      "helical sweep"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "60",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "10",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "6",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "6",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Inference",
    "tradeLink": "automotive",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 60×60×10 mm against the model or drawing.",
      "Feature present: rib.",
      "Feature present: two independent bodies.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-041] snap clip for T-slot is planned as print-in-place with moving parts (PETG). What is a sound clearance habit?",
      "choices": [
        "Fuse all bodies into one solid so the slicer never sees seams",
        "Keep intentional gaps (about 0.4 mm class) between bodies that must move after print, and verify body count stays separate",
        "Ignore orientation because clearance only matters in CAD, not on the bed",
        "Use zero gap everywhere and sand the print until it moves"
      ],
      "answerIndex": 1,
      "why": "Print-in-place needs designed clearance and independent bodies; fusing or zero-gap usually locks the mechanism."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 41/100: snap clip for T-slot. Family: Multi-Agent pipeline. Stage focus: brief."
  },
  {
    "id": "cad-042",
    "index": 42,
    "title": "042 · ladder rung · Mechanical",
    "family": "mechanical",
    "familyLabel": "Mechanical features",
    "partId": "ladder-rung",
    "partDesc": "rung with end tenons",
    "difficulty": "intermediate",
    "pipelineStage": "qa",
    "materialIntent": "HDPE sheet",
    "primaryAxis": "Z",
    "prompt": "Design a rung with end tenons for training. Material intent: HDPE sheet. Overall envelope about 61×61×11 mm. Include slot and overall bounding box check. Primary axis Z. Feature count target: 7 critical dims. Sample ID cad-042.",
    "features": [
      "slot",
      "overall bounding box check",
      "boolean cut pocket"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "61",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "11",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "7",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "7",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Assumption",
    "tradeLink": "energy",
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 61×61×11 mm against the model or drawing.",
      "Feature present: slot.",
      "Feature present: overall bounding box check.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-042] At the qa stage for ladder-rung (61×61×11 mm, 7 critical dims along Z), what is a solid verification move?",
      "choices": [
        "Compare critical feature size (target ~7 mm) and topology/mesh reports to the brief before export",
        "Export first; only open the QA report if someone complains later",
        "Change material intent to hide a failed dimension check",
        "Only check the pretty preview camera angle"
      ],
      "answerIndex": 0,
      "why": "Each pipeline stage has a verification duty: brief completeness, planned features, measured dims, and print-aware checks."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 42/100: rung with end tenons. Family: Mechanical features. Stage focus: qa."
  },
  {
    "id": "cad-043",
    "index": 43,
    "title": "043 · conduit cover · Craft",
    "family": "trades-plan",
    "familyLabel": "Craft plan literacy",
    "partId": "conduit-cover",
    "partDesc": "threaded cover blank",
    "difficulty": "intermediate",
    "pipelineStage": "brief",
    "materialIntent": "aluminum 6061",
    "primaryAxis": "X",
    "prompt": "Design a threaded cover blank for training. Material intent: aluminum 6061. Overall envelope about 62×62×12 mm. Include keyway and minimum wall 1.2 mm. Primary axis X. Feature count target: 2 critical dims. Sample ID cad-043.",
    "features": [
      "keyway",
      "minimum wall 1.2 mm",
      "boolean union boss"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "62",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "12",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "8",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "2",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Evidence",
    "tradeLink": null,
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 62×62×12 mm against the model or drawing.",
      "Feature present: keyway.",
      "Feature present: minimum wall 1.2 mm.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-043] Dual-engine QA on conduit-cover reports DIMENSION. What is the best next step?",
      "choices": [
        "Ignore the dimension delta if the mesh still looks smooth in the viewer",
        "Mark the sample complete without recording which dimension failed",
        "Throw away the whole Architect plan and invent a new part family from scratch",
        "Send a targeted numeric repair (coder/repair) against the brief tolerances; keep the architect plan if structure is still sound"
      ],
      "answerIndex": 3,
      "why": "QA error type should drive the next step: halt on fatal, numeric repair on dimension, structural re-plan on topology, keep evidence on pass."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 43/100: threaded cover blank. Family: Craft plan literacy. Stage focus: brief."
  },
  {
    "id": "cad-044",
    "index": 44,
    "title": "044 · shower curb · Print-in-place",
    "family": "print-clearance",
    "familyLabel": "Print-in-place clearances",
    "partId": "shower-curb",
    "partDesc": "curb section profile",
    "difficulty": "intermediate",
    "pipelineStage": "qa",
    "materialIntent": "PLA",
    "primaryAxis": "Y",
    "prompt": "Design a curb section profile for training. Material intent: PLA. Overall envelope about 63×63×13 mm. Include thread relief groove and hole diameter tolerance ±0.1 mm. Primary axis Y. Feature count target: 3 critical dims. Sample ID cad-044.",
    "features": [
      "thread relief groove",
      "hole diameter tolerance ±0.1 mm",
      "shell thickness"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "63",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "13",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "9",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "3",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Inference",
    "tradeLink": null,
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 63×63×13 mm against the model or drawing.",
      "Feature present: thread relief groove.",
      "Feature present: hole diameter tolerance ±0.1 mm.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-044] Spec Planner for a curb section profile: what should the compact CAD brief emphasize?",
      "choices": [
        "Envelope size, body count, watertightness, and key features in structured fields — not a full chat replay",
        "A free-form essay of every idea discussed, including abandoned sketches",
        "A single emoji reaction instead of measurable goals",
        "Only the material brand name, with no size or body-count targets"
      ],
      "answerIndex": 0,
      "why": "Compact briefs keep multi-agent handoffs testable: sizes, bodies, seals, and named features."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 44/100: curb section profile. Family: Print-in-place clearances. Stage focus: qa."
  },
  {
    "id": "cad-045",
    "index": 45,
    "title": "045 · pallet corner · Multi-body",
    "family": "assembly",
    "familyLabel": "Multi-body assembly",
    "partId": "pallet-corner",
    "partDesc": "reinforced corner block",
    "difficulty": "intermediate",
    "pipelineStage": "qa",
    "materialIntent": "plywood panel",
    "primaryAxis": "Z",
    "prompt": "Design a reinforced corner block for training. Material intent: plywood panel. Overall envelope about 64×64×14 mm. Include pilot hole and symmetry about midplane. Primary axis Z. Feature count target: 4 critical dims. Sample ID cad-045.",
    "features": [
      "pilot hole",
      "symmetry about midplane",
      "draft angle"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "64",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "14",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "10",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "4",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Assumption",
    "tradeLink": "welding",
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 64×64×14 mm against the model or drawing.",
      "Feature present: pilot hole.",
      "Feature present: symmetry about midplane.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-045] Someone says “pilot hole on pallet-corner is proven correct” but no measurement or QA note exists. Best claim label?",
      "choices": [
        "Evidence — because the brief mentioned the feature name",
        "Evidence — on-screen shading is enough proof for production geometry",
        "Assumption (or unproven) — confidence without a recorded check is not evidence",
        "Inference — the feature looks standard for this part family, so it is fine"
      ],
      "answerIndex": 2,
      "why": "Call it evidence only when a measurement, QA report, or primary record backs it."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 45/100: reinforced corner block. Family: Multi-body assembly. Stage focus: qa."
  },
  {
    "id": "cad-046",
    "index": 46,
    "title": "046 · gripper finger · Integrity",
    "family": "integrity",
    "familyLabel": "Integrity on geometry",
    "partId": "gripper-finger",
    "partDesc": "finger pad blank",
    "difficulty": "intermediate",
    "pipelineStage": "brief",
    "materialIntent": "ABS",
    "primaryAxis": "X",
    "prompt": "Design a finger pad blank for training. Material intent: ABS. Overall envelope about 65×65×15 mm. Include mounting pad and through-hole array. Primary axis X. Feature count target: 5 critical dims. Sample ID cad-046.",
    "features": [
      "mounting pad",
      "through-hole array",
      "rib"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "65",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "15",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "11",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "5",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Evidence",
    "tradeLink": "electrical",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 65×65×15 mm against the model or drawing.",
      "Feature present: mounting pad.",
      "Feature present: through-hole array.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-046] Before writing build code for gripper-finger, what should the Geometric Architect produce?",
      "choices": [
        "Only a pretty render with no dimension targets",
        "A random feature list with no order or acceptance checks",
        "Immediate STEP export so coding can be skipped",
        "A step plan: sketches, feature order, critical dimensions, and checks — not finished mesh export"
      ],
      "answerIndex": 3,
      "why": "Architect plans structure and acceptance; coder implements. Skipping the plan invites untestable geometry."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 46/100: finger pad blank. Family: Integrity on geometry. Stage focus: brief."
  },
  {
    "id": "cad-047",
    "index": 47,
    "title": "047 · keyway shaft · Boolean",
    "family": "boolean-ops",
    "familyLabel": "Boolean and cut features",
    "partId": "keyway-shaft",
    "partDesc": "shaft with single keyway",
    "difficulty": "intermediate",
    "pipelineStage": "qa",
    "materialIntent": "nylon PA12",
    "primaryAxis": "Y",
    "prompt": "Design a shaft with single keyway for training. Material intent: nylon PA12. Overall envelope about 66×66×16 mm. Include clearance gap 0.4 mm and fillet on outer edges. Primary axis Y. Feature count target: 6 critical dims. Sample ID cad-047.",
    "features": [
      "clearance gap 0.4 mm",
      "fillet on outer edges",
      "slot"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "66",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "16",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "12",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "6",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Inference",
    "tradeLink": "plumbing",
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 66×66×16 mm against the model or drawing.",
      "Feature present: clearance gap 0.4 mm.",
      "Feature present: fillet on outer edges.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-047] shaft with single keyway is planned as print-in-place with moving parts (nylon PA12). What is a sound clearance habit?",
      "choices": [
        "Keep intentional gaps (about 0.4 mm class) between bodies that must move after print, and verify body count stays separate",
        "Ignore orientation because clearance only matters in CAD, not on the bed",
        "Fuse all bodies into one solid so the slicer never sees seams",
        "Use zero gap everywhere and sand the print until it moves"
      ],
      "answerIndex": 0,
      "why": "Print-in-place needs designed clearance and independent bodies; fusing or zero-gap usually locks the mechanism."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 47/100: shaft with single keyway. Family: Boolean and cut features. Stage focus: qa."
  },
  {
    "id": "cad-048",
    "index": 48,
    "title": "048 · linear housing · Patterns",
    "family": "patterns",
    "familyLabel": "Patterns and arrays",
    "partId": "linear-housing",
    "partDesc": "linear bearing housing blank",
    "difficulty": "intermediate",
    "pipelineStage": "qa",
    "materialIntent": "mild steel plate",
    "primaryAxis": "Z",
    "prompt": "Design a linear bearing housing blank for training. Material intent: mild steel plate. Overall envelope about 67×67×17 mm. Include clearance gap 1.0 mm and chamfer on top rim. Primary axis Z. Feature count target: 7 critical dims. Sample ID cad-048.",
    "features": [
      "clearance gap 1.0 mm",
      "chamfer on top rim",
      "keyway"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "67",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "17",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "13",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "7",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Assumption",
    "tradeLink": "hvac",
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 67×67×17 mm against the model or drawing.",
      "Feature present: clearance gap 1.0 mm.",
      "Feature present: chamfer on top rim.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-048] At the qa stage for linear-housing (67×67×17 mm, 7 critical dims along Z), what is a solid verification move?",
      "choices": [
        "Change material intent to hide a failed dimension check",
        "Export first; only open the QA report if someone complains later",
        "Compare critical feature size (target ~13 mm) and topology/mesh reports to the brief before export",
        "Only check the pretty preview camera angle"
      ],
      "answerIndex": 2,
      "why": "Each pipeline stage has a verification duty: brief completeness, planned features, measured dims, and print-aware checks."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 48/100: linear bearing housing blank. Family: Patterns and arrays. Stage focus: qa."
  },
  {
    "id": "cad-049",
    "index": 49,
    "title": "049 · l bracket · Fit",
    "family": "tolerances",
    "familyLabel": "Fit and tolerance",
    "partId": "l-bracket",
    "partDesc": "right-angle support bracket",
    "difficulty": "intermediate",
    "pipelineStage": "brief",
    "materialIntent": "PETG",
    "primaryAxis": "X",
    "prompt": "Design a right-angle support bracket for training. Material intent: PETG. Overall envelope about 68×68×18 mm. Include print orientation flat on base and counterbore. Primary axis X. Feature count target: 2 critical dims. Sample ID cad-049.",
    "features": [
      "print orientation flat on base",
      "counterbore",
      "thread relief groove"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "68",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "18",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "2",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "2",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Evidence",
    "tradeLink": "carpentry",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 68×68×18 mm against the model or drawing.",
      "Feature present: print orientation flat on base.",
      "Feature present: counterbore.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-049] Dual-engine QA on l-bracket reports FATAL. What is the best next step?",
      "choices": [
        "Keep running the same repair agent until it eventually exports something",
        "Lower mesh resolution so the topology error disappears from the report",
        "Export STL now and note the issue in a chat message later",
        "Stop auto-repair loops; treat connectivity/watertightness as blocked until a human reviews the report"
      ],
      "answerIndex": 3,
      "why": "QA error type should drive the next step: halt on fatal, numeric repair on dimension, structural re-plan on topology, keep evidence on pass."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 49/100: right-angle support bracket. Family: Fit and tolerance. Stage focus: brief."
  },
  {
    "id": "cad-050",
    "index": 50,
    "title": "050 · clevis · Safety-critical",
    "family": "safety-geometry",
    "familyLabel": "Safety-critical dims",
    "partId": "clevis",
    "partDesc": "U-shaped link with pin hole",
    "difficulty": "intermediate",
    "pipelineStage": "qa",
    "materialIntent": "HDPE sheet",
    "primaryAxis": "Y",
    "prompt": "Design a U-shaped link with pin hole for training. Material intent: HDPE sheet. Overall envelope about 69×69×19 mm. Include water-tight solid and countersink. Primary axis Y. Feature count target: 3 critical dims. Sample ID cad-050.",
    "features": [
      "water-tight solid",
      "countersink",
      "pilot hole"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "69",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "19",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "3",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "3",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Inference",
    "tradeLink": "quality",
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 69×69×19 mm against the model or drawing.",
      "Feature present: water-tight solid.",
      "Feature present: countersink.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-050] Spec Planner for a U-shaped link with pin hole: what should the compact CAD brief emphasize?",
      "choices": [
        "A free-form essay of every idea discussed, including abandoned sketches",
        "Only the material brand name, with no size or body-count targets",
        "A single emoji reaction instead of measurable goals",
        "Envelope size, body count, watertightness, and key features in structured fields — not a full chat replay"
      ],
      "answerIndex": 3,
      "why": "Compact briefs keep multi-agent handoffs testable: sizes, bodies, seals, and named features."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 50/100: U-shaped link with pin hole. Family: Safety-critical dims. Stage focus: qa."
  },
  {
    "id": "cad-051",
    "index": 51,
    "title": "051 · brake rotor · Multi-Agent",
    "family": "mac-pipeline",
    "familyLabel": "Multi-Agent pipeline",
    "partId": "brake-rotor",
    "partDesc": "vented disc blank",
    "difficulty": "intermediate",
    "pipelineStage": "brief",
    "materialIntent": "aluminum 6061",
    "primaryAxis": "Z",
    "prompt": "Design a vented disc blank for training. Material intent: aluminum 6061. Overall envelope about 70×70×20 mm. Include single body and linear pattern. Primary axis Z. Feature count target: 4 critical dims. Sample ID cad-051.",
    "features": [
      "single body",
      "linear pattern",
      "mounting pad"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "70",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "20",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "4",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "4",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Assumption",
    "tradeLink": "construction",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 70×70×20 mm against the model or drawing.",
      "Feature present: single body.",
      "Feature present: linear pattern.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-051] Someone says “single body on brake-rotor is proven correct” but no measurement or QA note exists. Best claim label?",
      "choices": [
        "Inference — the feature looks standard for this part family, so it is fine",
        "Assumption (or unproven) — confidence without a recorded check is not evidence",
        "Evidence — because the brief mentioned the feature name",
        "Evidence — on-screen shading is enough proof for production geometry"
      ],
      "answerIndex": 1,
      "why": "Call it evidence only when a measurement, QA report, or primary record backs it."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 51/100: vented disc blank. Family: Multi-Agent pipeline. Stage focus: brief."
  },
  {
    "id": "cad-052",
    "index": 52,
    "title": "052 · ball cage · Mechanical",
    "family": "mechanical",
    "familyLabel": "Mechanical features",
    "partId": "ball-cage",
    "partDesc": "cube cage trapping a ball",
    "difficulty": "intermediate",
    "pipelineStage": "architect",
    "materialIntent": "PLA",
    "primaryAxis": "X",
    "prompt": "Design a cube cage trapping a ball for training. Material intent: PLA. Overall envelope about 71×71×21 mm. Include two independent bodies and circular pattern. Primary axis X. Feature count target: 5 critical dims. Sample ID cad-052.",
    "features": [
      "two independent bodies",
      "circular pattern",
      "clearance gap 0.4 mm"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "71",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "21",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "5",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "5",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Evidence",
    "tradeLink": "automotive",
    "macLesson": "Geometric Architect plans sketches, steps, selectors, and iron rules — not freehand code yet.",
    "checkList": [
      "Confirm overall envelope ≈ 71×71×21 mm against the model or drawing.",
      "Feature present: two independent bodies.",
      "Feature present: circular pattern.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-052] Before writing build code for ball-cage, what should the Geometric Architect produce?",
      "choices": [
        "Immediate STEP export so coding can be skipped",
        "A step plan: sketches, feature order, critical dimensions, and checks — not finished mesh export",
        "A random feature list with no order or acceptance checks",
        "Only a pretty render with no dimension targets"
      ],
      "answerIndex": 1,
      "why": "Architect plans structure and acceptance; coder implements. Skipping the plan invites untestable geometry."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 52/100: cube cage trapping a ball. Family: Mechanical features. Stage focus: architect."
  },
  {
    "id": "cad-053",
    "index": 53,
    "title": "053 · junction blank · Craft",
    "family": "trades-plan",
    "familyLabel": "Craft plan literacy",
    "partId": "junction-blank",
    "partDesc": "cover plate with knockouts",
    "difficulty": "intermediate",
    "pipelineStage": "architect",
    "materialIntent": "plywood panel",
    "primaryAxis": "Y",
    "prompt": "Design a cover plate with knockouts for training. Material intent: plywood panel. Overall envelope about 72×72×22 mm. Include overall bounding box check and helical sweep. Primary axis Y. Feature count target: 6 critical dims. Sample ID cad-053.",
    "features": [
      "overall bounding box check",
      "helical sweep",
      "clearance gap 1.0 mm"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "72",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "22",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "6",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "6",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Inference",
    "tradeLink": "energy",
    "macLesson": "Geometric Architect plans sketches, steps, selectors, and iron rules — not freehand code yet.",
    "checkList": [
      "Confirm overall envelope ≈ 72×72×22 mm against the model or drawing.",
      "Feature present: overall bounding box check.",
      "Feature present: helical sweep.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-053] cover plate with knockouts is planned as print-in-place with moving parts (plywood panel). What is a sound clearance habit?",
      "choices": [
        "Ignore orientation because clearance only matters in CAD, not on the bed",
        "Fuse all bodies into one solid so the slicer never sees seams",
        "Use zero gap everywhere and sand the print until it moves",
        "Keep intentional gaps (about 0.4 mm class) between bodies that must move after print, and verify body count stays separate"
      ],
      "answerIndex": 3,
      "why": "Print-in-place needs designed clearance and independent bodies; fusing or zero-gap usually locks the mechanism."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 53/100: cover plate with knockouts. Family: Craft plan literacy. Stage focus: architect."
  },
  {
    "id": "cad-054",
    "index": 54,
    "title": "054 · vent boot · Print-in-place",
    "family": "print-clearance",
    "familyLabel": "Print-in-place clearances",
    "partId": "vent-boot",
    "partDesc": "generic roof vent base",
    "difficulty": "intermediate",
    "pipelineStage": "print",
    "materialIntent": "ABS",
    "primaryAxis": "Z",
    "prompt": "Design a generic roof vent base for training. Material intent: ABS. Overall envelope about 73×73×23 mm. Include minimum wall 1.2 mm and boolean cut pocket. Primary axis Z. Feature count target: 7 critical dims. Sample ID cad-054.",
    "features": [
      "minimum wall 1.2 mm",
      "boolean cut pocket",
      "print orientation flat on base"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "73",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "23",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "7",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "7",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Assumption",
    "tradeLink": null,
    "macLesson": "Print orientation and clearance gaps matter for articulable / print-in-place parts.",
    "checkList": [
      "Confirm overall envelope ≈ 73×73×23 mm against the model or drawing.",
      "Feature present: minimum wall 1.2 mm.",
      "Feature present: boolean cut pocket.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-054] At the print stage for vent-boot (73×73×23 mm, 7 critical dims along Z), what is a solid verification move?",
      "choices": [
        "Orient randomly each time to average out warping",
        "Disable all clearance checks if print time is short",
        "Always stand the part on its weakest wall for drama",
        "Pick orientation and support strategy that protect thin walls and clearances called out in the brief"
      ],
      "answerIndex": 3,
      "why": "Each pipeline stage has a verification duty: brief completeness, planned features, measured dims, and print-aware checks."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 54/100: generic roof vent base. Family: Print-in-place clearances. Stage focus: print."
  },
  {
    "id": "cad-055",
    "index": 55,
    "title": "055 · gear blank · Multi-body",
    "family": "assembly",
    "familyLabel": "Multi-body assembly",
    "partId": "gear-blank",
    "partDesc": "spur gear blank before teeth",
    "difficulty": "intermediate",
    "pipelineStage": "architect",
    "materialIntent": "nylon PA12",
    "primaryAxis": "X",
    "prompt": "Design a spur gear blank before teeth for training. Material intent: nylon PA12. Overall envelope about 74×74×24 mm. Include hole diameter tolerance ±0.1 mm and boolean union boss. Primary axis X. Feature count target: 2 critical dims. Sample ID cad-055.",
    "features": [
      "hole diameter tolerance ±0.1 mm",
      "boolean union boss",
      "water-tight solid"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "74",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "24",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "8",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "2",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Evidence",
    "tradeLink": null,
    "macLesson": "Geometric Architect plans sketches, steps, selectors, and iron rules — not freehand code yet.",
    "checkList": [
      "Confirm overall envelope ≈ 74×74×24 mm against the model or drawing.",
      "Feature present: hole diameter tolerance ±0.1 mm.",
      "Feature present: boolean union boss.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-055] Dual-engine QA on gear-blank reports DIMENSION. What is the best next step?",
      "choices": [
        "Ignore the dimension delta if the mesh still looks smooth in the viewer",
        "Mark the sample complete without recording which dimension failed",
        "Throw away the whole Architect plan and invent a new part family from scratch",
        "Send a targeted numeric repair (coder/repair) against the brief tolerances; keep the architect plan if structure is still sound"
      ],
      "answerIndex": 3,
      "why": "QA error type should drive the next step: halt on fatal, numeric repair on dimension, structural re-plan on topology, keep evidence on pass."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 55/100: spur gear blank before teeth. Family: Multi-body assembly. Stage focus: architect."
  },
  {
    "id": "cad-056",
    "index": 56,
    "title": "056 · manifold block · Integrity",
    "family": "integrity",
    "familyLabel": "Integrity on geometry",
    "partId": "manifold-block",
    "partDesc": "block with crossed ports",
    "difficulty": "intermediate",
    "pipelineStage": "qa",
    "materialIntent": "mild steel plate",
    "primaryAxis": "Y",
    "prompt": "Design a block with crossed ports for training. Material intent: mild steel plate. Overall envelope about 75×75×25 mm. Include symmetry about midplane and shell thickness. Primary axis Y. Feature count target: 3 critical dims. Sample ID cad-056.",
    "features": [
      "symmetry about midplane",
      "shell thickness",
      "single body"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "75",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "25",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "9",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "3",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Inference",
    "tradeLink": "welding",
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 75×75×25 mm against the model or drawing.",
      "Feature present: symmetry about midplane.",
      "Feature present: shell thickness.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-056] Spec Planner for a block with crossed ports: what should the compact CAD brief emphasize?",
      "choices": [
        "Only the material brand name, with no size or body-count targets",
        "A single emoji reaction instead of measurable goals",
        "Envelope size, body count, watertightness, and key features in structured fields — not a full chat replay",
        "A free-form essay of every idea discussed, including abandoned sketches"
      ],
      "answerIndex": 2,
      "why": "Compact briefs keep multi-agent handoffs testable: sizes, bodies, seals, and named features."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 56/100: block with crossed ports. Family: Integrity on geometry. Stage focus: qa."
  },
  {
    "id": "cad-057",
    "index": 57,
    "title": "057 · spacer stack · Boolean",
    "family": "boolean-ops",
    "familyLabel": "Boolean and cut features",
    "partId": "spacer-stack",
    "partDesc": "stepped spacer",
    "difficulty": "intermediate",
    "pipelineStage": "repair",
    "materialIntent": "PETG",
    "primaryAxis": "Z",
    "prompt": "Design a stepped spacer for training. Material intent: PETG. Overall envelope about 76×76×26 mm. Include through-hole array and draft angle. Primary axis Z. Feature count target: 4 critical dims. Sample ID cad-057.",
    "features": [
      "through-hole array",
      "draft angle",
      "two independent bodies"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "76",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "26",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "10",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "4",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Assumption",
    "tradeLink": "electrical",
    "macLesson": "Repair agents edit code from QA evidence; max iterations; fatal errors halt.",
    "checkList": [
      "Confirm overall envelope ≈ 76×76×26 mm against the model or drawing.",
      "Feature present: through-hole array.",
      "Feature present: draft angle.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-057] Someone says “through-hole array on spacer-stack is proven correct” but no measurement or QA note exists. Best claim label?",
      "choices": [
        "Inference — the feature looks standard for this part family, so it is fine",
        "Assumption (or unproven) — confidence without a recorded check is not evidence",
        "Evidence — because the brief mentioned the feature name",
        "Evidence — on-screen shading is enough proof for production geometry"
      ],
      "answerIndex": 1,
      "why": "Call it evidence only when a measurement, QA report, or primary record backs it."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 57/100: stepped spacer. Family: Boolean and cut features. Stage focus: repair."
  },
  {
    "id": "cad-058",
    "index": 58,
    "title": "058 · nozzle tip · Patterns",
    "family": "patterns",
    "familyLabel": "Patterns and arrays",
    "partId": "nozzle-tip",
    "partDesc": "conical orifice",
    "difficulty": "intermediate",
    "pipelineStage": "architect",
    "materialIntent": "HDPE sheet",
    "primaryAxis": "X",
    "prompt": "Design a conical orifice for training. Material intent: HDPE sheet. Overall envelope about 77×77×27 mm. Include fillet on outer edges and rib. Primary axis X. Feature count target: 5 critical dims. Sample ID cad-058.",
    "features": [
      "fillet on outer edges",
      "rib",
      "overall bounding box check"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "77",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "27",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "11",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "5",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Evidence",
    "tradeLink": "plumbing",
    "macLesson": "Geometric Architect plans sketches, steps, selectors, and iron rules — not freehand code yet.",
    "checkList": [
      "Confirm overall envelope ≈ 77×77×27 mm against the model or drawing.",
      "Feature present: fillet on outer edges.",
      "Feature present: rib.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-058] Before writing build code for nozzle-tip, what should the Geometric Architect produce?",
      "choices": [
        "Immediate STEP export so coding can be skipped",
        "A random feature list with no order or acceptance checks",
        "Only a pretty render with no dimension targets",
        "A step plan: sketches, feature order, critical dimensions, and checks — not finished mesh export"
      ],
      "answerIndex": 3,
      "why": "Architect plans structure and acceptance; coder implements. Skipping the plan invites untestable geometry."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 58/100: conical orifice. Family: Patterns and arrays. Stage focus: architect."
  },
  {
    "id": "cad-059",
    "index": 59,
    "title": "059 · scaffold coupler · Fit",
    "family": "tolerances",
    "familyLabel": "Fit and tolerance",
    "partId": "scaffold-coupler",
    "partDesc": "pipe coupler training part",
    "difficulty": "intermediate",
    "pipelineStage": "brief",
    "materialIntent": "aluminum 6061",
    "primaryAxis": "Y",
    "prompt": "Design a pipe coupler training part for training. Material intent: aluminum 6061. Overall envelope about 78×78×28 mm. Include chamfer on top rim and slot. Primary axis Y. Feature count target: 6 critical dims. Sample ID cad-059.",
    "features": [
      "chamfer on top rim",
      "slot",
      "minimum wall 1.2 mm"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "78",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "28",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "12",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "6",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Inference",
    "tradeLink": "hvac",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 78×78×28 mm against the model or drawing.",
      "Feature present: chamfer on top rim.",
      "Feature present: slot.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-059] pipe coupler training part is planned as print-in-place with moving parts (aluminum 6061). What is a sound clearance habit?",
      "choices": [
        "Use zero gap everywhere and sand the print until it moves",
        "Keep intentional gaps (about 0.4 mm class) between bodies that must move after print, and verify body count stays separate",
        "Ignore orientation because clearance only matters in CAD, not on the bed",
        "Fuse all bodies into one solid so the slicer never sees seams"
      ],
      "answerIndex": 1,
      "why": "Print-in-place needs designed clearance and independent bodies; fusing or zero-gap usually locks the mechanism."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 59/100: pipe coupler training part. Family: Fit and tolerance. Stage focus: brief."
  },
  {
    "id": "cad-060",
    "index": 60,
    "title": "060 · mud ring · Safety-critical",
    "family": "safety-geometry",
    "familyLabel": "Safety-critical dims",
    "partId": "mud-ring",
    "partDesc": "device ring training geometry",
    "difficulty": "intermediate",
    "pipelineStage": "repair",
    "materialIntent": "PLA",
    "primaryAxis": "Z",
    "prompt": "Design a device ring training geometry for training. Material intent: PLA. Overall envelope about 79×79×29 mm. Include counterbore and keyway. Primary axis Z. Feature count target: 7 critical dims. Sample ID cad-060.",
    "features": [
      "counterbore",
      "keyway",
      "hole diameter tolerance ±0.1 mm"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "79",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "29",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "13",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "7",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Assumption",
    "tradeLink": "carpentry",
    "macLesson": "Repair agents edit code from QA evidence; max iterations; fatal errors halt.",
    "checkList": [
      "Confirm overall envelope ≈ 79×79×29 mm against the model or drawing.",
      "Feature present: counterbore.",
      "Feature present: keyway.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-060] At the repair stage for mud-ring (79×79×29 mm, 7 critical dims along Z), what is a solid verification move?",
      "choices": [
        "Change material intent to hide a failed dimension check",
        "Only check the pretty preview camera angle",
        "Compare critical feature size (target ~13 mm) and topology/mesh reports to the brief before export",
        "Export first; only open the QA report if someone complains later"
      ],
      "answerIndex": 2,
      "why": "Each pipeline stage has a verification duty: brief completeness, planned features, measured dims, and print-aware checks."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 60/100: device ring training geometry. Family: Safety-critical dims. Stage focus: repair."
  },
  {
    "id": "cad-061",
    "index": 61,
    "title": "061 · register boot · Multi-Agent",
    "family": "mac-pipeline",
    "familyLabel": "Multi-Agent pipeline",
    "partId": "register-boot",
    "partDesc": "HVAC boot transition",
    "difficulty": "intermediate",
    "pipelineStage": "brief",
    "materialIntent": "plywood panel",
    "primaryAxis": "X",
    "prompt": "Design a HVAC boot transition for training. Material intent: plywood panel. Overall envelope about 20×20×30 mm. Include countersink and thread relief groove. Primary axis X. Feature count target: 2 critical dims. Sample ID cad-061.",
    "features": [
      "countersink",
      "thread relief groove",
      "symmetry about midplane"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "20",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "30",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "2",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "2",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Evidence",
    "tradeLink": "quality",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 20×20×30 mm against the model or drawing.",
      "Feature present: countersink.",
      "Feature present: thread relief groove.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-061] Dual-engine QA on register-boot reports FATAL. What is the best next step?",
      "choices": [
        "Stop auto-repair loops; treat connectivity/watertightness as blocked until a human reviews the report",
        "Lower mesh resolution so the topology error disappears from the report",
        "Keep running the same repair agent until it eventually exports something",
        "Export STL now and note the issue in a chat message later"
      ],
      "answerIndex": 0,
      "why": "QA error type should drive the next step: halt on fatal, numeric repair on dimension, structural re-plan on topology, keep evidence on pass."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 61/100: HVAC boot transition. Family: Multi-Agent pipeline. Stage focus: brief."
  },
  {
    "id": "cad-062",
    "index": 62,
    "title": "062 · drone arm mount · Mechanical",
    "family": "mechanical",
    "familyLabel": "Mechanical features",
    "partId": "drone-arm-mount",
    "partDesc": "arm root plate",
    "difficulty": "intermediate",
    "pipelineStage": "coder",
    "materialIntent": "ABS",
    "primaryAxis": "Y",
    "prompt": "Design a arm root plate for training. Material intent: ABS. Overall envelope about 21×21×31 mm. Include linear pattern and pilot hole. Primary axis Y. Feature count target: 3 critical dims. Sample ID cad-062.",
    "features": [
      "linear pattern",
      "pilot hole",
      "through-hole array"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "21",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "31",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "3",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "3",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Inference",
    "tradeLink": "construction",
    "macLesson": "Python Coder / build123d path turns plan into executable geometry code; deterministic first, LLM repair second.",
    "checkList": [
      "Confirm overall envelope ≈ 21×21×31 mm against the model or drawing.",
      "Feature present: linear pattern.",
      "Feature present: pilot hole.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-062] Spec Planner for a arm root plate: what should the compact CAD brief emphasize?",
      "choices": [
        "A single emoji reaction instead of measurable goals",
        "A free-form essay of every idea discussed, including abandoned sketches",
        "Envelope size, body count, watertightness, and key features in structured fields — not a full chat replay",
        "Only the material brand name, with no size or body-count targets"
      ],
      "answerIndex": 2,
      "why": "Compact briefs keep multi-agent handoffs testable: sizes, bodies, seals, and named features."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 62/100: arm root plate. Family: Mechanical features. Stage focus: coder."
  },
  {
    "id": "cad-063",
    "index": 63,
    "title": "063 · test cube · Craft",
    "family": "trades-plan",
    "familyLabel": "Craft plan literacy",
    "partId": "test-cube",
    "partDesc": "calibration cube",
    "difficulty": "intermediate",
    "pipelineStage": "qa",
    "materialIntent": "nylon PA12",
    "primaryAxis": "Z",
    "prompt": "Design a calibration cube for training. Material intent: nylon PA12. Overall envelope about 22×22×32 mm. Include circular pattern and mounting pad. Primary axis Z. Feature count target: 4 critical dims. Sample ID cad-063.",
    "features": [
      "circular pattern",
      "mounting pad",
      "fillet on outer edges"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "22",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "32",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "4",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "4",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Assumption",
    "tradeLink": "automotive",
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 22×22×32 mm against the model or drawing.",
      "Feature present: circular pattern.",
      "Feature present: mounting pad.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-063] Someone says “circular pattern on test-cube is proven correct” but no measurement or QA note exists. Best claim label?",
      "choices": [
        "Evidence — on-screen shading is enough proof for production geometry",
        "Evidence — because the brief mentioned the feature name",
        "Assumption (or unproven) — confidence without a recorded check is not evidence",
        "Inference — the feature looks standard for this part family, so it is fine"
      ],
      "answerIndex": 2,
      "why": "Call it evidence only when a measurement, QA report, or primary record backs it."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 63/100: calibration cube. Family: Craft plan literacy. Stage focus: qa."
  },
  {
    "id": "cad-064",
    "index": 64,
    "title": "064 · dovetail slide · Print-in-place",
    "family": "print-clearance",
    "familyLabel": "Print-in-place clearances",
    "partId": "dovetail-slide",
    "partDesc": "male dovetail",
    "difficulty": "intermediate",
    "pipelineStage": "architect",
    "materialIntent": "mild steel plate",
    "primaryAxis": "X",
    "prompt": "Design a male dovetail for training. Material intent: mild steel plate. Overall envelope about 23×23×33 mm. Include helical sweep and clearance gap 0.4 mm. Primary axis X. Feature count target: 5 critical dims. Sample ID cad-064.",
    "features": [
      "helical sweep",
      "clearance gap 0.4 mm",
      "chamfer on top rim"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "23",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "33",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "5",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "5",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Evidence",
    "tradeLink": "energy",
    "macLesson": "Geometric Architect plans sketches, steps, selectors, and iron rules — not freehand code yet.",
    "checkList": [
      "Confirm overall envelope ≈ 23×23×33 mm against the model or drawing.",
      "Feature present: helical sweep.",
      "Feature present: clearance gap 0.4 mm.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-064] Before writing build code for dovetail-slide, what should the Geometric Architect produce?",
      "choices": [
        "Immediate STEP export so coding can be skipped",
        "A random feature list with no order or acceptance checks",
        "A step plan: sketches, feature order, critical dimensions, and checks — not finished mesh export",
        "Only a pretty render with no dimension targets"
      ],
      "answerIndex": 2,
      "why": "Architect plans structure and acceptance; coder implements. Skipping the plan invites untestable geometry."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 64/100: male dovetail. Family: Print-in-place clearances. Stage focus: architect."
  },
  {
    "id": "cad-065",
    "index": 65,
    "title": "065 · timing pulley · Multi-body",
    "family": "assembly",
    "familyLabel": "Multi-body assembly",
    "partId": "timing-pulley",
    "partDesc": "pulley blank without teeth",
    "difficulty": "intermediate",
    "pipelineStage": "coder",
    "materialIntent": "PETG",
    "primaryAxis": "Y",
    "prompt": "Design a pulley blank without teeth for training. Material intent: PETG. Overall envelope about 24×24×34 mm. Include boolean cut pocket and clearance gap 1.0 mm. Primary axis Y. Feature count target: 6 critical dims. Sample ID cad-065.",
    "features": [
      "boolean cut pocket",
      "clearance gap 1.0 mm",
      "counterbore"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "24",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "34",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "6",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "6",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Inference",
    "tradeLink": null,
    "macLesson": "Python Coder / build123d path turns plan into executable geometry code; deterministic first, LLM repair second.",
    "checkList": [
      "Confirm overall envelope ≈ 24×24×34 mm against the model or drawing.",
      "Feature present: boolean cut pocket.",
      "Feature present: clearance gap 1.0 mm.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-065] pulley blank without teeth is planned as print-in-place with moving parts (PETG). What is a sound clearance habit?",
      "choices": [
        "Keep intentional gaps (about 0.4 mm class) between bodies that must move after print, and verify body count stays separate",
        "Ignore orientation because clearance only matters in CAD, not on the bed",
        "Use zero gap everywhere and sand the print until it moves",
        "Fuse all bodies into one solid so the slicer never sees seams"
      ],
      "answerIndex": 0,
      "why": "Print-in-place needs designed clearance and independent bodies; fusing or zero-gap usually locks the mechanism."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 65/100: pulley blank without teeth. Family: Multi-body assembly. Stage focus: coder."
  },
  {
    "id": "cad-066",
    "index": 66,
    "title": "066 · stepped shaft · Integrity",
    "family": "integrity",
    "familyLabel": "Integrity on geometry",
    "partId": "stepped-shaft",
    "partDesc": "multi-diameter shaft",
    "difficulty": "intermediate",
    "pipelineStage": "repair",
    "materialIntent": "HDPE sheet",
    "primaryAxis": "Z",
    "prompt": "Design a multi-diameter shaft for training. Material intent: HDPE sheet. Overall envelope about 25×25×35 mm. Include boolean union boss and print orientation flat on base. Primary axis Z. Feature count target: 7 critical dims. Sample ID cad-066.",
    "features": [
      "boolean union boss",
      "print orientation flat on base",
      "countersink"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "25",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "35",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "7",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "7",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Assumption",
    "tradeLink": null,
    "macLesson": "Repair agents edit code from QA evidence; max iterations; fatal errors halt.",
    "checkList": [
      "Confirm overall envelope ≈ 25×25×35 mm against the model or drawing.",
      "Feature present: boolean union boss.",
      "Feature present: print orientation flat on base.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-066] At the repair stage for stepped-shaft (25×25×35 mm, 7 critical dims along Z), what is a solid verification move?",
      "choices": [
        "Compare critical feature size (target ~7 mm) and topology/mesh reports to the brief before export",
        "Change material intent to hide a failed dimension check",
        "Only check the pretty preview camera angle",
        "Export first; only open the QA report if someone complains later"
      ],
      "answerIndex": 0,
      "why": "Each pipeline stage has a verification duty: brief completeness, planned features, measured dims, and print-aware checks."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 66/100: multi-diameter shaft. Family: Integrity on geometry. Stage focus: repair."
  },
  {
    "id": "cad-067",
    "index": 67,
    "title": "067 · impeller · Boolean",
    "family": "boolean-ops",
    "familyLabel": "Boolean and cut features",
    "partId": "impeller",
    "partDesc": "radial blade hub",
    "difficulty": "intermediate",
    "pipelineStage": "coder",
    "materialIntent": "aluminum 6061",
    "primaryAxis": "X",
    "prompt": "Design a radial blade hub for training. Material intent: aluminum 6061. Overall envelope about 26×26×36 mm. Include shell thickness and water-tight solid. Primary axis X. Feature count target: 2 critical dims. Sample ID cad-067.",
    "features": [
      "shell thickness",
      "water-tight solid",
      "linear pattern"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "26",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "36",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "8",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "2",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Evidence",
    "tradeLink": "welding",
    "macLesson": "Python Coder / build123d path turns plan into executable geometry code; deterministic first, LLM repair second.",
    "checkList": [
      "Confirm overall envelope ≈ 26×26×36 mm against the model or drawing.",
      "Feature present: shell thickness.",
      "Feature present: water-tight solid.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-067] Dual-engine QA on impeller reports DIMENSION. What is the best next step?",
      "choices": [
        "Mark the sample complete without recording which dimension failed",
        "Send a targeted numeric repair (coder/repair) against the brief tolerances; keep the architect plan if structure is still sound",
        "Ignore the dimension delta if the mesh still looks smooth in the viewer",
        "Throw away the whole Architect plan and invent a new part family from scratch"
      ],
      "answerIndex": 1,
      "why": "QA error type should drive the next step: halt on fatal, numeric repair on dimension, structural re-plan on topology, keep evidence on pass."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 67/100: radial blade hub. Family: Boolean and cut features. Stage focus: coder."
  },
  {
    "id": "cad-068",
    "index": 68,
    "title": "068 · honeycomb tray · Patterns",
    "family": "patterns",
    "familyLabel": "Patterns and arrays",
    "partId": "honeycomb-tray",
    "partDesc": "hex cell organizer",
    "difficulty": "intermediate",
    "pipelineStage": "coder",
    "materialIntent": "PLA",
    "primaryAxis": "Y",
    "prompt": "Design a hex cell organizer for training. Material intent: PLA. Overall envelope about 27×27×37 mm. Include draft angle and single body. Primary axis Y. Feature count target: 3 critical dims. Sample ID cad-068.",
    "features": [
      "draft angle",
      "single body",
      "circular pattern"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "27",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "37",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "9",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "3",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Inference",
    "tradeLink": "electrical",
    "macLesson": "Python Coder / build123d path turns plan into executable geometry code; deterministic first, LLM repair second.",
    "checkList": [
      "Confirm overall envelope ≈ 27×27×37 mm against the model or drawing.",
      "Feature present: draft angle.",
      "Feature present: single body.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-068] Spec Planner for a hex cell organizer: what should the compact CAD brief emphasize?",
      "choices": [
        "Envelope size, body count, watertightness, and key features in structured fields — not a full chat replay",
        "A single emoji reaction instead of measurable goals",
        "A free-form essay of every idea discussed, including abandoned sketches",
        "Only the material brand name, with no size or body-count targets"
      ],
      "answerIndex": 0,
      "why": "Compact briefs keep multi-agent handoffs testable: sizes, bodies, seals, and named features."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 68/100: hex cell organizer. Family: Patterns and arrays. Stage focus: coder."
  },
  {
    "id": "cad-069",
    "index": 69,
    "title": "069 · gyro ring · Fit",
    "family": "tolerances",
    "familyLabel": "Fit and tolerance",
    "partId": "gyro-ring",
    "partDesc": "outer ring with pivots",
    "difficulty": "intermediate",
    "pipelineStage": "brief",
    "materialIntent": "plywood panel",
    "primaryAxis": "Z",
    "prompt": "Design a outer ring with pivots for training. Material intent: plywood panel. Overall envelope about 28×28×38 mm. Include rib and two independent bodies. Primary axis Z. Feature count target: 4 critical dims. Sample ID cad-069.",
    "features": [
      "rib",
      "two independent bodies",
      "helical sweep"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "28",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "38",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "10",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "4",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Assumption",
    "tradeLink": "plumbing",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 28×28×38 mm against the model or drawing.",
      "Feature present: rib.",
      "Feature present: two independent bodies.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-069] Someone says “rib on gyro-ring is proven correct” but no measurement or QA note exists. Best claim label?",
      "choices": [
        "Evidence — because the brief mentioned the feature name",
        "Inference — the feature looks standard for this part family, so it is fine",
        "Assumption (or unproven) — confidence without a recorded check is not evidence",
        "Evidence — on-screen shading is enough proof for production geometry"
      ],
      "answerIndex": 2,
      "why": "Call it evidence only when a measurement, QA report, or primary record backs it."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 69/100: outer ring with pivots. Family: Fit and tolerance. Stage focus: brief."
  },
  {
    "id": "cad-070",
    "index": 70,
    "title": "070 · duct collar · Safety-critical",
    "family": "safety-geometry",
    "familyLabel": "Safety-critical dims",
    "partId": "duct-collar",
    "partDesc": "round-to-rect transition stub",
    "difficulty": "intermediate",
    "pipelineStage": "brief",
    "materialIntent": "ABS",
    "primaryAxis": "X",
    "prompt": "Design a round-to-rect transition stub for training. Material intent: ABS. Overall envelope about 29×29×39 mm. Include slot and overall bounding box check. Primary axis X. Feature count target: 5 critical dims. Sample ID cad-070.",
    "features": [
      "slot",
      "overall bounding box check",
      "boolean cut pocket"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "29",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "39",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "11",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "5",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Evidence",
    "tradeLink": "hvac",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 29×29×39 mm against the model or drawing.",
      "Feature present: slot.",
      "Feature present: overall bounding box check.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-070] Before writing build code for duct-collar, what should the Geometric Architect produce?",
      "choices": [
        "A step plan: sketches, feature order, critical dimensions, and checks — not finished mesh export",
        "Only a pretty render with no dimension targets",
        "A random feature list with no order or acceptance checks",
        "Immediate STEP export so coding can be skipped"
      ],
      "answerIndex": 0,
      "why": "Architect plans structure and acceptance; coder implements. Skipping the plan invites untestable geometry."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 70/100: round-to-rect transition stub. Family: Safety-critical dims. Stage focus: brief."
  },
  {
    "id": "cad-071",
    "index": 71,
    "title": "071 · cable tray · Multi-Agent",
    "family": "mac-pipeline",
    "familyLabel": "Multi-Agent pipeline",
    "partId": "cable-tray",
    "partDesc": "ladder tray segment",
    "difficulty": "advanced",
    "pipelineStage": "brief",
    "materialIntent": "nylon PA12",
    "primaryAxis": "Y",
    "prompt": "Design a ladder tray segment for training. Material intent: nylon PA12. Overall envelope about 30×30×40 mm. Include keyway and minimum wall 1.2 mm. Primary axis Y. Feature count target: 6 critical dims. Sample ID cad-071.",
    "features": [
      "keyway",
      "minimum wall 1.2 mm",
      "boolean union boss"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "30",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "40",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "12",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "6",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Inference",
    "tradeLink": "carpentry",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 30×30×40 mm against the model or drawing.",
      "Feature present: keyway.",
      "Feature present: minimum wall 1.2 mm.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-071] ladder tray segment is planned as print-in-place with moving parts (nylon PA12). What is a sound clearance habit?",
      "choices": [
        "Keep intentional gaps (about 0.4 mm class) between bodies that must move after print, and verify body count stays separate",
        "Ignore orientation because clearance only matters in CAD, not on the bed",
        "Fuse all bodies into one solid so the slicer never sees seams",
        "Use zero gap everywhere and sand the print until it moves"
      ],
      "answerIndex": 0,
      "why": "Print-in-place needs designed clearance and independent bodies; fusing or zero-gap usually locks the mechanism."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 71/100: ladder tray segment. Family: Multi-Agent pipeline. Stage focus: brief."
  },
  {
    "id": "cad-072",
    "index": 72,
    "title": "072 · counterbore boss · Mechanical",
    "family": "mechanical",
    "familyLabel": "Mechanical features",
    "partId": "counterbore-boss",
    "partDesc": "raised boss with counterbore",
    "difficulty": "advanced",
    "pipelineStage": "qa",
    "materialIntent": "mild steel plate",
    "primaryAxis": "Z",
    "prompt": "Design a raised boss with counterbore for training. Material intent: mild steel plate. Overall envelope about 31×31×41 mm. Include thread relief groove and hole diameter tolerance ±0.1 mm. Primary axis Z. Feature count target: 7 critical dims. Sample ID cad-072.",
    "features": [
      "thread relief groove",
      "hole diameter tolerance ±0.1 mm",
      "shell thickness"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "31",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "41",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "13",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "7",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Assumption",
    "tradeLink": "quality",
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 31×31×41 mm against the model or drawing.",
      "Feature present: thread relief groove.",
      "Feature present: hole diameter tolerance ±0.1 mm.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-072] At the qa stage for counterbore-boss (31×31×41 mm, 7 critical dims along Z), what is a solid verification move?",
      "choices": [
        "Only check the pretty preview camera angle",
        "Compare critical feature size (target ~13 mm) and topology/mesh reports to the brief before export",
        "Export first; only open the QA report if someone complains later",
        "Change material intent to hide a failed dimension check"
      ],
      "answerIndex": 1,
      "why": "Each pipeline stage has a verification duty: brief completeness, planned features, measured dims, and print-aware checks."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 72/100: raised boss with counterbore. Family: Mechanical features. Stage focus: qa."
  },
  {
    "id": "cad-073",
    "index": 73,
    "title": "073 · hinge leaf · Craft",
    "family": "trades-plan",
    "familyLabel": "Craft plan literacy",
    "partId": "hinge-leaf",
    "partDesc": "leaf with knuckle half",
    "difficulty": "advanced",
    "pipelineStage": "brief",
    "materialIntent": "PETG",
    "primaryAxis": "X",
    "prompt": "Design a leaf with knuckle half for training. Material intent: PETG. Overall envelope about 32×32×42 mm. Include pilot hole and symmetry about midplane. Primary axis X. Feature count target: 2 critical dims. Sample ID cad-073.",
    "features": [
      "pilot hole",
      "symmetry about midplane",
      "draft angle"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "32",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "42",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "2",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "2",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Evidence",
    "tradeLink": "construction",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 32×32×42 mm against the model or drawing.",
      "Feature present: pilot hole.",
      "Feature present: symmetry about midplane.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-073] Dual-engine QA on hinge-leaf reports FATAL. What is the best next step?",
      "choices": [
        "Export STL now and note the issue in a chat message later",
        "Keep running the same repair agent until it eventually exports something",
        "Stop auto-repair loops; treat connectivity/watertightness as blocked until a human reviews the report",
        "Lower mesh resolution so the topology error disappears from the report"
      ],
      "answerIndex": 2,
      "why": "QA error type should drive the next step: halt on fatal, numeric repair on dimension, structural re-plan on topology, keep evidence on pass."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 73/100: leaf with knuckle half. Family: Craft plan literacy. Stage focus: brief."
  },
  {
    "id": "cad-074",
    "index": 74,
    "title": "074 · cam lobe · Print-in-place",
    "family": "print-clearance",
    "familyLabel": "Print-in-place clearances",
    "partId": "cam-lobe",
    "partDesc": "simple plate cam",
    "difficulty": "advanced",
    "pipelineStage": "qa",
    "materialIntent": "HDPE sheet",
    "primaryAxis": "Y",
    "prompt": "Design a simple plate cam for training. Material intent: HDPE sheet. Overall envelope about 33×33×43 mm. Include mounting pad and through-hole array. Primary axis Y. Feature count target: 3 critical dims. Sample ID cad-074.",
    "features": [
      "mounting pad",
      "through-hole array",
      "rib"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "33",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "43",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "3",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "3",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Inference",
    "tradeLink": "automotive",
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 33×33×43 mm against the model or drawing.",
      "Feature present: mounting pad.",
      "Feature present: through-hole array.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-074] Spec Planner for a simple plate cam: what should the compact CAD brief emphasize?",
      "choices": [
        "A free-form essay of every idea discussed, including abandoned sketches",
        "A single emoji reaction instead of measurable goals",
        "Only the material brand name, with no size or body-count targets",
        "Envelope size, body count, watertightness, and key features in structured fields — not a full chat replay"
      ],
      "answerIndex": 3,
      "why": "Compact briefs keep multi-agent handoffs testable: sizes, bodies, seals, and named features."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 74/100: simple plate cam. Family: Print-in-place clearances. Stage focus: qa."
  },
  {
    "id": "cad-075",
    "index": 75,
    "title": "075 · filter frame · Multi-body",
    "family": "assembly",
    "familyLabel": "Multi-body assembly",
    "partId": "filter-frame",
    "partDesc": "square frame with mesh seat",
    "difficulty": "advanced",
    "pipelineStage": "qa",
    "materialIntent": "aluminum 6061",
    "primaryAxis": "Z",
    "prompt": "Design a square frame with mesh seat for training. Material intent: aluminum 6061. Overall envelope about 34×34×44 mm. Include clearance gap 0.4 mm and fillet on outer edges. Primary axis Z. Feature count target: 4 critical dims. Sample ID cad-075.",
    "features": [
      "clearance gap 0.4 mm",
      "fillet on outer edges",
      "slot"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "34",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "44",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "4",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "4",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Assumption",
    "tradeLink": "energy",
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 34×34×44 mm against the model or drawing.",
      "Feature present: clearance gap 0.4 mm.",
      "Feature present: fillet on outer edges.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-075] Someone says “clearance gap 0.4 mm on filter-frame is proven correct” but no measurement or QA note exists. Best claim label?",
      "choices": [
        "Evidence — because the brief mentioned the feature name",
        "Inference — the feature looks standard for this part family, so it is fine",
        "Assumption (or unproven) — confidence without a recorded check is not evidence",
        "Evidence — on-screen shading is enough proof for production geometry"
      ],
      "answerIndex": 2,
      "why": "Call it evidence only when a measurement, QA report, or primary record backs it."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 75/100: square frame with mesh seat. Family: Multi-body assembly. Stage focus: qa."
  },
  {
    "id": "cad-076",
    "index": 76,
    "title": "076 · weld coupon · Integrity",
    "family": "integrity",
    "familyLabel": "Integrity on geometry",
    "partId": "weld-coupon",
    "partDesc": "test plate with bevel prep",
    "difficulty": "advanced",
    "pipelineStage": "brief",
    "materialIntent": "PLA",
    "primaryAxis": "X",
    "prompt": "Design a test plate with bevel prep for training. Material intent: PLA. Overall envelope about 35×35×45 mm. Include clearance gap 1.0 mm and chamfer on top rim. Primary axis X. Feature count target: 5 critical dims. Sample ID cad-076.",
    "features": [
      "clearance gap 1.0 mm",
      "chamfer on top rim",
      "keyway"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "35",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "45",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "5",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "5",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Evidence",
    "tradeLink": null,
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 35×35×45 mm against the model or drawing.",
      "Feature present: clearance gap 1.0 mm.",
      "Feature present: chamfer on top rim.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-076] Before writing build code for weld-coupon, what should the Geometric Architect produce?",
      "choices": [
        "A step plan: sketches, feature order, critical dimensions, and checks — not finished mesh export",
        "Immediate STEP export so coding can be skipped",
        "A random feature list with no order or acceptance checks",
        "Only a pretty render with no dimension targets"
      ],
      "answerIndex": 0,
      "why": "Architect plans structure and acceptance; coder implements. Skipping the plan invites untestable geometry."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 76/100: test plate with bevel prep. Family: Integrity on geometry. Stage focus: brief."
  },
  {
    "id": "cad-077",
    "index": 77,
    "title": "077 · flange spacer · Boolean",
    "family": "boolean-ops",
    "familyLabel": "Boolean and cut features",
    "partId": "flange-spacer",
    "partDesc": "generic spacer ring",
    "difficulty": "advanced",
    "pipelineStage": "qa",
    "materialIntent": "plywood panel",
    "primaryAxis": "Y",
    "prompt": "Design a generic spacer ring for training. Material intent: plywood panel. Overall envelope about 36×36×46 mm. Include print orientation flat on base and counterbore. Primary axis Y. Feature count target: 6 critical dims. Sample ID cad-077.",
    "features": [
      "print orientation flat on base",
      "counterbore",
      "thread relief groove"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "36",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "46",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "6",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "6",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Inference",
    "tradeLink": null,
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 36×36×46 mm against the model or drawing.",
      "Feature present: print orientation flat on base.",
      "Feature present: counterbore.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-077] generic spacer ring is planned as print-in-place with moving parts (plywood panel). What is a sound clearance habit?",
      "choices": [
        "Fuse all bodies into one solid so the slicer never sees seams",
        "Use zero gap everywhere and sand the print until it moves",
        "Ignore orientation because clearance only matters in CAD, not on the bed",
        "Keep intentional gaps (about 0.4 mm class) between bodies that must move after print, and verify body count stays separate"
      ],
      "answerIndex": 3,
      "why": "Print-in-place needs designed clearance and independent bodies; fusing or zero-gap usually locks the mechanism."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 77/100: generic spacer ring. Family: Boolean and cut features. Stage focus: qa."
  },
  {
    "id": "cad-078",
    "index": 78,
    "title": "078 · solar rail end · Patterns",
    "family": "patterns",
    "familyLabel": "Patterns and arrays",
    "partId": "solar-rail-end",
    "partDesc": "rail end cap",
    "difficulty": "advanced",
    "pipelineStage": "qa",
    "materialIntent": "ABS",
    "primaryAxis": "Z",
    "prompt": "Design a rail end cap for training. Material intent: ABS. Overall envelope about 37×37×47 mm. Include water-tight solid and countersink. Primary axis Z. Feature count target: 7 critical dims. Sample ID cad-078.",
    "features": [
      "water-tight solid",
      "countersink",
      "pilot hole"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "37",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "47",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "7",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "7",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Assumption",
    "tradeLink": "welding",
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 37×37×47 mm against the model or drawing.",
      "Feature present: water-tight solid.",
      "Feature present: countersink.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-078] At the qa stage for solar-rail-end (37×37×47 mm, 7 critical dims along Z), what is a solid verification move?",
      "choices": [
        "Only check the pretty preview camera angle",
        "Compare critical feature size (target ~7 mm) and topology/mesh reports to the brief before export",
        "Export first; only open the QA report if someone complains later",
        "Change material intent to hide a failed dimension check"
      ],
      "answerIndex": 1,
      "why": "Each pipeline stage has a verification duty: brief completeness, planned features, measured dims, and print-aware checks."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 78/100: rail end cap. Family: Patterns and arrays. Stage focus: qa."
  },
  {
    "id": "cad-079",
    "index": 79,
    "title": "079 · gimbal yoke · Fit",
    "family": "tolerances",
    "familyLabel": "Fit and tolerance",
    "partId": "gimbal-yoke",
    "partDesc": "yoke with through-bore",
    "difficulty": "advanced",
    "pipelineStage": "brief",
    "materialIntent": "nylon PA12",
    "primaryAxis": "X",
    "prompt": "Design a yoke with through-bore for training. Material intent: nylon PA12. Overall envelope about 38×38×48 mm. Include single body and linear pattern. Primary axis X. Feature count target: 2 critical dims. Sample ID cad-079.",
    "features": [
      "single body",
      "linear pattern",
      "mounting pad"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "38",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "48",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "8",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "2",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Evidence",
    "tradeLink": "electrical",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 38×38×48 mm against the model or drawing.",
      "Feature present: single body.",
      "Feature present: linear pattern.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-079] Dual-engine QA on gimbal-yoke reports DIMENSION. What is the best next step?",
      "choices": [
        "Send a targeted numeric repair (coder/repair) against the brief tolerances; keep the architect plan if structure is still sound",
        "Throw away the whole Architect plan and invent a new part family from scratch",
        "Ignore the dimension delta if the mesh still looks smooth in the viewer",
        "Mark the sample complete without recording which dimension failed"
      ],
      "answerIndex": 0,
      "why": "QA error type should drive the next step: halt on fatal, numeric repair on dimension, structural re-plan on topology, keep evidence on pass."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 79/100: yoke with through-bore. Family: Fit and tolerance. Stage focus: brief."
  },
  {
    "id": "cad-080",
    "index": 80,
    "title": "080 · thread gauge · Safety-critical",
    "family": "safety-geometry",
    "familyLabel": "Safety-critical dims",
    "partId": "thread-gauge",
    "partDesc": "go/no-go style training plate",
    "difficulty": "advanced",
    "pipelineStage": "qa",
    "materialIntent": "mild steel plate",
    "primaryAxis": "Y",
    "prompt": "Design a go/no-go style training plate for training. Material intent: mild steel plate. Overall envelope about 39×39×49 mm. Include two independent bodies and circular pattern. Primary axis Y. Feature count target: 3 critical dims. Sample ID cad-080.",
    "features": [
      "two independent bodies",
      "circular pattern",
      "clearance gap 0.4 mm"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "39",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "49",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "9",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "3",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Inference",
    "tradeLink": "plumbing",
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 39×39×49 mm against the model or drawing.",
      "Feature present: two independent bodies.",
      "Feature present: circular pattern.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-080] Spec Planner for a go/no-go style training plate: what should the compact CAD brief emphasize?",
      "choices": [
        "Envelope size, body count, watertightness, and key features in structured fields — not a full chat replay",
        "A single emoji reaction instead of measurable goals",
        "Only the material brand name, with no size or body-count targets",
        "A free-form essay of every idea discussed, including abandoned sketches"
      ],
      "answerIndex": 0,
      "why": "Compact briefs keep multi-agent handoffs testable: sizes, bodies, seals, and named features."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 80/100: go/no-go style training plate. Family: Safety-critical dims. Stage focus: qa."
  },
  {
    "id": "cad-081",
    "index": 81,
    "title": "081 · t nut · Multi-Agent",
    "family": "mac-pipeline",
    "familyLabel": "Multi-Agent pipeline",
    "partId": "t-nut",
    "partDesc": "T-nut body",
    "difficulty": "advanced",
    "pipelineStage": "brief",
    "materialIntent": "PETG",
    "primaryAxis": "Z",
    "prompt": "Design a T-nut body for training. Material intent: PETG. Overall envelope about 40×40×10 mm. Include overall bounding box check and helical sweep. Primary axis Z. Feature count target: 4 critical dims. Sample ID cad-081.",
    "features": [
      "overall bounding box check",
      "helical sweep",
      "clearance gap 1.0 mm"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "40",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "10",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "10",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "4",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Assumption",
    "tradeLink": "hvac",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 40×40×10 mm against the model or drawing.",
      "Feature present: overall bounding box check.",
      "Feature present: helical sweep.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-081] Someone says “overall bounding box check on t-nut is proven correct” but no measurement or QA note exists. Best claim label?",
      "choices": [
        "Inference — the feature looks standard for this part family, so it is fine",
        "Evidence — on-screen shading is enough proof for production geometry",
        "Assumption (or unproven) — confidence without a recorded check is not evidence",
        "Evidence — because the brief mentioned the feature name"
      ],
      "answerIndex": 2,
      "why": "Call it evidence only when a measurement, QA report, or primary record backs it."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 81/100: T-nut body. Family: Multi-Agent pipeline. Stage focus: brief."
  },
  {
    "id": "cad-082",
    "index": 82,
    "title": "082 · flange · Mechanical",
    "family": "mechanical",
    "familyLabel": "Mechanical features",
    "partId": "flange",
    "partDesc": "circular plate with bolt circle",
    "difficulty": "advanced",
    "pipelineStage": "architect",
    "materialIntent": "HDPE sheet",
    "primaryAxis": "X",
    "prompt": "Design a circular plate with bolt circle for training. Material intent: HDPE sheet. Overall envelope about 41×41×11 mm. Include minimum wall 1.2 mm and boolean cut pocket. Primary axis X. Feature count target: 5 critical dims. Sample ID cad-082.",
    "features": [
      "minimum wall 1.2 mm",
      "boolean cut pocket",
      "print orientation flat on base"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "41",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "11",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "11",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "5",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Evidence",
    "tradeLink": "carpentry",
    "macLesson": "Geometric Architect plans sketches, steps, selectors, and iron rules — not freehand code yet.",
    "checkList": [
      "Confirm overall envelope ≈ 41×41×11 mm against the model or drawing.",
      "Feature present: minimum wall 1.2 mm.",
      "Feature present: boolean cut pocket.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-082] Before writing build code for flange, what should the Geometric Architect produce?",
      "choices": [
        "Only a pretty render with no dimension targets",
        "Immediate STEP export so coding can be skipped",
        "A random feature list with no order or acceptance checks",
        "A step plan: sketches, feature order, critical dimensions, and checks — not finished mesh export"
      ],
      "answerIndex": 3,
      "why": "Architect plans structure and acceptance; coder implements. Skipping the plan invites untestable geometry."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 82/100: circular plate with bolt circle. Family: Mechanical features. Stage focus: architect."
  },
  {
    "id": "cad-083",
    "index": 83,
    "title": "083 · open enclosure · Craft",
    "family": "trades-plan",
    "familyLabel": "Craft plan literacy",
    "partId": "open-enclosure",
    "partDesc": "box with open top",
    "difficulty": "advanced",
    "pipelineStage": "architect",
    "materialIntent": "aluminum 6061",
    "primaryAxis": "Y",
    "prompt": "Design a box with open top for training. Material intent: aluminum 6061. Overall envelope about 42×42×12 mm. Include hole diameter tolerance ±0.1 mm and boolean union boss. Primary axis Y. Feature count target: 6 critical dims. Sample ID cad-083.",
    "features": [
      "hole diameter tolerance ±0.1 mm",
      "boolean union boss",
      "water-tight solid"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "42",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "12",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "12",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "6",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Inference",
    "tradeLink": "quality",
    "macLesson": "Geometric Architect plans sketches, steps, selectors, and iron rules — not freehand code yet.",
    "checkList": [
      "Confirm overall envelope ≈ 42×42×12 mm against the model or drawing.",
      "Feature present: hole diameter tolerance ±0.1 mm.",
      "Feature present: boolean union boss.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-083] box with open top is planned as print-in-place with moving parts (aluminum 6061). What is a sound clearance habit?",
      "choices": [
        "Fuse all bodies into one solid so the slicer never sees seams",
        "Ignore orientation because clearance only matters in CAD, not on the bed",
        "Keep intentional gaps (about 0.4 mm class) between bodies that must move after print, and verify body count stays separate",
        "Use zero gap everywhere and sand the print until it moves"
      ],
      "answerIndex": 2,
      "why": "Print-in-place needs designed clearance and independent bodies; fusing or zero-gap usually locks the mechanism."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 83/100: box with open top. Family: Craft plan literacy. Stage focus: architect."
  },
  {
    "id": "cad-084",
    "index": 84,
    "title": "084 · geneva wheel · Print-in-place",
    "family": "print-clearance",
    "familyLabel": "Print-in-place clearances",
    "partId": "geneva-wheel",
    "partDesc": "intermittent drive disk",
    "difficulty": "advanced",
    "pipelineStage": "print",
    "materialIntent": "PLA",
    "primaryAxis": "Z",
    "prompt": "Design a intermittent drive disk for training. Material intent: PLA. Overall envelope about 43×43×13 mm. Include symmetry about midplane and shell thickness. Primary axis Z. Feature count target: 7 critical dims. Sample ID cad-084.",
    "features": [
      "symmetry about midplane",
      "shell thickness",
      "single body"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "43",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "13",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "13",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "7",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Assumption",
    "tradeLink": "construction",
    "macLesson": "Print orientation and clearance gaps matter for articulable / print-in-place parts.",
    "checkList": [
      "Confirm overall envelope ≈ 43×43×13 mm against the model or drawing.",
      "Feature present: symmetry about midplane.",
      "Feature present: shell thickness.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-084] At the print stage for geneva-wheel (43×43×13 mm, 7 critical dims along Z), what is a solid verification move?",
      "choices": [
        "Pick orientation and support strategy that protect thin walls and clearances called out in the brief",
        "Orient randomly each time to average out warping",
        "Disable all clearance checks if print time is short",
        "Always stand the part on its weakest wall for drama"
      ],
      "answerIndex": 0,
      "why": "Each pipeline stage has a verification duty: brief completeness, planned features, measured dims, and print-aware checks."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 84/100: intermittent drive disk. Family: Print-in-place clearances. Stage focus: print."
  },
  {
    "id": "cad-085",
    "index": 85,
    "title": "085 · phone stand · Multi-body",
    "family": "assembly",
    "familyLabel": "Multi-body assembly",
    "partId": "phone-stand",
    "partDesc": "angled rest",
    "difficulty": "advanced",
    "pipelineStage": "architect",
    "materialIntent": "plywood panel",
    "primaryAxis": "X",
    "prompt": "Design a angled rest for training. Material intent: plywood panel. Overall envelope about 44×44×14 mm. Include through-hole array and draft angle. Primary axis X. Feature count target: 2 critical dims. Sample ID cad-085.",
    "features": [
      "through-hole array",
      "draft angle",
      "two independent bodies"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "44",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "14",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "2",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "2",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Evidence",
    "tradeLink": "automotive",
    "macLesson": "Geometric Architect plans sketches, steps, selectors, and iron rules — not freehand code yet.",
    "checkList": [
      "Confirm overall envelope ≈ 44×44×14 mm against the model or drawing.",
      "Feature present: through-hole array.",
      "Feature present: draft angle.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-085] Dual-engine QA on phone-stand reports FATAL. What is the best next step?",
      "choices": [
        "Keep running the same repair agent until it eventually exports something",
        "Stop auto-repair loops; treat connectivity/watertightness as blocked until a human reviews the report",
        "Lower mesh resolution so the topology error disappears from the report",
        "Export STL now and note the issue in a chat message later"
      ],
      "answerIndex": 1,
      "why": "QA error type should drive the next step: halt on fatal, numeric repair on dimension, structural re-plan on topology, keep evidence on pass."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 85/100: angled rest. Family: Multi-body assembly. Stage focus: architect."
  },
  {
    "id": "cad-086",
    "index": 86,
    "title": "086 · pipe hanger · Integrity",
    "family": "integrity",
    "familyLabel": "Integrity on geometry",
    "partId": "pipe-hanger",
    "partDesc": "U-strap with base",
    "difficulty": "advanced",
    "pipelineStage": "qa",
    "materialIntent": "ABS",
    "primaryAxis": "Y",
    "prompt": "Design a U-strap with base for training. Material intent: ABS. Overall envelope about 45×45×15 mm. Include fillet on outer edges and rib. Primary axis Y. Feature count target: 3 critical dims. Sample ID cad-086.",
    "features": [
      "fillet on outer edges",
      "rib",
      "overall bounding box check"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "45",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "15",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "3",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "3",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Inference",
    "tradeLink": "energy",
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 45×45×15 mm against the model or drawing.",
      "Feature present: fillet on outer edges.",
      "Feature present: rib.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-086] Spec Planner for a U-strap with base: what should the compact CAD brief emphasize?",
      "choices": [
        "Envelope size, body count, watertightness, and key features in structured fields — not a full chat replay",
        "A free-form essay of every idea discussed, including abandoned sketches",
        "Only the material brand name, with no size or body-count targets",
        "A single emoji reaction instead of measurable goals"
      ],
      "answerIndex": 0,
      "why": "Compact briefs keep multi-agent handoffs testable: sizes, bodies, seals, and named features."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 86/100: U-strap with base. Family: Integrity on geometry. Stage focus: qa."
  },
  {
    "id": "cad-087",
    "index": 87,
    "title": "087 · wall plate · Boolean",
    "family": "boolean-ops",
    "familyLabel": "Boolean and cut features",
    "partId": "wall-plate",
    "partDesc": "bottom plate with stud marks",
    "difficulty": "advanced",
    "pipelineStage": "repair",
    "materialIntent": "nylon PA12",
    "primaryAxis": "Z",
    "prompt": "Design a bottom plate with stud marks for training. Material intent: nylon PA12. Overall envelope about 46×46×16 mm. Include chamfer on top rim and slot. Primary axis Z. Feature count target: 4 critical dims. Sample ID cad-087.",
    "features": [
      "chamfer on top rim",
      "slot",
      "minimum wall 1.2 mm"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "46",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "16",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "4",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "4",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Assumption",
    "tradeLink": null,
    "macLesson": "Repair agents edit code from QA evidence; max iterations; fatal errors halt.",
    "checkList": [
      "Confirm overall envelope ≈ 46×46×16 mm against the model or drawing.",
      "Feature present: chamfer on top rim.",
      "Feature present: slot.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-087] Someone says “chamfer on top rim on wall-plate is proven correct” but no measurement or QA note exists. Best claim label?",
      "choices": [
        "Evidence — on-screen shading is enough proof for production geometry",
        "Assumption (or unproven) — confidence without a recorded check is not evidence",
        "Evidence — because the brief mentioned the feature name",
        "Inference — the feature looks standard for this part family, so it is fine"
      ],
      "answerIndex": 1,
      "why": "Call it evidence only when a measurement, QA report, or primary record backs it."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 87/100: bottom plate with stud marks. Family: Boolean and cut features. Stage focus: repair."
  },
  {
    "id": "cad-088",
    "index": 88,
    "title": "088 · bearing block · Patterns",
    "family": "patterns",
    "familyLabel": "Patterns and arrays",
    "partId": "bearing-block",
    "partDesc": "pillow block housing",
    "difficulty": "advanced",
    "pipelineStage": "architect",
    "materialIntent": "mild steel plate",
    "primaryAxis": "X",
    "prompt": "Design a pillow block housing for training. Material intent: mild steel plate. Overall envelope about 47×47×17 mm. Include counterbore and keyway. Primary axis X. Feature count target: 5 critical dims. Sample ID cad-088.",
    "features": [
      "counterbore",
      "keyway",
      "hole diameter tolerance ±0.1 mm"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "47",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "17",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "5",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "5",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Evidence",
    "tradeLink": null,
    "macLesson": "Geometric Architect plans sketches, steps, selectors, and iron rules — not freehand code yet.",
    "checkList": [
      "Confirm overall envelope ≈ 47×47×17 mm against the model or drawing.",
      "Feature present: counterbore.",
      "Feature present: keyway.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-088] Before writing build code for bearing-block, what should the Geometric Architect produce?",
      "choices": [
        "A step plan: sketches, feature order, critical dimensions, and checks — not finished mesh export",
        "A random feature list with no order or acceptance checks",
        "Only a pretty render with no dimension targets",
        "Immediate STEP export so coding can be skipped"
      ],
      "answerIndex": 0,
      "why": "Architect plans structure and acceptance; coder implements. Skipping the plan invites untestable geometry."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 88/100: pillow block housing. Family: Patterns and arrays. Stage focus: architect."
  },
  {
    "id": "cad-089",
    "index": 89,
    "title": "089 · heat sink · Fit",
    "family": "tolerances",
    "familyLabel": "Fit and tolerance",
    "partId": "heat-sink",
    "partDesc": "base with parallel fins",
    "difficulty": "advanced",
    "pipelineStage": "brief",
    "materialIntent": "PETG",
    "primaryAxis": "Y",
    "prompt": "Design a base with parallel fins for training. Material intent: PETG. Overall envelope about 48×48×18 mm. Include countersink and thread relief groove. Primary axis Y. Feature count target: 6 critical dims. Sample ID cad-089.",
    "features": [
      "countersink",
      "thread relief groove",
      "symmetry about midplane"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "48",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "18",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "6",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "6",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Inference",
    "tradeLink": "welding",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 48×48×18 mm against the model or drawing.",
      "Feature present: countersink.",
      "Feature present: thread relief groove.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-089] base with parallel fins is planned as print-in-place with moving parts (PETG). What is a sound clearance habit?",
      "choices": [
        "Fuse all bodies into one solid so the slicer never sees seams",
        "Use zero gap everywhere and sand the print until it moves",
        "Ignore orientation because clearance only matters in CAD, not on the bed",
        "Keep intentional gaps (about 0.4 mm class) between bodies that must move after print, and verify body count stays separate"
      ],
      "answerIndex": 3,
      "why": "Print-in-place needs designed clearance and independent bodies; fusing or zero-gap usually locks the mechanism."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 89/100: base with parallel fins. Family: Fit and tolerance. Stage focus: brief."
  },
  {
    "id": "cad-090",
    "index": 90,
    "title": "090 · clamp collar · Safety-critical",
    "family": "safety-geometry",
    "familyLabel": "Safety-critical dims",
    "partId": "clamp-collar",
    "partDesc": "split shaft collar",
    "difficulty": "advanced",
    "pipelineStage": "repair",
    "materialIntent": "HDPE sheet",
    "primaryAxis": "Z",
    "prompt": "Design a split shaft collar for training. Material intent: HDPE sheet. Overall envelope about 49×49×19 mm. Include linear pattern and pilot hole. Primary axis Z. Feature count target: 7 critical dims. Sample ID cad-090.",
    "features": [
      "linear pattern",
      "pilot hole",
      "through-hole array"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "49",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "19",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "7",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "7",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Assumption",
    "tradeLink": "electrical",
    "macLesson": "Repair agents edit code from QA evidence; max iterations; fatal errors halt.",
    "checkList": [
      "Confirm overall envelope ≈ 49×49×19 mm against the model or drawing.",
      "Feature present: linear pattern.",
      "Feature present: pilot hole.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-090] At the repair stage for clamp-collar (49×49×19 mm, 7 critical dims along Z), what is a solid verification move?",
      "choices": [
        "Export first; only open the QA report if someone complains later",
        "Only check the pretty preview camera angle",
        "Compare critical feature size (target ~7 mm) and topology/mesh reports to the brief before export",
        "Change material intent to hide a failed dimension check"
      ],
      "answerIndex": 2,
      "why": "Each pipeline stage has a verification duty: brief completeness, planned features, measured dims, and print-aware checks."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 90/100: split shaft collar. Family: Safety-critical dims. Stage focus: repair."
  },
  {
    "id": "cad-091",
    "index": 91,
    "title": "091 · rail clip · Multi-Agent",
    "family": "mac-pipeline",
    "familyLabel": "Multi-Agent pipeline",
    "partId": "rail-clip",
    "partDesc": "snap clip for T-slot",
    "difficulty": "advanced",
    "pipelineStage": "brief",
    "materialIntent": "aluminum 6061",
    "primaryAxis": "X",
    "prompt": "Design a snap clip for T-slot for training. Material intent: aluminum 6061. Overall envelope about 50×50×20 mm. Include circular pattern and mounting pad. Primary axis X. Feature count target: 2 critical dims. Sample ID cad-091.",
    "features": [
      "circular pattern",
      "mounting pad",
      "fillet on outer edges"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "50",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "20",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "8",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "2",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Evidence",
    "tradeLink": "plumbing",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 50×50×20 mm against the model or drawing.",
      "Feature present: circular pattern.",
      "Feature present: mounting pad.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-091] Dual-engine QA on rail-clip reports DIMENSION. What is the best next step?",
      "choices": [
        "Throw away the whole Architect plan and invent a new part family from scratch",
        "Mark the sample complete without recording which dimension failed",
        "Ignore the dimension delta if the mesh still looks smooth in the viewer",
        "Send a targeted numeric repair (coder/repair) against the brief tolerances; keep the architect plan if structure is still sound"
      ],
      "answerIndex": 3,
      "why": "QA error type should drive the next step: halt on fatal, numeric repair on dimension, structural re-plan on topology, keep evidence on pass."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 91/100: snap clip for T-slot. Family: Multi-Agent pipeline. Stage focus: brief."
  },
  {
    "id": "cad-092",
    "index": 92,
    "title": "092 · ladder rung · Mechanical",
    "family": "mechanical",
    "familyLabel": "Mechanical features",
    "partId": "ladder-rung",
    "partDesc": "rung with end tenons",
    "difficulty": "advanced",
    "pipelineStage": "coder",
    "materialIntent": "PLA",
    "primaryAxis": "Y",
    "prompt": "Design a rung with end tenons for training. Material intent: PLA. Overall envelope about 51×51×21 mm. Include helical sweep and clearance gap 0.4 mm. Primary axis Y. Feature count target: 3 critical dims. Sample ID cad-092.",
    "features": [
      "helical sweep",
      "clearance gap 0.4 mm",
      "chamfer on top rim"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "51",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "21",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "9",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "3",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Inference",
    "tradeLink": "hvac",
    "macLesson": "Python Coder / build123d path turns plan into executable geometry code; deterministic first, LLM repair second.",
    "checkList": [
      "Confirm overall envelope ≈ 51×51×21 mm against the model or drawing.",
      "Feature present: helical sweep.",
      "Feature present: clearance gap 0.4 mm.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-092] Spec Planner for a rung with end tenons: what should the compact CAD brief emphasize?",
      "choices": [
        "A free-form essay of every idea discussed, including abandoned sketches",
        "Envelope size, body count, watertightness, and key features in structured fields — not a full chat replay",
        "Only the material brand name, with no size or body-count targets",
        "A single emoji reaction instead of measurable goals"
      ],
      "answerIndex": 1,
      "why": "Compact briefs keep multi-agent handoffs testable: sizes, bodies, seals, and named features."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 92/100: rung with end tenons. Family: Mechanical features. Stage focus: coder."
  },
  {
    "id": "cad-093",
    "index": 93,
    "title": "093 · conduit cover · Craft",
    "family": "trades-plan",
    "familyLabel": "Craft plan literacy",
    "partId": "conduit-cover",
    "partDesc": "threaded cover blank",
    "difficulty": "advanced",
    "pipelineStage": "qa",
    "materialIntent": "plywood panel",
    "primaryAxis": "Z",
    "prompt": "Design a threaded cover blank for training. Material intent: plywood panel. Overall envelope about 52×52×22 mm. Include boolean cut pocket and clearance gap 1.0 mm. Primary axis Z. Feature count target: 4 critical dims. Sample ID cad-093.",
    "features": [
      "boolean cut pocket",
      "clearance gap 1.0 mm",
      "counterbore"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "52",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "22",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "10",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "4",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Assumption",
    "tradeLink": "carpentry",
    "macLesson": "Dual-engine QA: STEP topology (Engine A) + mesh checks (Engine B). Error types route the loop.",
    "checkList": [
      "Confirm overall envelope ≈ 52×52×22 mm against the model or drawing.",
      "Feature present: boolean cut pocket.",
      "Feature present: clearance gap 1.0 mm.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-093] Someone says “boolean cut pocket on conduit-cover is proven correct” but no measurement or QA note exists. Best claim label?",
      "choices": [
        "Assumption (or unproven) — confidence without a recorded check is not evidence",
        "Evidence — because the brief mentioned the feature name",
        "Evidence — on-screen shading is enough proof for production geometry",
        "Inference — the feature looks standard for this part family, so it is fine"
      ],
      "answerIndex": 0,
      "why": "Call it evidence only when a measurement, QA report, or primary record backs it."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 93/100: threaded cover blank. Family: Craft plan literacy. Stage focus: qa."
  },
  {
    "id": "cad-094",
    "index": 94,
    "title": "094 · shower curb · Print-in-place",
    "family": "print-clearance",
    "familyLabel": "Print-in-place clearances",
    "partId": "shower-curb",
    "partDesc": "curb section profile",
    "difficulty": "advanced",
    "pipelineStage": "architect",
    "materialIntent": "ABS",
    "primaryAxis": "X",
    "prompt": "Design a curb section profile for training. Material intent: ABS. Overall envelope about 53×53×23 mm. Include boolean union boss and print orientation flat on base. Primary axis X. Feature count target: 5 critical dims. Sample ID cad-094.",
    "features": [
      "boolean union boss",
      "print orientation flat on base",
      "countersink"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "53",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "23",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "11",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "5",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Evidence",
    "tradeLink": "quality",
    "macLesson": "Geometric Architect plans sketches, steps, selectors, and iron rules — not freehand code yet.",
    "checkList": [
      "Confirm overall envelope ≈ 53×53×23 mm against the model or drawing.",
      "Feature present: boolean union boss.",
      "Feature present: print orientation flat on base.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-094] Before writing build code for shower-curb, what should the Geometric Architect produce?",
      "choices": [
        "Only a pretty render with no dimension targets",
        "Immediate STEP export so coding can be skipped",
        "A random feature list with no order or acceptance checks",
        "A step plan: sketches, feature order, critical dimensions, and checks — not finished mesh export"
      ],
      "answerIndex": 3,
      "why": "Architect plans structure and acceptance; coder implements. Skipping the plan invites untestable geometry."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 94/100: curb section profile. Family: Print-in-place clearances. Stage focus: architect."
  },
  {
    "id": "cad-095",
    "index": 95,
    "title": "095 · pallet corner · Multi-body",
    "family": "assembly",
    "familyLabel": "Multi-body assembly",
    "partId": "pallet-corner",
    "partDesc": "reinforced corner block",
    "difficulty": "advanced",
    "pipelineStage": "coder",
    "materialIntent": "nylon PA12",
    "primaryAxis": "Y",
    "prompt": "Design a reinforced corner block for training. Material intent: nylon PA12. Overall envelope about 54×54×24 mm. Include shell thickness and water-tight solid. Primary axis Y. Feature count target: 6 critical dims. Sample ID cad-095.",
    "features": [
      "shell thickness",
      "water-tight solid",
      "linear pattern"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "54",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "24",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "12",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "6",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Inference",
    "tradeLink": "construction",
    "macLesson": "Python Coder / build123d path turns plan into executable geometry code; deterministic first, LLM repair second.",
    "checkList": [
      "Confirm overall envelope ≈ 54×54×24 mm against the model or drawing.",
      "Feature present: shell thickness.",
      "Feature present: water-tight solid.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-095] reinforced corner block is planned as print-in-place with moving parts (nylon PA12). What is a sound clearance habit?",
      "choices": [
        "Use zero gap everywhere and sand the print until it moves",
        "Keep intentional gaps (about 0.4 mm class) between bodies that must move after print, and verify body count stays separate",
        "Ignore orientation because clearance only matters in CAD, not on the bed",
        "Fuse all bodies into one solid so the slicer never sees seams"
      ],
      "answerIndex": 1,
      "why": "Print-in-place needs designed clearance and independent bodies; fusing or zero-gap usually locks the mechanism."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 95/100: reinforced corner block. Family: Multi-body assembly. Stage focus: coder."
  },
  {
    "id": "cad-096",
    "index": 96,
    "title": "096 · gripper finger · Integrity",
    "family": "integrity",
    "familyLabel": "Integrity on geometry",
    "partId": "gripper-finger",
    "partDesc": "finger pad blank",
    "difficulty": "advanced",
    "pipelineStage": "repair",
    "materialIntent": "mild steel plate",
    "primaryAxis": "Z",
    "prompt": "Design a finger pad blank for training. Material intent: mild steel plate. Overall envelope about 55×55×25 mm. Include draft angle and single body. Primary axis Z. Feature count target: 7 critical dims. Sample ID cad-096.",
    "features": [
      "draft angle",
      "single body",
      "circular pattern"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "55",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "25",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "13",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "7",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Assumption",
    "tradeLink": "automotive",
    "macLesson": "Repair agents edit code from QA evidence; max iterations; fatal errors halt.",
    "checkList": [
      "Confirm overall envelope ≈ 55×55×25 mm against the model or drawing.",
      "Feature present: draft angle.",
      "Feature present: single body.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-096] At the repair stage for gripper-finger (55×55×25 mm, 7 critical dims along Z), what is a solid verification move?",
      "choices": [
        "Export first; only open the QA report if someone complains later",
        "Only check the pretty preview camera angle",
        "Compare critical feature size (target ~13 mm) and topology/mesh reports to the brief before export",
        "Change material intent to hide a failed dimension check"
      ],
      "answerIndex": 2,
      "why": "Each pipeline stage has a verification duty: brief completeness, planned features, measured dims, and print-aware checks."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 96/100: finger pad blank. Family: Integrity on geometry. Stage focus: repair."
  },
  {
    "id": "cad-097",
    "index": 97,
    "title": "097 · keyway shaft · Boolean",
    "family": "boolean-ops",
    "familyLabel": "Boolean and cut features",
    "partId": "keyway-shaft",
    "partDesc": "shaft with single keyway",
    "difficulty": "advanced",
    "pipelineStage": "coder",
    "materialIntent": "PETG",
    "primaryAxis": "X",
    "prompt": "Design a shaft with single keyway for training. Material intent: PETG. Overall envelope about 56×56×26 mm. Include rib and two independent bodies. Primary axis X. Feature count target: 2 critical dims. Sample ID cad-097.",
    "features": [
      "rib",
      "two independent bodies",
      "helical sweep"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "56",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "26",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "2",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "2",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Evidence",
    "tradeLink": "energy",
    "macLesson": "Python Coder / build123d path turns plan into executable geometry code; deterministic first, LLM repair second.",
    "checkList": [
      "Confirm overall envelope ≈ 56×56×26 mm against the model or drawing.",
      "Feature present: rib.",
      "Feature present: two independent bodies.",
      "If QA reports FATAL: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-097] Dual-engine QA on keyway-shaft reports FATAL. What is the best next step?",
      "choices": [
        "Keep running the same repair agent until it eventually exports something",
        "Stop auto-repair loops; treat connectivity/watertightness as blocked until a human reviews the report",
        "Lower mesh resolution so the topology error disappears from the report",
        "Export STL now and note the issue in a chat message later"
      ],
      "answerIndex": 1,
      "why": "QA error type should drive the next step: halt on fatal, numeric repair on dimension, structural re-plan on topology, keep evidence on pass."
    },
    "scenarioHold": "Do not export a printable file until connectivity/watertightness is resolved or the job is formally cancelled.",
    "humanReadableSummary": "Sample 97/100: shaft with single keyway. Family: Boolean and cut features. Stage focus: coder."
  },
  {
    "id": "cad-098",
    "index": 98,
    "title": "098 · linear housing · Patterns",
    "family": "patterns",
    "familyLabel": "Patterns and arrays",
    "partId": "linear-housing",
    "partDesc": "linear bearing housing blank",
    "difficulty": "advanced",
    "pipelineStage": "coder",
    "materialIntent": "HDPE sheet",
    "primaryAxis": "Y",
    "prompt": "Design a linear bearing housing blank for training. Material intent: HDPE sheet. Overall envelope about 57×57×27 mm. Include slot and overall bounding box check. Primary axis Y. Feature count target: 3 critical dims. Sample ID cad-098.",
    "features": [
      "slot",
      "overall bounding box check",
      "boolean cut pocket"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "57",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "27",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "3",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "3",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Inference",
    "tradeLink": null,
    "macLesson": "Python Coder / build123d path turns plan into executable geometry code; deterministic first, LLM repair second.",
    "checkList": [
      "Confirm overall envelope ≈ 57×57×27 mm against the model or drawing.",
      "Feature present: slot.",
      "Feature present: overall bounding box check.",
      "QA pass: keep the report with the artifact.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-098] Spec Planner for a linear bearing housing blank: what should the compact CAD brief emphasize?",
      "choices": [
        "A single emoji reaction instead of measurable goals",
        "A free-form essay of every idea discussed, including abandoned sketches",
        "Envelope size, body count, watertightness, and key features in structured fields — not a full chat replay",
        "Only the material brand name, with no size or body-count targets"
      ],
      "answerIndex": 2,
      "why": "Compact briefs keep multi-agent handoffs testable: sizes, bodies, seals, and named features."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 98/100: linear bearing housing blank. Family: Patterns and arrays. Stage focus: coder."
  },
  {
    "id": "cad-099",
    "index": 99,
    "title": "099 · l bracket · Fit",
    "family": "tolerances",
    "familyLabel": "Fit and tolerance",
    "partId": "l-bracket",
    "partDesc": "right-angle support bracket",
    "difficulty": "advanced",
    "pipelineStage": "brief",
    "materialIntent": "aluminum 6061",
    "primaryAxis": "Z",
    "prompt": "Design a right-angle support bracket for training. Material intent: aluminum 6061. Overall envelope about 58×58×28 mm. Include keyway and minimum wall 1.2 mm. Primary axis Z. Feature count target: 4 critical dims. Sample ID cad-099.",
    "features": [
      "keyway",
      "minimum wall 1.2 mm",
      "boolean union boss"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "58",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "28",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "4",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "4",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Assumption",
    "tradeLink": null,
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 58×58×28 mm against the model or drawing.",
      "Feature present: keyway.",
      "Feature present: minimum wall 1.2 mm.",
      "If QA reports DIMENSION: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-099] Someone says “keyway on l-bracket is proven correct” but no measurement or QA note exists. Best claim label?",
      "choices": [
        "Evidence — because the brief mentioned the feature name",
        "Inference — the feature looks standard for this part family, so it is fine",
        "Assumption (or unproven) — confidence without a recorded check is not evidence",
        "Evidence — on-screen shading is enough proof for production geometry"
      ],
      "answerIndex": 2,
      "why": "Call it evidence only when a measurement, QA report, or primary record backs it."
    },
    "scenarioHold": "Hold final STEP until critical dimensions match the brief within stated tolerance.",
    "humanReadableSummary": "Sample 99/100: right-angle support bracket. Family: Fit and tolerance. Stage focus: brief."
  },
  {
    "id": "cad-100",
    "index": 100,
    "title": "100 · clevis · Safety-critical",
    "family": "safety-geometry",
    "familyLabel": "Safety-critical dims",
    "partId": "clevis",
    "partDesc": "U-shaped link with pin hole",
    "difficulty": "advanced",
    "pipelineStage": "brief",
    "materialIntent": "PLA",
    "primaryAxis": "X",
    "prompt": "Design a U-shaped link with pin hole for training. Material intent: PLA. Overall envelope about 59×59×29 mm. Include thread relief groove and hole diameter tolerance ±0.1 mm. Primary axis X. Feature count target: 5 critical dims. Sample ID cad-100.",
    "features": [
      "thread relief groove",
      "hole diameter tolerance ±0.1 mm",
      "shell thickness"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "59",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "29",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "5",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "5",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Evidence",
    "tradeLink": "welding",
    "macLesson": "Spec Planner compresses intent into a CADBrief: envelope, body count, watertightness, critical dims.",
    "checkList": [
      "Confirm overall envelope ≈ 59×59×29 mm against the model or drawing.",
      "Feature present: thread relief groove.",
      "Feature present: hole diameter tolerance ±0.1 mm.",
      "If QA reports TOPOLOGY: choose the matching repair path before export.",
      "Label any spoken size as Evidence, Inference, or Assumption based on what was measured."
    ],
    "quiz": {
      "prompt": "[cad-100] Before writing build code for clevis, what should the Geometric Architect produce?",
      "choices": [
        "Only a pretty render with no dimension targets",
        "A random feature list with no order or acceptance checks",
        "Immediate STEP export so coding can be skipped",
        "A step plan: sketches, feature order, critical dimensions, and checks — not finished mesh export"
      ],
      "answerIndex": 3,
      "why": "Architect plans structure and acceptance; coder implements. Skipping the plan invites untestable geometry."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 100/100: U-shaped link with pin hole. Family: Safety-critical dims. Stage focus: brief."
  }
];

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
    errors.push(`count ${CAD_SAMPLES_100.length} !== 100`);
  }
  const ids = new Set<string>();
  const titles = new Set<string>();
  const prompts = new Set<string>();
  const quizzes = new Set<string>();
  const idxDist: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
  const banned =
    /municipality|city of |county of |parcel\s*#|street address|ssn|social security|operator private|skill brand/i;
  for (const s of CAD_SAMPLES_100) {
    if (!/^cad-\d{3}$/.test(s.id)) errors.push(`bad id ${s.id}`);
    if (ids.has(s.id)) errors.push(`dup id ${s.id}`);
    ids.add(s.id);
    if (titles.has(s.title)) errors.push(`dup title ${s.title}`);
    titles.add(s.title);
    if (prompts.has(s.prompt)) errors.push(`dup prompt ${s.id}`);
    prompts.add(s.prompt);
    if (quizzes.has(s.quiz.prompt)) errors.push(`dup quiz ${s.id}`);
    quizzes.add(s.quiz.prompt);
    if (s.quiz.answerIndex < 0 || s.quiz.answerIndex >= s.quiz.choices.length) {
      errors.push(`bad answerIndex ${s.id}`);
    }
    idxDist[s.quiz.answerIndex] = (idxDist[s.quiz.answerIndex] ?? 0) + 1;
    if (!s.features.length) errors.push(`no features ${s.id}`);
    if (!s.checkList.length) errors.push(`no checklist ${s.id}`);
    if (!s.macLesson.trim()) errors.push(`empty lesson ${s.id}`);
    if (!s.humanReadableSummary.trim()) errors.push(`empty summary ${s.id}`);
    for (const c of s.quiz.choices) {
      if (!c || c.length < 8) errors.push(`weak choice ${s.id}`);
      if (banned.test(c)) errors.push(`banned choice language ${s.id}`);
    }
    if (banned.test(s.quiz.prompt) || banned.test(s.prompt)) {
      errors.push(`banned prompt language ${s.id}`);
    }
  }
  const used = Object.values(idxDist).filter((n) => n > 0).length;
  if (used < 3) errors.push(`answerIndex not distributed: ${JSON.stringify(idxDist)}`);
  return { ok: errors.length === 0, errors };
}
