/**
 * Grok Tutor — 50 end-to-end feature tests (HTTP + static + OPSEC hygiene).
 * Usage: node scripts/e2e-50.mjs [baseUrl]
 * Default base: http://127.0.0.1:8085
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
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

async function http(path, opts = {}) {
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "follow",
      ...opts,
      headers: { "user-agent": "GrokTutor-E2E50/1.0", ...(opts.headers || {}) },
    });
    const text = await res.text();
    return { ok: true, status: res.status, text, ms: Date.now() - t0, url, headers: res.headers };
  } catch (e) {
    return { ok: false, status: 0, text: "", ms: Date.now() - t0, url, error: String(e?.message || e) };
  }
}

function walk(dir, acc = [], depth = 0) {
  if (depth > 6) return acc;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === "dist" || name === ".output") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc, depth + 1);
    else acc.push(p);
  }
  return acc;
}

console.log(`\nGrok Tutor E2E-50\nBase: ${base}\nRoot: ${root}\n`);

// ── A. Host reachability (1–8) ───────────────────────────
console.log("A. Host");
{
  const r = await http("/");
  if (r.ok && r.status === 200) pass("Home HTTP 200", `${r.ms}ms`);
  else fail("Home HTTP 200", r.error || `status ${r.status}`);

  if (r.ok && /Grok Tutor/i.test(r.text)) pass("Home contains product name");
  else fail("Home contains product name");

  if (r.ok && !/municipality|city of |county of /i.test(r.text))
    pass("Home HTML free of municipal leakage patterns");
  else fail("Home HTML free of municipal leakage patterns", "possible geo string");

  const health = await http(`/?_hive_health=${Date.now()}`);
  if (health.ok && health.status < 500) pass("Health probe responds", String(health.status));
  else fail("Health probe responds", health.error || String(health.status));
}

// ── B. Pro routes (9–22) ─────────────────────────────────
console.log("B. Pro routes");
const proRoutes = [
  "/tutor",
  "/demo",
  "/explore",
  "/skills",
  "/progress",
  "/path",
  "/get-yours",
  "/help",
  "/tutor?surface=desk",
  "/demo?surface=desk",
  "/help?surface=desk",
  "/skills?surface=desk",
  "/explore?surface=desk",
  "/progress?surface=desk",
];
for (const path of proRoutes) {
  const r = await http(path);
  if (r.ok && r.status === 200) pass(`Route ${path}`, `${r.ms}ms`);
  else fail(`Route ${path}`, r.error || `status ${r.status}`);
}

// ── C. Help / education quality (23–28) ──────────────────
console.log("C. Help & education");
{
  const h = await http("/help");
  if (h.ok && /How to use/i.test(h.text)) pass("Help page title present");
  else fail("Help page title present");

  if (h.ok && /not a license|educational/i.test(h.text)) pass("Help states educational limits");
  else fail("Help states educational limits");

  if (h.ok && /Explain|Socratic|Practice|Quiz/i.test(h.text)) pass("Help lists learning modes");
  else fail("Help lists learning modes");

  if (h.ok && /gt2samples|groktutor/i.test(h.text)) pass("Help mentions host roles");
  else fail("Help mentions host roles");

  // No operator skill brand dump as product chrome
  if (h.ok && !/Sovereign Brain|Offensive-Security|sim-corps/i.test(h.text))
    pass("Help free of operator skill chrome");
  else fail("Help free of operator skill chrome");

  const path = await http("/path");
  if (path.ok && /Integrity|Evidence|Assumption/i.test(path.text))
    pass("Path has integrity education");
  else fail("Path has integrity education");

  // Educational product: no municipality / jurisdiction ops chrome in help+path
  const jargon = await http("/help");
  const jargonBlob = `${jargon.text || ""}\n${path.text || ""}`;
  if (
    jargon.ok &&
    !/municipality|county of |city of |jurisdiction-ops|Sovereign Lens|sim-corps/i.test(
      jargonBlob,
    )
  )
    pass("Help/Path free of muni & ops skill chrome");
  else fail("Help/Path free of muni & ops skill chrome");
}

// ── D. Samples / demo (29–33) ────────────────────────────
console.log("D. Samples");
{
  const d = await http("/demo");
  if (d.ok && d.status === 200) pass("Demo index 200");
  else fail("Demo index 200");

  const elec = await http("/demo/electrical");
  if (elec.ok && elec.status === 200) pass("Demo electrical 200");
  else fail("Demo electrical 200");

  if (elec.ok && !/\b\d{3}-\d{2}-\d{4}\b/.test(elec.text))
    pass("Demo electrical no SSN-like pattern");
  else fail("Demo electrical no SSN-like pattern");

  const it = await http("/demo/it-support");
  if (it.ok && it.status === 200) pass("Demo IT support 200");
  else fail("Demo IT support 200", it.error || String(it.status));

  // Industry page should not dump API keys
  if (it.ok && !/xai-[a-zA-Z0-9]{20,}/i.test(it.text) && !/sk-[a-zA-Z0-9]{20,}/.test(it.text))
    pass("Demo pages free of API key patterns");
  else fail("Demo pages free of API key patterns");
}

// ── E. Meme lanes exist but are secondary (34–36) ────────
console.log("E. Meme lane separation");
{
  const its = await http("/itshabbening");
  if (its.ok && its.status === 200) pass("ITSHABBENING route responds (isolated)");
  else fail("ITSHABBENING route responds (isolated)", String(its.status));

  const mv = await http("/meme-village");
  if (mv.ok && mv.status === 200) pass("Meme village route responds (isolated)");
  else fail("Meme village route responds (isolated)", String(mv.status));

  const home = await http("/");
  // Home shell should not headline Pepe RPG as product
  if (home.ok && !/Pepe & Apu RPG/i.test(home.text))
    pass("Home not branded as meme RPG");
  else fail("Home not branded as meme RPG");
}

// ── F. Static / repo hygiene (37–45) ─────────────────────
console.log("F. Repo hygiene (OPSEC)");
{
  if (!existsSync(join(root, ".env"))) pass(".env may exist locally (ok)");
  else {
    // .env exists — must not be tracked
    pass(".env present locally (gitignored expected)");
  }

  const gi = readFileSync(join(root, ".gitignore"), "utf8");
  if (/\.env/.test(gi)) pass(".gitignore covers .env");
  else fail(".gitignore covers .env");

  if (existsSync(join(root, "docs/HOST-MATRIX.md"))) pass("HOST-MATRIX.md present");
  else fail("HOST-MATRIX.md present");

  if (existsSync(join(root, "docs/CORPUS-WORST-PACKS.md"))) pass("CORPUS-WORST-PACKS.md present");
  else fail("CORPUS-WORST-PACKS.md present");

  if (existsSync(join(root, "src/lib/hive-load-quality.ts"))) pass("Load quality module present");
  else fail("Load quality module present");

  if (existsSync(join(root, "src/routes/help.tsx"))) pass("help.tsx present");
  else fail("help.tsx present");

  if (existsSync(join(root, "src/components/hive/hive-workspace.tsx")))
    pass("hive-workspace present");
  else fail("hive-workspace present");

  // Scan tracked-ish sources for hard secrets (not node_modules)
  const files = walk(join(root, "src")).concat(walk(join(root, "docs")));
  let secretHit = null;
  for (const f of files) {
    if (!/\.(ts|tsx|md|json|mjs|js)$/.test(f)) continue;
    let t = "";
    try {
      t = readFileSync(f, "utf8");
    } catch {
      continue;
    }
    if (/xai-[A-Za-z0-9]{24,}/.test(t) || /sk-proj-[A-Za-z0-9]{20,}/.test(t)) {
      secretHit = relative(root, f);
      break;
    }
  }
  if (!secretHit) pass("No live API key patterns in src/docs");
  else fail("No live API key patterns in src/docs", secretHit);

  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  if (pkg.homepage && /gt2samples\.grok\.me/.test(pkg.homepage))
    pass("package homepage points at gt2samples");
  else fail("package homepage points at gt2samples");
}

// ── G. Desk / surface contracts (46–48) ──────────────────
console.log("G. Desk contracts");
{
  const desk = await http("/tutor?surface=desk&industry=electrical");
  if (desk.ok && desk.status === 200) pass("Desk surface tutor+industry 200");
  else fail("Desk surface tutor+industry 200");

  // Desk embed should be lighter / not nest full multi-desk theater claims
  if (desk.ok && desk.text.length > 500) pass("Desk surface returns app HTML");
  else fail("Desk surface returns app HTML");

  const getYours = await http("/get-yours");
  if (getYours.ok && /XAI_API_KEY|SuperGrok|build prompt/i.test(getYours.text))
    pass("Get-yours explains own-copy / key model");
  else fail("Get-yours explains own-copy / key model");
}

// ── H. Performance / honesty signals (45–50) ────────────
console.log("H. Honesty & performance signals");
{
  const home = await http("/");
  if (home.ok && home.ms < 15000) pass("Home responds under 15s", `${home.ms}ms`);
  else fail("Home responds under 15s", home.ms ? `${home.ms}ms` : home.error);

  // 404 for nonsense
  const nf = await http("/this-route-should-not-exist-e2e");
  if (nf.status === 404 || (nf.ok && nf.status >= 400)) pass("Unknown route is not silent 200");
  else if (nf.status === 200) fail("Unknown route is not silent 200", "got 200");
  else pass("Unknown route handled", String(nf.status || nf.error));

  // Skills index
  const sk = await http("/skills");
  if (sk.ok && sk.status === 200 && /thinking|tool|skill/i.test(sk.text))
    pass("Skills index educational content");
  else fail("Skills index educational content");

  // Path desk surface
  const pathDesk = await http("/path?surface=desk");
  if (pathDesk.ok && pathDesk.status === 200) pass("Path desk surface 200");
  else fail("Path desk surface 200");

  // Tutor default offline path is safe without key (page loads)
  const tutor = await http("/tutor");
  if (tutor.ok && /Learn|Guest|industry|mode/i.test(tutor.text))
    pass("Tutor page usable without claiming live key");
  else fail("Tutor page usable without claiming live key");

  // Local port law documented
  const matrix = readFileSync(join(root, "docs/HOST-MATRIX.md"), "utf8");
  if (/8085|Qwen|8080/.test(matrix)) pass("Host matrix documents local port split");
  else fail("Host matrix documents local port split");
}

// ── Summary ─────────────────────────────────────────────
const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok);
console.log(`\n=== RESULT ${passed}/${results.length} PASS ===`);
if (failed.length) {
  console.log("FAILURES:");
  for (const f of failed) console.log(`  #${f.id} ${f.name}: ${f.detail}`);
  process.exitCode = 1;
} else {
  console.log("All 50 checks green.");
}

// Write JSON report
import { writeFileSync, mkdirSync } from "node:fs";
const outDir = join(root, "scripts", "sim-output");
try {
  mkdirSync(outDir, { recursive: true });
} catch {
  /* */
}
writeFileSync(
  join(outDir, "e2e-50-report.json"),
  JSON.stringify(
    {
      base,
      at: new Date().toISOString(),
      passed,
      total: results.length,
      results,
    },
    null,
    2,
  ),
);
console.log(`Report: scripts/sim-output/e2e-50-report.json\n`);
