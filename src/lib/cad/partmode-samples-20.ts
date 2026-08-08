/**
 * PartMode literacy sample pack — 20 unique offline items.
 * Complements MAC 100-pack: session authority, preview→commit, inspect Evidence, trades/BOM bridge.
 * Does NOT run PartMode kernel or MCP. Live CAD: https://partmode.com/
 * Generate: node scripts/generate-partmode-samples-20.mjs
 */

import type { CadSample } from "./cad-samples-100";

export const PARTMODE_SAMPLES_20: CadSample[] = [
  {
    "id": "pm-001",
    "index": 1,
    "title": "001 · bracket-plate · PartMode",
    "family": "partmode-session",
    "familyLabel": "Session & authority",
    "partId": "bracket-plate",
    "partDesc": "L-bracket training plate",
    "difficulty": "beginner",
    "pipelineStage": "brief",
    "materialIntent": "PETG",
    "primaryAxis": "X",
    "prompt": "PartMode literacy: design a L-bracket training plate for training only. Units mm. Envelope about 20×20×8 mm. Material intent: PETG. Primary axis X. Practice: session authority, preview-before-commit, and inspect Evidence. Sample pm-001. Trade link: cnc.",
    "features": [
      "closed sketch profile",
      "parametric extrude",
      "fillet on outer edge"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "20",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "8",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "2",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "1",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Evidence",
    "tradeLink": "cnc",
    "macLesson": "PartMode: agents join via scoped session; human approves in a visible studio. MAC parallel: human gate on FATAL QA.",
    "checkList": [
      "Confirm overall envelope ≈ 20×20×8 mm against a drawing or inspect readout (Evidence).",
      "Feature present: closed sketch profile.",
      "Feature present: parametric extrude.",
      "If an agent proposes a change: require preview diagnostics before any commit metaphor.",
      "Label spoken sizes as Evidence, Inference, or Assumption.",
      "When checks pass, discuss STEP export as a deliverable — still educational only."
    ],
    "quiz": {
      "prompt": "[pm-001] An agent wants to change the bracket-plate model. What is the correct PartMode-style order?",
      "choices": [
        "Preview the typed operation, review diagnostics and revision, then commit only with the matching preview id",
        "Commit immediately so the human does not have to look",
        "Export STEP first, then invent geometry in a chat without a session",
        "Disable all checks and let the agent run until the mesh looks fine"
      ],
      "answerIndex": 0,
      "why": "PartMode literacy: mutations are preview-bound transactions. Commit needs matching preview + revision evidence."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 1/20: L-bracket training plate. Family: Session & authority. Focus: PartMode literacy (offline). Trade: cnc."
  },
  {
    "id": "pm-002",
    "index": 2,
    "title": "002 · shaft-collar · PartMode",
    "family": "partmode-preview-commit",
    "familyLabel": "Preview → commit",
    "partId": "shaft-collar",
    "partDesc": "set-screw shaft collar",
    "difficulty": "intermediate",
    "pipelineStage": "architect",
    "materialIntent": "PLA",
    "primaryAxis": "Y",
    "prompt": "PartMode literacy: design a set-screw shaft collar for training only. Units mm. Envelope about 24×24×10 mm. Material intent: PLA. Primary axis Y. Practice: session authority, preview-before-commit, and inspect Evidence. Sample pm-002. Trade link: cnc.",
    "features": [
      "through-hole",
      "parameter table",
      "mirror pattern"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "24",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "10",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "3",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "2",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Inference",
    "tradeLink": "cnc",
    "macLesson": "PartMode: cad_preview then cad_commit with matching revision. MAC parallel: dual QA before export.",
    "checkList": [
      "Confirm overall envelope ≈ 24×24×10 mm against a drawing or inspect readout (Evidence).",
      "Feature present: through-hole.",
      "Feature present: parameter table.",
      "If an agent proposes a change: require preview diagnostics before any commit metaphor.",
      "Label spoken sizes as Evidence, Inference, or Assumption.",
      "When checks pass, discuss STEP export as a deliverable — still educational only."
    ],
    "quiz": {
      "prompt": "[pm-002] Who should approve an agent CAD session on a training model?",
      "choices": [
        "Anyone with the public website open — no human needed",
        "A human with authority for that studio/session, who can also pause or revoke",
        "The agent itself after three successful mesh exports",
        "A random chat user without a scoped key or session"
      ],
      "answerIndex": 1,
      "why": "Human final call: browser-approved sessions keep authority visible; keys alone do not invent consent."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 2/20: set-screw shaft collar. Family: Preview → commit. Focus: PartMode literacy (offline). Trade: cnc."
  },
  {
    "id": "pm-003",
    "index": 3,
    "title": "003 · flange-gasket · PartMode",
    "family": "partmode-inspect",
    "familyLabel": "Inspect & evidence",
    "partId": "flange-gasket",
    "partDesc": "flat flange gasket blank",
    "difficulty": "advanced",
    "pipelineStage": "coder",
    "materialIntent": "aluminum intent",
    "primaryAxis": "Z",
    "prompt": "PartMode literacy: design a flat flange gasket blank for training only. Units mm. Envelope about 28×28×12 mm. Material intent: aluminum intent. Primary axis Z. Practice: session authority, preview-before-commit, and inspect Evidence. Sample pm-003. Trade link: quality.",
    "features": [
      "revolve candidate",
      "section view intent",
      "mate plane label"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "28",
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
        "value": "3",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Assumption",
    "tradeLink": "quality",
    "macLesson": "PartMode: inspect mass/topology as Evidence. MAC parallel: DIMENSION vs TOPOLOGY routing.",
    "checkList": [
      "Confirm overall envelope ≈ 28×28×12 mm against a drawing or inspect readout (Evidence).",
      "Feature present: revolve candidate.",
      "Feature present: section view intent.",
      "If an agent proposes a change: require preview diagnostics before any commit metaphor.",
      "Label spoken sizes as Evidence, Inference, or Assumption.",
      "When checks pass, discuss STEP export as a deliverable — still educational only."
    ],
    "quiz": {
      "prompt": "[pm-003] Which is the strongest Evidence that a training part is watertight enough to discuss export?",
      "choices": [
        "A screenshot that looks solid from one angle",
        "A claim in chat that the model is fine",
        "Inspect results: topology health, mass properties, and a settled revision/hash after checks",
        "Doubling the triangle count so errors hide"
      ],
      "answerIndex": 2,
      "why": "Evidence is re-checkable: inspect, mass, revision. Screenshots and vibes are weaker."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 3/20: flat flange gasket blank. Family: Inspect & evidence. Focus: PartMode literacy (offline). Trade: quality."
  },
  {
    "id": "pm-004",
    "index": 4,
    "title": "004 · pipe-stub · PartMode",
    "family": "partmode-trades",
    "familyLabel": "Trades bridge",
    "partId": "pipe-stub",
    "partDesc": "short pipe stub practice",
    "difficulty": "beginner",
    "pipelineStage": "qa",
    "materialIntent": "mild steel intent",
    "primaryAxis": "X",
    "prompt": "PartMode literacy: design a short pipe stub practice for training only. Units mm. Envelope about 32×32×14 mm. Material intent: mild steel intent. Primary axis X. Practice: session authority, preview-before-commit, and inspect Evidence. Sample pm-004. Trade link: plumbing.",
    "features": [
      "shell thickness target",
      "draft angle note",
      "configuration variant"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "32",
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
        "value": "4",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Evidence",
    "tradeLink": "plumbing",
    "macLesson": "Trades bridge: same claim hygiene whether CNC, weld, or install — educational geometry only.",
    "checkList": [
      "Confirm overall envelope ≈ 32×32×14 mm against a drawing or inspect readout (Evidence).",
      "Feature present: shell thickness target.",
      "Feature present: draft angle note.",
      "If an agent proposes a change: require preview diagnostics before any commit metaphor.",
      "Label spoken sizes as Evidence, Inference, or Assumption.",
      "FATAL-style issue: stop auto-loops; human final call before export talk."
    ],
    "quiz": {
      "prompt": "[pm-004] How should Grok Tutor relate to live PartMode?",
      "choices": [
        "This lab embeds the full AGPL kernel and auto-commits with a shared public agent key",
        "Offline literacy samples here; live CAD stays on partmode.com or a private self-host — no public agent keys",
        "Tutor replaces PartMode and issues manufacturing certifications",
        "Ignore licenses and copy the CAD engine into the public monorepo"
      ],
      "answerIndex": 1,
      "why": "Compose tools: Tutor teaches process; live CAD is external. AGPL + L0 keys stay out of public ship."
    },
    "scenarioHold": "HOLD export until a human reviews topology/connectivity Evidence.",
    "humanReadableSummary": "Sample 4/20: short pipe stub practice. Family: Trades bridge. Focus: PartMode literacy (offline). Trade: plumbing."
  },
  {
    "id": "pm-005",
    "index": 5,
    "title": "005 · weld-tab · PartMode",
    "family": "partmode-bom",
    "familyLabel": "BOM & assemblies",
    "partId": "weld-tab",
    "partDesc": "weld-on tab plate",
    "difficulty": "intermediate",
    "pipelineStage": "repair",
    "materialIntent": "nylon intent",
    "primaryAxis": "Y",
    "prompt": "PartMode literacy: design a weld-on tab plate for training only. Units mm. Envelope about 36×36×8 mm. Material intent: nylon intent. Primary axis Y. Practice: session authority, preview-before-commit, and inspect Evidence. Sample pm-005. Trade link: welding.",
    "features": [
      "closed sketch profile",
      "parametric extrude",
      "fillet on outer edge"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "36",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "8",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "3",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "1",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Inference",
    "tradeLink": "welding",
    "macLesson": "BOMWiki idea: name the assembly role of this stand-in part; do not invent real product serials.",
    "checkList": [
      "Confirm overall envelope ≈ 36×36×8 mm against a drawing or inspect readout (Evidence).",
      "Feature present: closed sketch profile.",
      "Feature present: parametric extrude.",
      "If an agent proposes a change: require preview diagnostics before any commit metaphor.",
      "Label spoken sizes as Evidence, Inference, or Assumption.",
      "When checks pass, discuss STEP export as a deliverable — still educational only."
    ],
    "quiz": {
      "prompt": "[pm-005] An agent wants to change the weld-tab model. What is the correct PartMode-style order?",
      "choices": [
        "Preview the typed operation, review diagnostics and revision, then commit only with the matching preview id",
        "Commit immediately so the human does not have to look",
        "Export STEP first, then invent geometry in a chat without a session",
        "Disable all checks and let the agent run until the mesh looks fine"
      ],
      "answerIndex": 0,
      "why": "PartMode literacy: mutations are preview-bound transactions. Commit needs matching preview + revision evidence."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 5/20: weld-on tab plate. Family: BOM & assemblies. Focus: PartMode literacy (offline). Trade: welding."
  },
  {
    "id": "pm-006",
    "index": 6,
    "title": "006 · enclosure-lid · PartMode",
    "family": "partmode-session",
    "familyLabel": "Session & authority",
    "partId": "enclosure-lid",
    "partDesc": "sheet-metal style lid",
    "difficulty": "advanced",
    "pipelineStage": "print",
    "materialIntent": "PETG",
    "primaryAxis": "Z",
    "prompt": "PartMode literacy: design a sheet-metal style lid for training only. Units mm. Envelope about 20×20×10 mm. Material intent: PETG. Primary axis Z. Practice: session authority, preview-before-commit, and inspect Evidence. Sample pm-006. Trade link: electrical.",
    "features": [
      "through-hole",
      "parameter table",
      "mirror pattern"
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
        "value": "4",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "2",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Assumption",
    "tradeLink": "electrical",
    "macLesson": "PartMode: agents join via scoped session; human approves in a visible studio. MAC parallel: human gate on FATAL QA.",
    "checkList": [
      "Confirm overall envelope ≈ 20×20×10 mm against a drawing or inspect readout (Evidence).",
      "Feature present: through-hole.",
      "Feature present: parameter table.",
      "If an agent proposes a change: require preview diagnostics before any commit metaphor.",
      "Label spoken sizes as Evidence, Inference, or Assumption.",
      "When checks pass, discuss STEP export as a deliverable — still educational only."
    ],
    "quiz": {
      "prompt": "[pm-006] Who should approve an agent CAD session on a training model?",
      "choices": [
        "Anyone with the public website open — no human needed",
        "A human with authority for that studio/session, who can also pause or revoke",
        "The agent itself after three successful mesh exports",
        "A random chat user without a scoped key or session"
      ],
      "answerIndex": 1,
      "why": "Human final call: browser-approved sessions keep authority visible; keys alone do not invent consent."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 6/20: sheet-metal style lid. Family: Session & authority. Focus: PartMode literacy (offline). Trade: electrical."
  },
  {
    "id": "pm-007",
    "index": 7,
    "title": "007 · idler-pulley · PartMode",
    "family": "partmode-preview-commit",
    "familyLabel": "Preview → commit",
    "partId": "idler-pulley",
    "partDesc": "idler pulley blank",
    "difficulty": "beginner",
    "pipelineStage": "brief",
    "materialIntent": "PLA",
    "primaryAxis": "X",
    "prompt": "PartMode literacy: design a idler pulley blank for training only. Units mm. Envelope about 24×24×12 mm. Material intent: PLA. Primary axis X. Practice: session authority, preview-before-commit, and inspect Evidence. Sample pm-007. Trade link: automotive.",
    "features": [
      "revolve candidate",
      "section view intent",
      "mate plane label"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "24",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "12",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "2",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "3",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Evidence",
    "tradeLink": "automotive",
    "macLesson": "PartMode: cad_preview then cad_commit with matching revision. MAC parallel: dual QA before export.",
    "checkList": [
      "Confirm overall envelope ≈ 24×24×12 mm against a drawing or inspect readout (Evidence).",
      "Feature present: revolve candidate.",
      "Feature present: section view intent.",
      "If an agent proposes a change: require preview diagnostics before any commit metaphor.",
      "Label spoken sizes as Evidence, Inference, or Assumption.",
      "When checks pass, discuss STEP export as a deliverable — still educational only."
    ],
    "quiz": {
      "prompt": "[pm-007] Which is the strongest Evidence that a training part is watertight enough to discuss export?",
      "choices": [
        "A screenshot that looks solid from one angle",
        "A claim in chat that the model is fine",
        "Inspect results: topology health, mass properties, and a settled revision/hash after checks",
        "Doubling the triangle count so errors hide"
      ],
      "answerIndex": 2,
      "why": "Evidence is re-checkable: inspect, mass, revision. Screenshots and vibes are weaker."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 7/20: idler pulley blank. Family: Preview → commit. Focus: PartMode literacy (offline). Trade: automotive."
  },
  {
    "id": "pm-008",
    "index": 8,
    "title": "008 · fixture-pin · PartMode",
    "family": "partmode-inspect",
    "familyLabel": "Inspect & evidence",
    "partId": "fixture-pin",
    "partDesc": "fixture locating pin",
    "difficulty": "intermediate",
    "pipelineStage": "architect",
    "materialIntent": "aluminum intent",
    "primaryAxis": "Y",
    "prompt": "PartMode literacy: design a fixture locating pin for training only. Units mm. Envelope about 28×28×14 mm. Material intent: aluminum intent. Primary axis Y. Practice: session authority, preview-before-commit, and inspect Evidence. Sample pm-008. Trade link: cnc.",
    "features": [
      "shell thickness target",
      "draft angle note",
      "configuration variant"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "28",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "14",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "3",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "4",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Inference",
    "tradeLink": "cnc",
    "macLesson": "PartMode: inspect mass/topology as Evidence. MAC parallel: DIMENSION vs TOPOLOGY routing.",
    "checkList": [
      "Confirm overall envelope ≈ 28×28×14 mm against a drawing or inspect readout (Evidence).",
      "Feature present: shell thickness target.",
      "Feature present: draft angle note.",
      "If an agent proposes a change: require preview diagnostics before any commit metaphor.",
      "Label spoken sizes as Evidence, Inference, or Assumption.",
      "FATAL-style issue: stop auto-loops; human final call before export talk."
    ],
    "quiz": {
      "prompt": "[pm-008] How should Grok Tutor relate to live PartMode?",
      "choices": [
        "This lab embeds the full AGPL kernel and auto-commits with a shared public agent key",
        "Offline literacy samples here; live CAD stays on partmode.com or a private self-host — no public agent keys",
        "Tutor replaces PartMode and issues manufacturing certifications",
        "Ignore licenses and copy the CAD engine into the public monorepo"
      ],
      "answerIndex": 1,
      "why": "Compose tools: Tutor teaches process; live CAD is external. AGPL + L0 keys stay out of public ship."
    },
    "scenarioHold": "HOLD export until a human reviews topology/connectivity Evidence.",
    "humanReadableSummary": "Sample 8/20: fixture locating pin. Family: Inspect & evidence. Focus: PartMode literacy (offline). Trade: cnc."
  },
  {
    "id": "pm-009",
    "index": 9,
    "title": "009 · hinge-leaf · PartMode",
    "family": "partmode-trades",
    "familyLabel": "Trades bridge",
    "partId": "hinge-leaf",
    "partDesc": "simple hinge leaf",
    "difficulty": "advanced",
    "pipelineStage": "coder",
    "materialIntent": "mild steel intent",
    "primaryAxis": "Z",
    "prompt": "PartMode literacy: design a simple hinge leaf for training only. Units mm. Envelope about 32×32×8 mm. Material intent: mild steel intent. Primary axis Z. Practice: session authority, preview-before-commit, and inspect Evidence. Sample pm-009. Trade link: construction.",
    "features": [
      "closed sketch profile",
      "parametric extrude",
      "fillet on outer edge"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "32",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "8",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "4",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "1",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Assumption",
    "tradeLink": "construction",
    "macLesson": "Trades bridge: same claim hygiene whether CNC, weld, or install — educational geometry only.",
    "checkList": [
      "Confirm overall envelope ≈ 32×32×8 mm against a drawing or inspect readout (Evidence).",
      "Feature present: closed sketch profile.",
      "Feature present: parametric extrude.",
      "If an agent proposes a change: require preview diagnostics before any commit metaphor.",
      "Label spoken sizes as Evidence, Inference, or Assumption.",
      "When checks pass, discuss STEP export as a deliverable — still educational only."
    ],
    "quiz": {
      "prompt": "[pm-009] An agent wants to change the hinge-leaf model. What is the correct PartMode-style order?",
      "choices": [
        "Preview the typed operation, review diagnostics and revision, then commit only with the matching preview id",
        "Commit immediately so the human does not have to look",
        "Export STEP first, then invent geometry in a chat without a session",
        "Disable all checks and let the agent run until the mesh looks fine"
      ],
      "answerIndex": 0,
      "why": "PartMode literacy: mutations are preview-bound transactions. Commit needs matching preview + revision evidence."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 9/20: simple hinge leaf. Family: Trades bridge. Focus: PartMode literacy (offline). Trade: construction."
  },
  {
    "id": "pm-010",
    "index": 10,
    "title": "010 · manifold-block · PartMode",
    "family": "partmode-bom",
    "familyLabel": "BOM & assemblies",
    "partId": "manifold-block",
    "partDesc": "two-port manifold block",
    "difficulty": "beginner",
    "pipelineStage": "qa",
    "materialIntent": "nylon intent",
    "primaryAxis": "X",
    "prompt": "PartMode literacy: design a two-port manifold block for training only. Units mm. Envelope about 36×36×10 mm. Material intent: nylon intent. Primary axis X. Practice: session authority, preview-before-commit, and inspect Evidence. Sample pm-010. Trade link: quality.",
    "features": [
      "through-hole",
      "parameter table",
      "mirror pattern"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "36",
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
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Evidence",
    "tradeLink": "quality",
    "macLesson": "BOMWiki idea: name the assembly role of this stand-in part; do not invent real product serials.",
    "checkList": [
      "Confirm overall envelope ≈ 36×36×10 mm against a drawing or inspect readout (Evidence).",
      "Feature present: through-hole.",
      "Feature present: parameter table.",
      "If an agent proposes a change: require preview diagnostics before any commit metaphor.",
      "Label spoken sizes as Evidence, Inference, or Assumption.",
      "When checks pass, discuss STEP export as a deliverable — still educational only."
    ],
    "quiz": {
      "prompt": "[pm-010] Who should approve an agent CAD session on a training model?",
      "choices": [
        "Anyone with the public website open — no human needed",
        "A human with authority for that studio/session, who can also pause or revoke",
        "The agent itself after three successful mesh exports",
        "A random chat user without a scoped key or session"
      ],
      "answerIndex": 1,
      "why": "Human final call: browser-approved sessions keep authority visible; keys alone do not invent consent."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 10/20: two-port manifold block. Family: BOM & assemblies. Focus: PartMode literacy (offline). Trade: quality."
  },
  {
    "id": "pm-011",
    "index": 11,
    "title": "011 · spacer-stack · PartMode",
    "family": "partmode-session",
    "familyLabel": "Session & authority",
    "partId": "spacer-stack",
    "partDesc": "stacked spacer ring",
    "difficulty": "intermediate",
    "pipelineStage": "repair",
    "materialIntent": "PETG",
    "primaryAxis": "Y",
    "prompt": "PartMode literacy: design a stacked spacer ring for training only. Units mm. Envelope about 20×20×12 mm. Material intent: PETG. Primary axis Y. Practice: session authority, preview-before-commit, and inspect Evidence. Sample pm-011. Trade link: design.",
    "features": [
      "revolve candidate",
      "section view intent",
      "mate plane label"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "20",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "12",
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
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Inference",
    "tradeLink": "design",
    "macLesson": "PartMode: agents join via scoped session; human approves in a visible studio. MAC parallel: human gate on FATAL QA.",
    "checkList": [
      "Confirm overall envelope ≈ 20×20×12 mm against a drawing or inspect readout (Evidence).",
      "Feature present: revolve candidate.",
      "Feature present: section view intent.",
      "If an agent proposes a change: require preview diagnostics before any commit metaphor.",
      "Label spoken sizes as Evidence, Inference, or Assumption.",
      "When checks pass, discuss STEP export as a deliverable — still educational only."
    ],
    "quiz": {
      "prompt": "[pm-011] Which is the strongest Evidence that a training part is watertight enough to discuss export?",
      "choices": [
        "A screenshot that looks solid from one angle",
        "A claim in chat that the model is fine",
        "Inspect results: topology health, mass properties, and a settled revision/hash after checks",
        "Doubling the triangle count so errors hide"
      ],
      "answerIndex": 2,
      "why": "Evidence is re-checkable: inspect, mass, revision. Screenshots and vibes are weaker."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 11/20: stacked spacer ring. Family: Session & authority. Focus: PartMode literacy (offline). Trade: design."
  },
  {
    "id": "pm-012",
    "index": 12,
    "title": "012 · cable-clamp · PartMode",
    "family": "partmode-preview-commit",
    "familyLabel": "Preview → commit",
    "partId": "cable-clamp",
    "partDesc": "cable clamp body",
    "difficulty": "advanced",
    "pipelineStage": "print",
    "materialIntent": "PLA",
    "primaryAxis": "Z",
    "prompt": "PartMode literacy: design a cable clamp body for training only. Units mm. Envelope about 24×24×14 mm. Material intent: PLA. Primary axis Z. Practice: session authority, preview-before-commit, and inspect Evidence. Sample pm-012. Trade link: electrical.",
    "features": [
      "shell thickness target",
      "draft angle note",
      "configuration variant"
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
        "value": "4",
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
    "macLesson": "PartMode: cad_preview then cad_commit with matching revision. MAC parallel: dual QA before export.",
    "checkList": [
      "Confirm overall envelope ≈ 24×24×14 mm against a drawing or inspect readout (Evidence).",
      "Feature present: shell thickness target.",
      "Feature present: draft angle note.",
      "If an agent proposes a change: require preview diagnostics before any commit metaphor.",
      "Label spoken sizes as Evidence, Inference, or Assumption.",
      "FATAL-style issue: stop auto-loops; human final call before export talk."
    ],
    "quiz": {
      "prompt": "[pm-012] How should Grok Tutor relate to live PartMode?",
      "choices": [
        "This lab embeds the full AGPL kernel and auto-commits with a shared public agent key",
        "Offline literacy samples here; live CAD stays on partmode.com or a private self-host — no public agent keys",
        "Tutor replaces PartMode and issues manufacturing certifications",
        "Ignore licenses and copy the CAD engine into the public monorepo"
      ],
      "answerIndex": 1,
      "why": "Compose tools: Tutor teaches process; live CAD is external. AGPL + L0 keys stay out of public ship."
    },
    "scenarioHold": "HOLD export until a human reviews topology/connectivity Evidence.",
    "humanReadableSummary": "Sample 12/20: cable clamp body. Family: Preview → commit. Focus: PartMode literacy (offline). Trade: electrical."
  },
  {
    "id": "pm-013",
    "index": 13,
    "title": "013 · bearing-cap · PartMode",
    "family": "partmode-inspect",
    "familyLabel": "Inspect & evidence",
    "partId": "bearing-cap",
    "partDesc": "bearing cap cover",
    "difficulty": "beginner",
    "pipelineStage": "brief",
    "materialIntent": "aluminum intent",
    "primaryAxis": "X",
    "prompt": "PartMode literacy: design a bearing cap cover for training only. Units mm. Envelope about 28×28×8 mm. Material intent: aluminum intent. Primary axis X. Practice: session authority, preview-before-commit, and inspect Evidence. Sample pm-013. Trade link: automotive.",
    "features": [
      "closed sketch profile",
      "parametric extrude",
      "fillet on outer edge"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "28",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "8",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "2",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "1",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Evidence",
    "tradeLink": "automotive",
    "macLesson": "PartMode: inspect mass/topology as Evidence. MAC parallel: DIMENSION vs TOPOLOGY routing.",
    "checkList": [
      "Confirm overall envelope ≈ 28×28×8 mm against a drawing or inspect readout (Evidence).",
      "Feature present: closed sketch profile.",
      "Feature present: parametric extrude.",
      "If an agent proposes a change: require preview diagnostics before any commit metaphor.",
      "Label spoken sizes as Evidence, Inference, or Assumption.",
      "When checks pass, discuss STEP export as a deliverable — still educational only."
    ],
    "quiz": {
      "prompt": "[pm-013] An agent wants to change the bearing-cap model. What is the correct PartMode-style order?",
      "choices": [
        "Preview the typed operation, review diagnostics and revision, then commit only with the matching preview id",
        "Commit immediately so the human does not have to look",
        "Export STEP first, then invent geometry in a chat without a session",
        "Disable all checks and let the agent run until the mesh looks fine"
      ],
      "answerIndex": 0,
      "why": "PartMode literacy: mutations are preview-bound transactions. Commit needs matching preview + revision evidence."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 13/20: bearing cap cover. Family: Inspect & evidence. Focus: PartMode literacy (offline). Trade: automotive."
  },
  {
    "id": "pm-014",
    "index": 14,
    "title": "014 · gusset-plate · PartMode",
    "family": "partmode-trades",
    "familyLabel": "Trades bridge",
    "partId": "gusset-plate",
    "partDesc": "triangular gusset",
    "difficulty": "intermediate",
    "pipelineStage": "architect",
    "materialIntent": "mild steel intent",
    "primaryAxis": "Y",
    "prompt": "PartMode literacy: design a triangular gusset for training only. Units mm. Envelope about 32×32×10 mm. Material intent: mild steel intent. Primary axis Y. Practice: session authority, preview-before-commit, and inspect Evidence. Sample pm-014. Trade link: welding.",
    "features": [
      "through-hole",
      "parameter table",
      "mirror pattern"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "32",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "10",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "3",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "2",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Inference",
    "tradeLink": "welding",
    "macLesson": "Trades bridge: same claim hygiene whether CNC, weld, or install — educational geometry only.",
    "checkList": [
      "Confirm overall envelope ≈ 32×32×10 mm against a drawing or inspect readout (Evidence).",
      "Feature present: through-hole.",
      "Feature present: parameter table.",
      "If an agent proposes a change: require preview diagnostics before any commit metaphor.",
      "Label spoken sizes as Evidence, Inference, or Assumption.",
      "When checks pass, discuss STEP export as a deliverable — still educational only."
    ],
    "quiz": {
      "prompt": "[pm-014] Who should approve an agent CAD session on a training model?",
      "choices": [
        "Anyone with the public website open — no human needed",
        "A human with authority for that studio/session, who can also pause or revoke",
        "The agent itself after three successful mesh exports",
        "A random chat user without a scoped key or session"
      ],
      "answerIndex": 1,
      "why": "Human final call: browser-approved sessions keep authority visible; keys alone do not invent consent."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 14/20: triangular gusset. Family: Trades bridge. Focus: PartMode literacy (offline). Trade: welding."
  },
  {
    "id": "pm-015",
    "index": 15,
    "title": "015 · mount-rail · PartMode",
    "family": "partmode-bom",
    "familyLabel": "BOM & assemblies",
    "partId": "mount-rail",
    "partDesc": "equipment mount rail",
    "difficulty": "advanced",
    "pipelineStage": "coder",
    "materialIntent": "nylon intent",
    "primaryAxis": "Z",
    "prompt": "PartMode literacy: design a equipment mount rail for training only. Units mm. Envelope about 36×36×12 mm. Material intent: nylon intent. Primary axis Z. Practice: session authority, preview-before-commit, and inspect Evidence. Sample pm-015. Trade link: construction.",
    "features": [
      "revolve candidate",
      "section view intent",
      "mate plane label"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "36",
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
        "value": "3",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Assumption",
    "tradeLink": "construction",
    "macLesson": "BOMWiki idea: name the assembly role of this stand-in part; do not invent real product serials.",
    "checkList": [
      "Confirm overall envelope ≈ 36×36×12 mm against a drawing or inspect readout (Evidence).",
      "Feature present: revolve candidate.",
      "Feature present: section view intent.",
      "If an agent proposes a change: require preview diagnostics before any commit metaphor.",
      "Label spoken sizes as Evidence, Inference, or Assumption.",
      "When checks pass, discuss STEP export as a deliverable — still educational only."
    ],
    "quiz": {
      "prompt": "[pm-015] Which is the strongest Evidence that a training part is watertight enough to discuss export?",
      "choices": [
        "A screenshot that looks solid from one angle",
        "A claim in chat that the model is fine",
        "Inspect results: topology health, mass properties, and a settled revision/hash after checks",
        "Doubling the triangle count so errors hide"
      ],
      "answerIndex": 2,
      "why": "Evidence is re-checkable: inspect, mass, revision. Screenshots and vibes are weaker."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 15/20: equipment mount rail. Family: BOM & assemblies. Focus: PartMode literacy (offline). Trade: construction."
  },
  {
    "id": "pm-016",
    "index": 16,
    "title": "016 · orifice-disk · PartMode",
    "family": "partmode-session",
    "familyLabel": "Session & authority",
    "partId": "orifice-disk",
    "partDesc": "orifice disk blank",
    "difficulty": "beginner",
    "pipelineStage": "qa",
    "materialIntent": "PETG",
    "primaryAxis": "X",
    "prompt": "PartMode literacy: design a orifice disk blank for training only. Units mm. Envelope about 20×20×14 mm. Material intent: PETG. Primary axis X. Practice: session authority, preview-before-commit, and inspect Evidence. Sample pm-016. Trade link: quality.",
    "features": [
      "shell thickness target",
      "draft angle note",
      "configuration variant"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "20",
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
        "value": "4",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Evidence",
    "tradeLink": "quality",
    "macLesson": "PartMode: agents join via scoped session; human approves in a visible studio. MAC parallel: human gate on FATAL QA.",
    "checkList": [
      "Confirm overall envelope ≈ 20×20×14 mm against a drawing or inspect readout (Evidence).",
      "Feature present: shell thickness target.",
      "Feature present: draft angle note.",
      "If an agent proposes a change: require preview diagnostics before any commit metaphor.",
      "Label spoken sizes as Evidence, Inference, or Assumption.",
      "FATAL-style issue: stop auto-loops; human final call before export talk."
    ],
    "quiz": {
      "prompt": "[pm-016] How should Grok Tutor relate to live PartMode?",
      "choices": [
        "This lab embeds the full AGPL kernel and auto-commits with a shared public agent key",
        "Offline literacy samples here; live CAD stays on partmode.com or a private self-host — no public agent keys",
        "Tutor replaces PartMode and issues manufacturing certifications",
        "Ignore licenses and copy the CAD engine into the public monorepo"
      ],
      "answerIndex": 1,
      "why": "Compose tools: Tutor teaches process; live CAD is external. AGPL + L0 keys stay out of public ship."
    },
    "scenarioHold": "HOLD export until a human reviews topology/connectivity Evidence.",
    "humanReadableSummary": "Sample 16/20: orifice disk blank. Family: Session & authority. Focus: PartMode literacy (offline). Trade: quality."
  },
  {
    "id": "pm-017",
    "index": 17,
    "title": "017 · knob-insert · PartMode",
    "family": "partmode-preview-commit",
    "familyLabel": "Preview → commit",
    "partId": "knob-insert",
    "partDesc": "press-fit knob insert",
    "difficulty": "intermediate",
    "pipelineStage": "repair",
    "materialIntent": "PLA",
    "primaryAxis": "Y",
    "prompt": "PartMode literacy: design a press-fit knob insert for training only. Units mm. Envelope about 24×24×8 mm. Material intent: PLA. Primary axis Y. Practice: session authority, preview-before-commit, and inspect Evidence. Sample pm-017. Trade link: design.",
    "features": [
      "closed sketch profile",
      "parametric extrude",
      "fillet on outer edge"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "24",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "8",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "3",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "1",
        "unit": "count"
      }
    ],
    "qaErrorType": "NONE",
    "integrityFocus": "Inference",
    "tradeLink": "design",
    "macLesson": "PartMode: cad_preview then cad_commit with matching revision. MAC parallel: dual QA before export.",
    "checkList": [
      "Confirm overall envelope ≈ 24×24×8 mm against a drawing or inspect readout (Evidence).",
      "Feature present: closed sketch profile.",
      "Feature present: parametric extrude.",
      "If an agent proposes a change: require preview diagnostics before any commit metaphor.",
      "Label spoken sizes as Evidence, Inference, or Assumption.",
      "When checks pass, discuss STEP export as a deliverable — still educational only."
    ],
    "quiz": {
      "prompt": "[pm-017] An agent wants to change the knob-insert model. What is the correct PartMode-style order?",
      "choices": [
        "Preview the typed operation, review diagnostics and revision, then commit only with the matching preview id",
        "Commit immediately so the human does not have to look",
        "Export STEP first, then invent geometry in a chat without a session",
        "Disable all checks and let the agent run until the mesh looks fine"
      ],
      "answerIndex": 0,
      "why": "PartMode literacy: mutations are preview-bound transactions. Commit needs matching preview + revision evidence."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 17/20: press-fit knob insert. Family: Preview → commit. Focus: PartMode literacy (offline). Trade: design."
  },
  {
    "id": "pm-018",
    "index": 18,
    "title": "018 · chain-guard · PartMode",
    "family": "partmode-inspect",
    "familyLabel": "Inspect & evidence",
    "partId": "chain-guard",
    "partDesc": "simple chain guard half",
    "difficulty": "advanced",
    "pipelineStage": "print",
    "materialIntent": "aluminum intent",
    "primaryAxis": "Z",
    "prompt": "PartMode literacy: design a simple chain guard half for training only. Units mm. Envelope about 28×28×10 mm. Material intent: aluminum intent. Primary axis Z. Practice: session authority, preview-before-commit, and inspect Evidence. Sample pm-018. Trade link: automotive.",
    "features": [
      "through-hole",
      "parameter table",
      "mirror pattern"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "28",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "10",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "4",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "2",
        "unit": "count"
      }
    ],
    "qaErrorType": "DIMENSION",
    "integrityFocus": "Assumption",
    "tradeLink": "automotive",
    "macLesson": "PartMode: inspect mass/topology as Evidence. MAC parallel: DIMENSION vs TOPOLOGY routing.",
    "checkList": [
      "Confirm overall envelope ≈ 28×28×10 mm against a drawing or inspect readout (Evidence).",
      "Feature present: through-hole.",
      "Feature present: parameter table.",
      "If an agent proposes a change: require preview diagnostics before any commit metaphor.",
      "Label spoken sizes as Evidence, Inference, or Assumption.",
      "When checks pass, discuss STEP export as a deliverable — still educational only."
    ],
    "quiz": {
      "prompt": "[pm-018] Who should approve an agent CAD session on a training model?",
      "choices": [
        "Anyone with the public website open — no human needed",
        "A human with authority for that studio/session, who can also pause or revoke",
        "The agent itself after three successful mesh exports",
        "A random chat user without a scoped key or session"
      ],
      "answerIndex": 1,
      "why": "Human final call: browser-approved sessions keep authority visible; keys alone do not invent consent."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 18/20: simple chain guard half. Family: Inspect & evidence. Focus: PartMode literacy (offline). Trade: automotive."
  },
  {
    "id": "pm-019",
    "index": 19,
    "title": "019 · tool-rest · PartMode",
    "family": "partmode-trades",
    "familyLabel": "Trades bridge",
    "partId": "tool-rest",
    "partDesc": "bench tool rest",
    "difficulty": "beginner",
    "pipelineStage": "brief",
    "materialIntent": "mild steel intent",
    "primaryAxis": "X",
    "prompt": "PartMode literacy: design a bench tool rest for training only. Units mm. Envelope about 32×32×12 mm. Material intent: mild steel intent. Primary axis X. Practice: session authority, preview-before-commit, and inspect Evidence. Sample pm-019. Trade link: cnc.",
    "features": [
      "revolve candidate",
      "section view intent",
      "mate plane label"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "32",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "12",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "2",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "3",
        "unit": "count"
      }
    ],
    "qaErrorType": "TOPOLOGY",
    "integrityFocus": "Evidence",
    "tradeLink": "cnc",
    "macLesson": "Trades bridge: same claim hygiene whether CNC, weld, or install — educational geometry only.",
    "checkList": [
      "Confirm overall envelope ≈ 32×32×12 mm against a drawing or inspect readout (Evidence).",
      "Feature present: revolve candidate.",
      "Feature present: section view intent.",
      "If an agent proposes a change: require preview diagnostics before any commit metaphor.",
      "Label spoken sizes as Evidence, Inference, or Assumption.",
      "When checks pass, discuss STEP export as a deliverable — still educational only."
    ],
    "quiz": {
      "prompt": "[pm-019] Which is the strongest Evidence that a training part is watertight enough to discuss export?",
      "choices": [
        "A screenshot that looks solid from one angle",
        "A claim in chat that the model is fine",
        "Inspect results: topology health, mass properties, and a settled revision/hash after checks",
        "Doubling the triangle count so errors hide"
      ],
      "answerIndex": 2,
      "why": "Evidence is re-checkable: inspect, mass, revision. Screenshots and vibes are weaker."
    },
    "scenarioHold": null,
    "humanReadableSummary": "Sample 19/20: bench tool rest. Family: Trades bridge. Focus: PartMode literacy (offline). Trade: cnc."
  },
  {
    "id": "pm-020",
    "index": 20,
    "title": "020 · cover-plate · PartMode",
    "family": "partmode-bom",
    "familyLabel": "BOM & assemblies",
    "partId": "cover-plate",
    "partDesc": "rectangular cover plate",
    "difficulty": "intermediate",
    "pipelineStage": "architect",
    "materialIntent": "nylon intent",
    "primaryAxis": "Y",
    "prompt": "PartMode literacy: design a rectangular cover plate for training only. Units mm. Envelope about 36×36×14 mm. Material intent: nylon intent. Primary axis Y. Practice: session authority, preview-before-commit, and inspect Evidence. Sample pm-020. Trade link: construction.",
    "features": [
      "shell thickness target",
      "draft angle note",
      "configuration variant"
    ],
    "dimensions": [
      {
        "label": "envelope_xy",
        "value": "36",
        "unit": "mm"
      },
      {
        "label": "height_z",
        "value": "14",
        "unit": "mm"
      },
      {
        "label": "critical_feature",
        "value": "3",
        "unit": "mm"
      },
      {
        "label": "pattern_count",
        "value": "4",
        "unit": "count"
      }
    ],
    "qaErrorType": "FATAL",
    "integrityFocus": "Inference",
    "tradeLink": "construction",
    "macLesson": "BOMWiki idea: name the assembly role of this stand-in part; do not invent real product serials.",
    "checkList": [
      "Confirm overall envelope ≈ 36×36×14 mm against a drawing or inspect readout (Evidence).",
      "Feature present: shell thickness target.",
      "Feature present: draft angle note.",
      "If an agent proposes a change: require preview diagnostics before any commit metaphor.",
      "Label spoken sizes as Evidence, Inference, or Assumption.",
      "FATAL-style issue: stop auto-loops; human final call before export talk."
    ],
    "quiz": {
      "prompt": "[pm-020] How should Grok Tutor relate to live PartMode?",
      "choices": [
        "This lab embeds the full AGPL kernel and auto-commits with a shared public agent key",
        "Offline literacy samples here; live CAD stays on partmode.com or a private self-host — no public agent keys",
        "Tutor replaces PartMode and issues manufacturing certifications",
        "Ignore licenses and copy the CAD engine into the public monorepo"
      ],
      "answerIndex": 1,
      "why": "Compose tools: Tutor teaches process; live CAD is external. AGPL + L0 keys stay out of public ship."
    },
    "scenarioHold": "HOLD export until a human reviews topology/connectivity Evidence.",
    "humanReadableSummary": "Sample 20/20: rectangular cover plate. Family: BOM & assemblies. Focus: PartMode literacy (offline). Trade: construction."
  }
];

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
    errors.push(`count ${PARTMODE_SAMPLES_20.length} !== 20`);
  }
  const ids = new Set<string>();
  const titles = new Set<string>();
  const prompts = new Set<string>();
  const quizzes = new Set<string>();
  const banned =
    /municipality|city of |county of |parcel\s*#|street address|ssn|social security|operator private|skill brand|PARTMODE_AGENT_KEY/i;
  for (const s of PARTMODE_SAMPLES_20) {
    if (!/^pm-\d{3}$/.test(s.id)) errors.push(`bad id ${s.id}`);
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
    if (!s.features.length) errors.push(`no features ${s.id}`);
    if (!s.checkList.length) errors.push(`no checklist ${s.id}`);
    if (!s.macLesson.trim()) errors.push(`empty lesson ${s.id}`);
    if (banned.test(s.prompt) || banned.test(s.quiz.prompt)) {
      errors.push(`banned language ${s.id}`);
    }
  }
  return { ok: errors.length === 0, errors };
}

/** Combined Plan Lab catalog: MAC 100 + PartMode 20 */
export function mergeCadCatalog(mac: CadSample[]): CadSample[] {
  return [...mac, ...PARTMODE_SAMPLES_20];
}
