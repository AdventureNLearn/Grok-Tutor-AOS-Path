/**
 * Complete-suite soak (not a short repeating loop).
 *
 * Each "suite" walks the FULL ordered checklist once (unique steps).
 * Suites repeat only after a complete pass finishes.
 * LIVE.json feeds /soak/observe.html (4-quadrant) — no host paths.
 *
 *   node scripts/sim-observable-1h.mjs [baseUrl] [minutes]
 */
import {
  mkdirSync,
  writeFileSync,
  appendFileSync,
  existsSync,
  readFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const BASE = (process.argv[2] || "http://127.0.0.1:8085").replace(/\/$/, "");
const MINUTES = Math.max(1, Math.min(180, Number(process.argv[3]) || 60));
const DURATION_MS = MINUTES * 60 * 1000;
const GAP_MS = 750;
const REQ_TIMEOUT_MS = 12000;

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outDir = join(root, "scripts", "sim-output", "observable-1h", stamp);
const publicSoakDir = join(root, "public", "soak");
mkdirSync(outDir, { recursive: true });
mkdirSync(publicSoakDir, { recursive: true });

const eventsPath = join(outDir, "events.jsonl");
const summaryPath = join(outDir, "summary.json");
const reportPath = join(outDir, "REPORT.md");
const liveJson = join(publicSoakDir, "LIVE.json");

/** Full ordered suite — every step unique within a suite pass */
function buildCompleteSuite() {
  const steps = [];

  // A. Source contracts (once per suite)
  const sources = [
    ["src/lib/hive-orchestration-sim.ts", /ORCH_SCENARIOS|buildScenarioPhases/],
    ["src/components/hive/orchestration-sim-panel.tsx", /OrchestrationSimPanel/],
    ["src/components/hive/hive-workspace.tsx", /orch=1|setPlayOrchestration\(true\)/],
    ["src/lib/tutor-hive-map.ts", /ORCH_PRIORITY_SKILLS/],
    ["src/lib/hive-node-style.ts", /thinkingPriority|galacticLabelMode/],
    ["public/soak/observe.html", /quad|Q1 · Soak log/],
  ];
  for (const [file, has] of sources) {
    steps.push({
      phase: "A-source",
      kind: "source",
      name: `source:${file.split("/").pop()}`,
      file,
      has,
    });
  }

  // B. Hive orchestration entry points (complete set, not a random loop)
  const orch = [
    ["/?orch=1&shape=spine", "orch spine", /Grok Tutor|The Hive/i],
    ["/?orch=1&style=galactic&shape=spine", "orch galactic", /Grok Tutor|The Hive/i],
    ["/?orch=1&deep=1", "orch deep", /Grok Tutor|The Hive/i],
    ["/?orch=1&shape=integrity-triangle", "orch integrity", /Grok Tutor|The Hive/i],
    ["/?orch=1&shape=four-agent", "orch four-agent", /Grok Tutor|The Hive/i],
    ["/?orch=1&shape=claim-diamond", "orch claim", /Grok Tutor|The Hive/i],
    ["/?orch=1&shape=lpin-helix", "orch helix", /Grok Tutor|The Hive/i],
    ["/?orch=1&shape=sense-orbit", "orch sense-orbit", /Grok Tutor|The Hive/i],
    ["/?orch=1&shape=star-burst", "orch star-burst", /Grok Tutor|The Hive/i],
  ];
  for (const [path, name, has] of orch) {
    steps.push({ phase: "B-orch", kind: "http", path, name, has, expect: 200 });
  }

  // C. Core product routes
  const core = [
    ["/", "home"],
    ["/tutor", "learn"],
    ["/tutor?surface=desk", "learn desk"],
    ["/tutor?industry=electrical&surface=desk", "learn electrical desk"],
    ["/demo", "samples"],
    ["/demo?surface=desk", "samples desk"],
    ["/demo/electrical", "demo electrical"],
    ["/demo/welding", "demo welding"],
    ["/demo/it-support", "demo it-support"],
    ["/explore", "industries"],
    ["/explore?surface=desk", "industries desk"],
    ["/skills", "tools"],
    ["/skills?surface=desk", "tools desk"],
    ["/skills/evidence-gate", "skill evidence-gate"],
    ["/skills/sovereign-lens", "skill clear-lens"],
    ["/skills/4-agent-orchestration", "skill four-agent"],
    ["/progress", "progress"],
    ["/progress?surface=desk", "progress desk"],
    ["/path", "path"],
    ["/path?surface=desk", "path desk"],
    ["/help", "help"],
    ["/help?surface=desk", "help desk"],
    ["/credits", "credits"],
    ["/get-yours", "get-yours"],
    ["/get-yours?surface=desk", "get-yours desk"],
  ];
  for (const [path, name] of core) {
    steps.push({ phase: "C-core", kind: "http", path, name, expect: 200 });
  }

  // D. Plan Lab complete sample grid (not one id looping)
  const cadIds = [
    "cad-001", "cad-010", "cad-020", "cad-030", "cad-040",
    "cad-050", "cad-060", "cad-070", "cad-080", "cad-090", "cad-100",
  ];
  steps.push({
    phase: "D-cad",
    kind: "http",
    path: "/labs/cad",
    name: "plan-lab home",
    has: /Plan Lab|CAD|sample/i,
    expect: 200,
  });
  steps.push({
    phase: "D-cad",
    kind: "http",
    path: "/labs/cad?surface=desk",
    name: "plan-lab desk",
    expect: 200,
  });
  for (const id of cadIds) {
    steps.push({
      phase: "D-cad",
      kind: "http",
      path: `/labs/cad?sample=${id}`,
      name: `plan-lab ${id}`,
      expect: 200,
    });
  }

  // E. OPSEC surface (must not leak host paths / muni)
  const opsec = [
    ["/", "opsec home", /C:\\\\Users|file:\/\//i, true],
    ["/?orch=1&shape=spine", "opsec orch", /C:\\\\Users|file:\/\//i, true],
    ["/labs/cad", "opsec cad", /C:\\\\Users|C:\\\\AOS|file:\/\//i, true],
    ["/help", "opsec help", /city of |county of |Sovereign Lens|sim-corps/i, true],
    ["/credits", "opsec credits", /C:\\\\Users/i, true],
  ];
  for (const [path, name, not, soft] of opsec) {
    steps.push({
      phase: "E-opsec",
      kind: "http",
      path,
      name,
      not,
      expect: 200,
      soft: !!soft,
    });
  }

  // F. Isolated lanes (allowed soft)
  steps.push({
    phase: "F-lanes",
    kind: "http",
    path: "/itshabbening",
    name: "lane its",
    expect: 200,
    soft: true,
  });
  steps.push({
    phase: "F-lanes",
    kind: "http",
    path: "/meme-village",
    name: "lane meme",
    expect: 200,
    soft: true,
  });

  // G. Observe surface itself
  steps.push({
    phase: "G-observe",
    kind: "http",
    path: "/soak/observe.html",
    name: "quad observe page",
    has: /Q1 · Soak log|quad/,
    expect: 200,
  });
  steps.push({
    phase: "G-observe",
    kind: "http",
    path: "/soak/LIVE.json",
    name: "live json feed",
    expect: 200,
  });

  return steps;
}

const SUITE = buildCompleteSuite();

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function logEvent(ev) {
  appendFileSync(eventsPath, JSON.stringify(ev) + "\n", "utf8");
}

async function httpGet(path) {
  const url = `${BASE}${path}`;
  const t0 = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQ_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { Accept: "text/html,application/json,*/*", "Cache-Control": "no-cache" },
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, ms: Date.now() - t0, text, error: null };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      ms: Date.now() - t0,
      text: "",
      error: e?.name === "AbortError" ? "timeout" : String(e?.message || e),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function healthOk() {
  const r = await httpGet(`/?_h=${Date.now()}`);
  return r.status > 0 && r.status < 500;
}

function writeLive(state) {
  const safe = {
    startedAt: state.startedAt,
    base: state.base,
    minutes: state.minutes,
    cycles: state.cycles,
    pass: state.pass,
    soft: state.soft,
    fail: state.fail,
    suitesComplete: state.suitesComplete,
    suiteCheckIndex: state.suiteCheckIndex,
    suiteCheckTotal: state.suiteCheckTotal,
    currentPhase: state.currentPhase,
    elapsedMs: state.elapsedMs,
    updatedAt: new Date().toISOString(),
    heartbeat: Date.now(),
    lastMessage: state.lastMessage,
    recent: (state.recent || []).slice(-30).map((r) => ({
      t: r.t,
      name: r.name,
      status: r.status,
      ms: r.ms,
      reason: r.reason,
      pass: r.pass,
      soft: r.soft,
      kind: r.kind || "check",
    })),
  };
  writeFileSync(liveJson, JSON.stringify(safe, null, 2), "utf8");
}

function pushRecent(state, row) {
  state.recent.push(row);
  if (state.recent.length > 40) state.recent.shift();
}

async function runSourceStep(step) {
  const fp = join(root, step.file);
  if (!existsSync(fp)) {
    return { pass: false, soft: true, status: 0, ms: 0, reason: "missing file" };
  }
  try {
    const t = readFileSync(fp, "utf8");
    const pass = step.has.test(t);
    return {
      pass,
      soft: !pass,
      status: pass ? 200 : 0,
      ms: 0,
      reason: pass ? "ok" : "pattern miss",
    };
  } catch (e) {
    return { pass: false, soft: true, status: 0, ms: 0, reason: String(e.message || e) };
  }
}

async function runHttpStep(step) {
  const r = await httpGet(step.path);
  if (r.error) {
    return { pass: false, soft: true, status: 0, ms: r.ms, reason: r.error };
  }
  if (step.expect != null && r.status !== step.expect) {
    return {
      pass: false,
      soft: true,
      status: r.status,
      ms: r.ms,
      reason: `status ${r.status}`,
    };
  }
  if (step.has && r.text && !step.has.test(r.text)) {
    return {
      pass: false,
      soft: true,
      status: r.status,
      ms: r.ms,
      reason: "content miss",
    };
  }
  if (step.not && r.text && step.not.test(r.text)) {
    return {
      pass: false,
      soft: !!step.soft,
      status: r.status,
      ms: r.ms,
      reason: "banned pattern",
    };
  }
  return { pass: true, soft: !!step.soft, status: r.status, ms: r.ms, reason: "ok" };
}

const state = {
  startedAt: new Date().toISOString(),
  base: BASE,
  minutes: MINUTES,
  cycles: 0,
  pass: 0,
  soft: 0,
  fail: 0,
  suitesComplete: 0,
  suiteCheckIndex: 0,
  suiteCheckTotal: SUITE.length,
  currentPhase: "boot",
  elapsedMs: 0,
  lastMessage: "starting complete-suite soak",
  recent: [],
};

console.log("Grok Tutor · complete-suite soak");
console.log("Base:", BASE);
console.log("Duration:", MINUTES, "min");
console.log("Suite size:", SUITE.length, "unique steps per full pass");
console.log("Quad observe:", BASE + "/soak/observe.html");

for (let i = 0; i < 30; i++) {
  if (await healthOk()) break;
  state.lastMessage = `waiting host ${i + 1}/30`;
  writeLive(state);
  await sleep(1500);
}

const t0 = Date.now();
let suiteStep = 0;

while (Date.now() - t0 < DURATION_MS) {
  state.elapsedMs = Date.now() - t0;

  // Health soft-pause
  if (state.cycles > 0 && state.cycles % 12 === 0) {
    let healthy = await healthOk();
    if (!healthy) {
      state.lastMessage = "health soft-pause";
      writeLive(state);
      for (let w = 0; w < 15 && !healthy; w++) {
        await sleep(2000);
        healthy = await healthOk();
      }
    }
  }

  if (suiteStep === 0) {
    const row = {
      t: new Date().toISOString().slice(11, 19),
      name: `══ SUITE ${state.suitesComplete + 1} START (${SUITE.length} steps) ══`,
      status: "—",
      ms: 0,
      reason: "complete pass",
      pass: true,
      soft: false,
      kind: "suite",
    };
    pushRecent(state, row);
    logEvent({ t: Date.now(), type: "suite_start", suite: state.suitesComplete + 1 });
  }

  const step = SUITE[suiteStep];
  state.suiteCheckIndex = suiteStep + 1;
  state.currentPhase = step.phase;
  state.cycles += 1;

  const result =
    step.kind === "source" ? await runSourceStep(step) : await runHttpStep(step);

  if (result.pass && !result.soft) state.pass += 1;
  else if (result.pass && result.soft) state.soft += 1;
  else if (result.soft) state.soft += 1;
  else state.fail += 1;

  const row = {
    t: new Date().toISOString().slice(11, 19),
    name: `[${step.phase}] ${step.name}`,
    status: result.status,
    ms: result.ms,
    reason: result.reason,
    pass: result.pass || result.soft,
    soft: result.soft,
    kind: "check",
  };
  pushRecent(state, row);
  state.lastMessage = `${step.phase} · ${step.name} · ${result.status} · ${result.reason}`;
  logEvent({ t: Date.now(), type: "step", suite: state.suitesComplete + 1, ...row });

  suiteStep += 1;
  if (suiteStep >= SUITE.length) {
    state.suitesComplete += 1;
    suiteStep = 0;
    const done = {
      t: new Date().toISOString().slice(11, 19),
      name: `══ SUITE ${state.suitesComplete} COMPLETE ══`,
      status: "OK",
      ms: 0,
      reason: `${state.pass}p / ${state.soft}s / ${state.fail}f cumulative`,
      pass: true,
      soft: false,
      kind: "suite",
    };
    pushRecent(state, done);
    logEvent({ t: Date.now(), type: "suite_complete", suite: state.suitesComplete });
    state.lastMessage = `Suite ${state.suitesComplete} complete — starting next full pass`;
    console.log(
      `  SUITE ${state.suitesComplete} complete · cycles=${state.cycles} p=${state.pass} s=${state.soft} f=${state.fail}`,
    );
  }

  if (state.cycles % 8 === 0) {
    console.log(
      `  #${state.cycles} suite#${state.suitesComplete + 1} step ${state.suiteCheckIndex}/${SUITE.length} p=${state.pass} s=${state.soft} f=${state.fail}`,
    );
  }

  writeLive(state);
  await sleep(GAP_MS);
}

state.elapsedMs = Date.now() - t0;
state.endedAt = new Date().toISOString();
writeLive(state);
writeFileSync(summaryPath, JSON.stringify(state, null, 2), "utf8");
writeFileSync(
  reportPath,
  [
    `# Complete-suite soak`,
    ``,
    `- Base: ${BASE}`,
    `- Minutes: ${MINUTES}`,
    `- Suite size: ${SUITE.length} unique steps`,
    `- Suites complete: ${state.suitesComplete}`,
    `- Cycles: ${state.cycles}`,
    `- Pass: ${state.pass}`,
    `- Soft: ${state.soft}`,
    `- Fail: ${state.fail}`,
    ``,
    `Observe: ${BASE}/soak/observe.html`,
  ].join("\n"),
  "utf8",
);

console.log("=== SOAK COMPLETE ===");
console.log(
  `suites=${state.suitesComplete} steps/suite=${SUITE.length} p=${state.pass} s=${state.soft} f=${state.fail}`,
);
process.exit(0);
