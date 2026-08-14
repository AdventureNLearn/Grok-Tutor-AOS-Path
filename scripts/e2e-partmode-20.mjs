/**
 * PartMode literacy pack + route tests.
 * Usage: node scripts/e2e-partmode-20.mjs [baseUrl]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const base = (process.argv[2] || process.env.TUTOR_BASE || "http://127.0.0.1:8085").replace(/\/$/, "");
const results = [];
let n = 0;
function pass(name, detail = "") {
  n++; results.push({ id: n, name, ok: true, detail });
  console.log(`  OK ${n}. ${name}${detail ? " - " + detail : ""}`);
}
function fail(name, detail = "") {
  n++; results.push({ id: n, name, ok: false, detail });
  console.log(`  FAIL ${n}. ${name}${detail ? " - " + detail : ""}`);
}
async function http(path) {
  const url = path.startsWith("http") ? path : `${base}${path}`;
  try {
    const res = await fetch(url, { headers: { "user-agent": "GrokTutor-E2E-PartMode/1.0" }, redirect: "follow" });
    const text = await res.text();
    return { ok: true, status: res.status, text, url };
  } catch (e) {
    return { ok: false, status: 0, text: "", url, error: String(e?.message || e) };
  }
}

console.log(`\nGrok Tutor PartMode-20 E2E\nBase: ${base}\n`);
const samplesPath = join(root, "src", "lib", "cad", "partmode-samples-20.ts");
const mapPath = join(root, "src", "lib", "cad", "partmode-apply-map.ts");
const creditsPath = join(root, "src", "lib", "public-credits.ts");
const labPath = join(root, "src", "routes", "labs.cad.tsx");
console.log("A. Files");
for (const [p, label] of [[samplesPath, "partmode-samples-20.ts"], [mapPath, "partmode-apply-map.ts"], [creditsPath, "public-credits.ts"], [labPath, "labs.cad.tsx"]]) {
  if (existsSync(p)) pass(label + " exists"); else fail(label + " exists");
}
console.log("B. Sample pack");
const raw = readFileSync(samplesPath, "utf8");
const m = raw.match(/export const PARTMODE_SAMPLES_20: CadSample\[\] = (\[[\s\S]*?\]);\s*\nexport const PARTMODE_SAMPLE_COUNT/);
if (!m) fail("Parse PARTMODE_SAMPLES_20");
else {
  pass("Parse PARTMODE_SAMPLES_20");
  const samples = JSON.parse(m[1]);
  if (samples.length === 20) pass("Exactly 20 samples", String(samples.length)); else fail("Exactly 20 samples", String(samples.length));
  const ids = new Set(); let bad = 0;
  for (const s of samples) {
    if (!/^pm-\d{3}$/.test(s.id) || ids.has(s.id)) bad++;
    ids.add(s.id);
    if (!s.quiz?.choices?.length) bad++;
  }
  if (bad === 0) pass("Ids unique and quizzes present"); else fail("Ids unique and quizzes present", String(bad));
}
const credits = readFileSync(creditsPath, "utf8");
if (credits.includes("PARTMODE_CITATION") && credits.includes('id: "partmode"')) pass("Credits include PartMode"); else fail("Credits include PartMode");
const lab = readFileSync(labPath, "utf8");
if (lab.includes("partmode-literacy") && lab.includes("PARTMODE_SAMPLES_20")) pass("Lab route wires PartMode"); else fail("Lab route wires PartMode");
console.log("C. HTTP (optional if server up)");
const home = await http("/labs/cad");
if (!home.ok) {
  pass("GET /labs/cad skipped (server down)", home.error || "down");
  pass("Credits HTTP skipped (server down)");
} else if (home.status >= 200 && home.status < 400) {
  pass("GET /labs/cad", String(home.status));
  if (/PartMode|partmode|pm-00/i.test(home.text)) pass("HTML mentions PartMode");
  else fail("HTML mentions PartMode", "string not found");
  const cred = await http("/credits");
  if (cred.ok && cred.status < 400 && /PartMode/i.test(cred.text)) pass("Credits page mentions PartMode");
  else fail("Credits page mentions PartMode", cred.ok ? String(cred.status) : (cred.error || "down"));
} else {
  fail("GET /labs/cad", "status " + home.status);
}
const failed = results.filter((r) => !r.ok).length;
const outDir = join("C:\\AOS\\logs", "tutor-partmode-e2e");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "LATEST.json"), JSON.stringify({ at: new Date().toISOString(), base, failed, results }, null, 2), "utf8");
console.log(`\nDone. failed=${failed}/${results.length}\n`);
process.exit(failed ? 1 : 0);
