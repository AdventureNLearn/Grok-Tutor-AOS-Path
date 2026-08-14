/**
 * Full E2E conductor for public-gate window (e.g. 09:00–11:00).
 * Runs ordered suites, writes PASS/SOFT/FAIL matrix. Does not deploy.
 *
 *   node scripts/e2e-morning-suite.mjs [baseUrl]
 *
 * Env:
 *   TUTOR_BASE=http://127.0.0.1:8085
 *   MORNING_SKIP=sim1h,sim200   (comma skip list)
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const base = (process.argv[2] || process.env.TUTOR_BASE || "http://127.0.0.1:8085").replace(
  /\/$/,
  "",
);
// Default: skip hour-long soak (set MORNING_SKIP= to clear, or MORNING_SKIP=sim1h,full-spectrum)
const skip = new Set(
  (process.env.MORNING_SKIP !== undefined
    ? process.env.MORNING_SKIP
    : "sim1h"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outDir = join(root, "scripts", "sim-output", "morning-e2e", stamp);
mkdirSync(outDir, { recursive: true });

/** Ordered gate — hard fail blocks public narrative */
const suites = [
  {
    id: "shape-contract",
    name: "Shape/orch URL contract",
    cmd: "node",
    args: ["scripts/e2e-shape-contract.mjs", base],
    blockOnFail: true,
  },
  {
    id: "reasoning-corpus",
    name: "Reasoning tracks → sample lessons corpus",
    cmd: "npm.cmd",
    args: ["exec", "--", "tsx", "scripts/reasoning-track-corpus.mts"],
    blockOnFail: true,
  },
  {
    id: "full-spectrum",
    name: "Full-spectrum all-industry reasoning corpus",
    cmd: "npm.cmd",
    args: ["exec", "--", "tsx", "scripts/full-spectrum-reasoning-pipeline.mts"],
    blockOnFail: false,
  },
  {
    id: "public-audit",
    name: "Public claims / OPSEC audit",
    cmd: "node",
    args: ["scripts/audit-public-claims.mjs", base],
    blockOnFail: true,
  },
  {
    id: "e2e50",
    name: "E2E-50 feature suite",
    cmd: "node",
    args: ["scripts/e2e-50.mjs", base],
    blockOnFail: true,
  },
  {
    id: "cad100",
    name: "CAD plan-lab 100",
    cmd: "node",
    args: ["scripts/e2e-cad-100.mjs", base],
    blockOnFail: true,
  },
  {
    id: "hive-dual",
    name: "Hive dual-mode stress",
    cmd: "node",
    args: ["scripts/stress-hive-dualmode.mjs", base],
    blockOnFail: true,
  },
  {
    id: "responsive50",
    name: "Responsive stress 50",
    cmd: "node",
    args: ["scripts/stress-responsive-50.mjs", base],
    blockOnFail: false,
  },
  {
    id: "sim200",
    name: "Feature cycles 200",
    cmd: "node",
    args: ["scripts/sim-feature-cycles-200.mjs", base],
    blockOnFail: true,
  },
  {
    id: "normie-sim",
    name: "Normie release sim",
    cmd: "node",
    args: ["scripts/release-normie-sim.mjs", "--cycles", "4", "--streak", "4"],
    blockOnFail: false,
  },
  {
    id: "sim1h",
    name: "Observable 1h complete-suite soak",
    cmd: "node",
    args: ["scripts/sim-observable-1h.mjs", base, "60"],
    blockOnFail: true,
    long: true,
  },
];

function runOne(suite) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const child = spawn(suite.cmd, suite.args, {
      cwd: root,
      env: { ...process.env, TUTOR_BASE: base },
      stdio: ["ignore", "pipe", "pipe"],
      // Windows Node 24: spawn without shell fails EINVAL for some cmds
      shell: true,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => {
      const s = d.toString();
      stdout += s;
      process.stdout.write(s);
    });
    child.stderr.on("data", (d) => {
      const s = d.toString();
      stderr += s;
      process.stderr.write(s);
    });
    child.on("close", (code) => {
      resolve({
        id: suite.id,
        name: suite.name,
        code: code ?? 1,
        ms: Date.now() - t0,
        ok: (code ?? 1) === 0,
        blockOnFail: suite.blockOnFail,
        stdoutTail: stdout.slice(-4000),
        stderrTail: stderr.slice(-2000),
      });
    });
  });
}

async function ensureBase() {
  try {
    const r = await fetch(base + "/");
    return r.status === 200;
  } catch {
    return false;
  }
}

console.log(`\n════════════════════════════════════════`);
console.log(` Grok Tutor · morning E2E conductor`);
console.log(` Base: ${base}`);
console.log(` Out:  ${outDir}`);
console.log(` Skip: ${[...skip].join(", ") || "(none)"}`);
console.log(`════════════════════════════════════════\n`);

if (!(await ensureBase())) {
  console.error(`FATAL: ${base} not reachable. Start Keep-Tutor-Server / npm run dev first.`);
  process.exit(2);
}

const matrix = [];
let blocked = false;

for (const suite of suites) {
  if (skip.has(suite.id)) {
    console.log(`\n—— SKIP ${suite.id}: ${suite.name} ——\n`);
    matrix.push({
      id: suite.id,
      name: suite.name,
      status: "SKIP",
      ok: true,
      code: null,
      ms: 0,
      blockOnFail: suite.blockOnFail,
    });
    continue;
  }
  console.log(`\n—— RUN ${suite.id}: ${suite.name} ——\n`);
  const r = await runOne(suite);
  const status = r.ok ? "PASS" : suite.blockOnFail ? "FAIL" : "SOFT_FAIL";
  matrix.push({
    id: r.id,
    name: r.name,
    status,
    ok: r.ok,
    code: r.code,
    ms: r.ms,
    blockOnFail: r.blockOnFail,
  });
  writeFileSync(
    join(outDir, `${suite.id}.log`),
    `code=${r.code}\nms=${r.ms}\n\n--- stdout ---\n${r.stdoutTail}\n\n--- stderr ---\n${r.stderrTail}\n`,
    "utf8",
  );
  if (!r.ok && suite.blockOnFail) {
    blocked = true;
    console.error(`\nBLOCKED on ${suite.id} — remaining suites still run for evidence.\n`);
  }
}

const summary = {
  at: new Date().toISOString(),
  base,
  outDir,
  blocked,
  publicGateRecommendation: blocked
    ? "HOLD — hard suite failure; do not claim public-ready"
    : "CONDITIONAL — all blocking suites passed; still require OPSEC human review + dual-observe visual lock before ship",
  disclaimer:
    "This matrix is automated educational-product verification only. Not accreditation, not professional licensure, not a legal/medical compliance certificate.",
  matrix,
  pass: matrix.filter((m) => m.status === "PASS").length,
  fail: matrix.filter((m) => m.status === "FAIL").length,
  soft: matrix.filter((m) => m.status === "SOFT_FAIL").length,
  skip: matrix.filter((m) => m.status === "SKIP").length,
};

writeFileSync(join(outDir, "MATRIX.json"), JSON.stringify(summary, null, 2));
writeFileSync(join(root, "scripts", "sim-output", "morning-e2e", "LATEST.json"), JSON.stringify(summary, null, 2));

const md = [
  `# Morning E2E matrix`,
  ``,
  `- At: ${summary.at}`,
  `- Base: ${base}`,
  `- PASS: ${summary.pass} · FAIL: ${summary.fail} · SOFT: ${summary.soft} · SKIP: ${summary.skip}`,
  `- Gate: **${summary.publicGateRecommendation}**`,
  ``,
  summary.disclaimer,
  ``,
  `| Suite | Status | ms | Block? |`,
  `|---|---|---:|:---:|`,
  ...matrix.map(
    (m) =>
      `| ${m.id} | **${m.status}** | ${m.ms} | ${m.blockOnFail ? "yes" : "no"} |`,
  ),
  ``,
];
writeFileSync(join(outDir, "MATRIX.md"), md.join("\n"));

console.log(`\n${md.join("\n")}`);
console.log(`\nWrote ${join(outDir, "MATRIX.md")}\n`);
process.exit(blocked ? 1 : 0);
