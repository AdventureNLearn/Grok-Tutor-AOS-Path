/**
 * Release stress + smoke suite for Grok Tutor.
 * Requires dev server on TUTOR_BASE (default http://127.0.0.1:8085).
 *
 *   node scripts/run-release-stress-suite.mjs
 *   node scripts/run-release-stress-suite.mjs --quick
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const base = (process.env.TUTOR_BASE || "http://127.0.0.1:8085").replace(/\/$/, "");
const quick = process.argv.includes("--quick");
const logDir = "C:\\AOS\\logs\\tutor-release-stress";
mkdirSync(logDir, { recursive: true });

const steps = quick
  ? [
      { name: "typecheck", cmd: "npm.cmd", args: ["run", "typecheck"] },
      { name: "partmode20", cmd: "npm.cmd", args: ["run", "test:partmode20"] },
      { name: "cad100", cmd: "npm.cmd", args: ["run", "test:cad100"] },
      { name: "shape", cmd: "npm.cmd", args: ["run", "test:shape"] },
      { name: "e2e50", cmd: "npm.cmd", args: ["run", "test:e2e50"] },
    ]
  : [
      { name: "typecheck", cmd: "npm.cmd", args: ["run", "typecheck"] },
      { name: "partmode20", cmd: "npm.cmd", args: ["run", "test:partmode20"] },
      { name: "cad100", cmd: "npm.cmd", args: ["run", "test:cad100"] },
      { name: "shape", cmd: "npm.cmd", args: ["run", "test:shape"] },
      { name: "e2e50", cmd: "npm.cmd", args: ["run", "test:e2e50"] },
      { name: "responsive50", cmd: "npm.cmd", args: ["run", "test:responsive50"] },
      { name: "hive-dual", cmd: "npm.cmd", args: ["run", "test:hive-dual"] },
      { name: "morning", cmd: "npm.cmd", args: ["run", "test:morning"] },
      { name: "normie-sim", cmd: "npm.cmd", args: ["run", "test:normie-sim"] },
      { name: "sim200", cmd: "npm.cmd", args: ["run", "test:sim200"] },
    ];

async function httpOk(path) {
  try {
    const res = await fetch(base + path, {
      headers: { "user-agent": "GrokTutor-ReleaseStress/1.0" },
      redirect: "follow",
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, status: 0, error: String(e?.message || e) };
  }
}

console.log(`\n=== Grok Tutor release stress suite ===`);
console.log(`base=${base} quick=${quick} at=${new Date().toISOString()}\n`);

const results = [];
const routes = ["/", "/library", "/labs/cad", "/credits", "/demo", "/tutor", "/help", "/explore", "/skills", "/path"];
console.log("A. HTTP product routes");
for (const path of routes) {
  const r = await httpOk(path);
  const row = { name: `HTTP ${path}`, ok: r.ok && r.status >= 200 && r.status < 400, detail: String(r.status || r.error || "") };
  results.push(row);
  console.log(`  ${row.ok ? "OK" : "FAIL"} ${path} ${row.detail}`);
}

console.log("\nB. Automated suites");
for (const step of steps) {
  console.log(`\n--- ${step.name} ---`);
  const t0 = Date.now();
  const res = spawnSync(step.cmd, step.args, {
    cwd: root,
    env: { ...process.env, TUTOR_BASE: base },
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    // Windows: npm.cmd requires a shell
    shell: true,
  });
  const ms = Date.now() - t0;
  const ok = res.status === 0;
  const out = (res.stdout || "") + (res.stderr || "");
  writeFileSync(join(logDir, `${step.name}.log`), out, "utf8");
  results.push({ name: step.name, ok, detail: `exit=${res.status} ${ms}ms` });
  console.log(`  ${ok ? "OK" : "FAIL"} ${step.name} exit=${res.status} ${ms}ms`);
  if (!ok) {
    const tail = out.split(/\r?\n/).slice(-15).join("\n");
    console.log(tail);
  }
}

const failed = results.filter((r) => !r.ok);
const summary = {
  at: new Date().toISOString(),
  base,
  quick,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.length,
  results,
};
writeFileSync(join(logDir, "SUMMARY.json"), JSON.stringify(summary, null, 2), "utf8");
const md = [
  `# Release stress suite`,
  ``,
  `**At:** ${summary.at}`,
  `**Base:** ${base}`,
  `**Mode:** ${quick ? "quick" : "full"}`,
  `**Passed:** ${summary.passed} / ${summary.total}`,
  ``,
  `| Check | Result | Detail |`,
  `| --- | --- | --- |`,
  ...results.map((r) => `| ${r.name} | ${r.ok ? "PASS" : "FAIL"} | ${r.detail} |`),
  ``,
  `Logs: \`${logDir}\\*.log\``,
  ``,
].join("\n");
writeFileSync(join(logDir, "SUMMARY.md"), md, "utf8");
writeFileSync(join(root, "docs", "RELEASE-STRESS-LATEST.md"), md, "utf8");
console.log(`\n=== SUMMARY ${summary.passed}/${summary.total} PASS ===`);
console.log(`logs: ${logDir}`);
process.exit(failed.length ? 1 : 0);
