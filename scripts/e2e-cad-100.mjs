/**
 * CAD lab pack + route tests (uniqueness, integrity, HTTP).
 * Usage: node scripts/e2e-cad-100.mjs [baseUrl]
 * Default: http://127.0.0.1:8085
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const base = (process.argv[2] || process.env.TUTOR_BASE || "http://127.0.0.1:8085").replace(
  /\/$/,
  "",
);

const results = [];
let n = 0;
function pass(name, detail = "") {
  n++;
  results.push({ id: n, name, ok: true, detail });
  console.log(`  ✓ ${n}. ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name, detail = "") {
  n++;
  results.push({ id: n, name, ok: false, detail });
  console.log(`  ✗ ${n}. ${name}${detail ? ` — ${detail}` : ""}`);
}

async function http(path) {
  const url = path.startsWith("http") ? path : `${base}${path}`;
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "GrokTutor-E2E-CAD/1.0" },
      redirect: "follow",
    });
    const text = await res.text();
    return { ok: true, status: res.status, text, url };
  } catch (e) {
    return { ok: false, status: 0, text: "", url, error: String(e?.message || e) };
  }
}

console.log(`\nGrok Tutor CAD-100 E2E\nBase: ${base}\n`);

// Static module integrity via dynamic import of generated TS is hard without tsx;
// parse the JSON array embedded in the TS file instead.
const samplesPath = join(root, "src", "lib", "cad", "cad-samples-100.ts");
const mapPath = join(root, "src", "lib", "cad", "mac-apply-map.ts");
const routePath = join(root, "src", "routes", "labs.cad.tsx");

console.log("A. Files");
if (existsSync(samplesPath)) pass("cad-samples-100.ts exists");
else fail("cad-samples-100.ts exists");
if (existsSync(mapPath)) pass("mac-apply-map.ts exists");
else fail("mac-apply-map.ts exists");
if (existsSync(routePath)) pass("labs.cad.tsx exists");
else fail("labs.cad.tsx exists");

const research = "C:\\AOS\\workspace\\research\\Multi-Agent-CAD\\README.md";
if (existsSync(research)) pass("MAC research clone present");
else fail("MAC research clone present", research);

console.log("B. Sample pack uniqueness");
const raw = readFileSync(samplesPath, "utf8");
const m = raw.match(/export const CAD_SAMPLES_100: CadSample\[\] = (\[[\s\S]*?\]);\s*\nexport const CAD_SAMPLE_COUNT/);
if (!m) {
  fail("Parse CAD_SAMPLES_100 JSON array");
} else {
  pass("Parse CAD_SAMPLES_100 JSON array");
  const samples = JSON.parse(m[1]);
  if (samples.length === 100) pass("Exactly 100 samples", String(samples.length));
  else fail("Exactly 100 samples", String(samples.length));

  const ids = new Set();
  const titles = new Set();
  const prompts = new Set();
  const quizzes = new Set();
  let bad = 0;
  const idxDist = { 0: 0, 1: 0, 2: 0, 3: 0 };
  const wrongSet = new Set();
  const banned =
    /municipality|city of |county of |parcel\s*#|street address|ssn|social security|operator private|skill brand|jurisdiction-ops|sovereign lens|sim-corps/i;
  for (const s of samples) {
    if (ids.has(s.id)) bad++;
    ids.add(s.id);
    if (titles.has(s.title)) bad++;
    titles.add(s.title);
    if (prompts.has(s.prompt)) bad++;
    prompts.add(s.prompt);
    if (quizzes.has(s.quiz.prompt)) bad++;
    quizzes.add(s.quiz.prompt);
    if (!/^cad-\d{3}$/.test(s.id)) bad++;
    if (s.quiz.answerIndex < 0 || s.quiz.answerIndex >= s.quiz.choices.length) bad++;
    if (!s.features?.length || !s.checkList?.length || !s.macLesson) bad++;
    const blob = `${s.prompt} ${s.title} ${s.quiz.prompt} ${s.quiz.choices.join(" ")} ${s.checkList.join(" ")}`;
    if (banned.test(blob)) bad++;
    idxDist[s.quiz.answerIndex] = (idxDist[s.quiz.answerIndex] || 0) + 1;
    s.quiz.choices.forEach((c, i) => {
      if (i !== s.quiz.answerIndex) wrongSet.add(c);
    });
  }
  if (ids.size === 100) pass("100 unique ids");
  else fail("100 unique ids", String(ids.size));
  if (titles.size === 100) pass("100 unique titles");
  else fail("100 unique titles", String(titles.size));
  if (prompts.size === 100) pass("100 unique prompts");
  else fail("100 unique prompts", String(prompts.size));
  if (quizzes.size === 100) pass("100 unique quiz prompts");
  else fail("100 unique quiz prompts", String(quizzes.size));
  if (bad === 0) pass("No structural/banned-language defects in pack");
  else fail("No structural/banned-language defects in pack", `bad=${bad}`);

  const families = new Set(samples.map((s) => s.family));
  if (families.size >= 8) pass("Diverse families", String(families.size));
  else fail("Diverse families", String(families.size));

  const stages = new Set(samples.map((s) => s.pipelineStage));
  if (stages.size >= 4) pass("Multiple pipeline stages covered", [...stages].join(","));
  else fail("Multiple pipeline stages covered", [...stages].join(","));

  // Quiz quality: answer not stuck on one slot; distractors not a tiny joke set
  const usedSlots = Object.values(idxDist).filter((n) => n > 0).length;
  const maxSlot = Math.max(...Object.values(idxDist));
  if (usedSlots >= 3 && maxSlot <= 45)
    pass("Quiz answerIndex distributed", JSON.stringify(idxDist));
  else fail("Quiz answerIndex distributed", JSON.stringify(idxDist));
  if (wrongSet.size >= 20)
    pass("Plausible distractor variety", String(wrongSet.size));
  else fail("Plausible distractor variety", String(wrongSet.size));
}

console.log("C. Apply-map content");
const mapRaw = readFileSync(mapPath, "utf8");
// Positive learner scope (no scare "does not apply" list in public map)
if (/MAC_APPLIES_TO/.test(mapRaw) && /MAC_SCOPE_INTERNAL/.test(mapRaw))
  pass("Positive apply map + internal scope present");
else fail("Positive apply map + internal scope present");
if (/Spec Planner|Geometric Architect|Dual-Engine/.test(mapRaw))
  pass("Agent pipeline named");
else fail("Agent pipeline named");
if (/offline samples|no CAD kernel|human final call/i.test(mapRaw))
  pass("Honest educational limits in map");
else fail("Honest educational limits in map");

console.log("D. HTTP routes");
{
  const r = await http("/labs/cad");
  if (r.ok && r.status === 200) pass("GET /labs/cad 200", `${r.status}`);
  else fail("GET /labs/cad 200", r.error || String(r.status));

  if (r.ok && /Multi-Agent CAD|Plan Lab|cad-lab/i.test(r.text))
    pass("CAD lab page content markers");
  else fail("CAD lab page content markers", "missing markers in HTML shell");

  if (r.ok && !/city of |county of /i.test(r.text))
    pass("CAD lab HTML free of municipal leakage patterns");
  else fail("CAD lab HTML free of municipal leakage patterns");

  const desk = await http("/labs/cad?surface=desk");
  if (desk.ok && desk.status === 200) pass("GET /labs/cad?surface=desk 200");
  else fail("GET /labs/cad?surface=desk 200", desk.error || String(desk.status));

  const home = await http("/");
  if (home.ok && home.status === 200) pass("Home still 200 after CAD routes");
  else fail("Home still 200 after CAD routes");
}

console.log("E. Hive wiring");
const hive = readFileSync(join(root, "src", "lib", "tutor-hive-map.ts"), "utf8");
if (/ws:cad-lab/.test(hive) && /\/labs\/cad/.test(hive))
  pass("Hive workspace comb points at /labs/cad");
else fail("Hive workspace comb points at /labs/cad");

const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok).length;
console.log(`\nResult: ${passed}/${results.length} PASS · ${failed} FAIL\n`);

const outDir = join(root, "scripts", "sim-output");
mkdirSync(outDir, { recursive: true });
const report = {
  at: new Date().toISOString(),
  base,
  passed,
  failed,
  total: results.length,
  results,
};
writeFileSync(join(outDir, "e2e-cad-100-report.json"), JSON.stringify(report, null, 2));
process.exit(failed ? 1 : 0);
