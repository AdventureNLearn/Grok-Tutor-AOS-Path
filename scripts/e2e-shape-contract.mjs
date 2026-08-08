/**
 * Shape / orch bootstrap contract (soak gap).
 * Ensures URL orch+shape surfaces stay reachable and source enforces URL-wins-rehydrate.
 *
 *   node scripts/e2e-shape-contract.mjs [baseUrl]
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const base = (process.argv[2] || "http://127.0.0.1:8085").replace(/\/$/, "");
const outDir = join(root, "scripts", "sim-output");
mkdirSync(outDir, { recursive: true });

const shapes = [
  "spine",
  "integrity-triangle",
  "four-agent",
  "claim-diamond",
  "lpin-helix",
  "sense-orbit",
  "star-burst",
  "honeycomb",
];

const results = [];
let pass = 0;
let fail = 0;

function ok(name, detail = "") {
  pass++;
  results.push({ name, ok: true, detail });
  console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ""}`);
}
function bad(name, detail = "") {
  fail++;
  results.push({ name, ok: false, detail });
  console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function http(path) {
  const url = path.startsWith("http") ? path : `${base}${path}`;
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "GrokTutor-ShapeContract/1.0" },
      redirect: "follow",
    });
    const text = await res.text();
    return { status: res.status, text, url };
  } catch (e) {
    return { status: 0, text: "", url, error: String(e?.message || e) };
  }
}

console.log(`\nGrok Tutor · shape/orch contract\nBase: ${base}\n`);

// A. Source contract — URL wins rehydrate
console.log("A. Source bootstrap contract");
{
  const ws = join(root, "src", "components", "hive", "hive-workspace.tsx");
  if (!existsSync(ws)) {
    bad("hive-workspace.tsx present");
  } else {
    const src = readFileSync(ws, "utf8");
    ok("hive-workspace.tsx present");
    if (/applyOrchFromUrl|orch === \"1\"|p\.get\(\"orch\"\)/.test(src)) ok("orch URL reader present");
    else bad("orch URL reader present");
    if (/onFinishHydration/.test(src)) ok("rehydrate re-apply (onFinishHydration)");
    else bad("rehydrate re-apply (onFinishHydration)");
    if (/URL must win over persisted/.test(src) || /setShape\(shape\)/.test(src))
      ok("shape apply from URL");
    else bad("shape apply from URL");
    if (/setPlayOrchestration\(true\)/.test(src)) ok("auto-play orch on URL");
    else bad("auto-play orch on URL");
    for (const s of shapes) {
      if (src.includes(`"${s}"`)) ok(`allowed shape listed: ${s}`);
      else bad(`allowed shape listed: ${s}`);
    }
  }
}

// B. HTTP reachability for each shape entry
console.log("\nB. HTTP shape entries");
for (const s of shapes) {
  const path = `/?orch=1&shape=${encodeURIComponent(s)}`;
  const r = await http(path);
  if (r.status === 200 && /Grok Tutor/i.test(r.text)) ok(`HTTP ${s}`, `${r.status}`);
  else bad(`HTTP ${s}`, r.error || `status ${r.status}`);
  // OPSEC: no absolute host paths in shell HTML
  if (r.text && !/C:\\\\Users|C:\\\\AOS|file:\/\//i.test(r.text))
    ok(`OPSEC no host path in HTML (${s})`);
  else if (r.status === 200) bad(`OPSEC no host path in HTML (${s})`, "possible path leak");
}

// C. Observe surfaces (dual-monitor stack)
console.log("\nC. Observe surfaces");
for (const p of [
  "/soak/observe-log.html",
  "/soak/pane-spine.html",
  "/soak/pane-integrity.html",
  "/soak/pane-four.html",
  "/soak/LIVE.json",
  "/soak/observe.html",
]) {
  const r = await http(p);
  if (r.status === 200) ok(`observe ${p}`);
  else bad(`observe ${p}`, r.error || `status ${r.status}`);
}

// D. Educational disclaimer surfaces (no overclaim gate sample)
console.log("\nD. Disclaimer surfaces");
for (const p of ["/help", "/credits"]) {
  const r = await http(p);
  if (r.status !== 200) {
    bad(`${p} HTTP 200`, r.error || String(r.status));
    continue;
  }
  ok(`${p} HTTP 200`);
  if (/not a substitute|licensed|Educational|learning and practice/i.test(r.text))
    ok(`${p} educational / non-substitute language`);
  else bad(`${p} educational / non-substitute language`, "missing disclaimer patterns");
}

const summary = {
  base,
  pass,
  fail,
  total: pass + fail,
  ok: fail === 0,
  at: new Date().toISOString(),
  results,
};
const outPath = join(outDir, "e2e-shape-contract-report.json");
writeFileSync(outPath, JSON.stringify(summary, null, 2));
console.log(`\n${fail === 0 ? "PASS" : "FAIL"} ${pass}/${pass + fail}  → ${outPath}\n`);
process.exit(fail === 0 ? 0 : 1);
