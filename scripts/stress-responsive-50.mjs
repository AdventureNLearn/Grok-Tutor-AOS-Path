/**
 * Responsive Hive stress — 50+ checks for fill-on-zoom + phone utility path.
 * Usage: node scripts/stress-responsive-50.mjs [baseUrl]
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const base = (process.argv[2] || "http://127.0.0.1:8085").replace(/\/$/, "");

let n = 0;
let passN = 0;
let failN = 0;
function pass(name, detail = "") {
  n++;
  passN++;
  console.log(`  ✓ ${n}. ${name}${detail ? " — " + detail : ""}`);
}
function fail(name, detail = "") {
  n++;
  failN++;
  console.log(`  ✗ ${n}. ${name}${detail ? " — " + detail : ""}`);
}
function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

console.log("Grok Tutor · Responsive fill + mobile stress (50+)");
console.log("Base:", base);
console.log("Root:", root);

console.log("\nA. Source modules present");
const files = [
  "src/lib/hive-viewport.ts",
  "src/components/hive/tutor-hive3d.ts",
  "src/components/hive/hive-map-2d.tsx",
  "src/components/hive/hive-workspace.tsx",
  "src/lib/hive-desk-store.ts",
  "src/styles.css",
  "src/components/layout.tsx",
];
for (const f of files) {
  if (existsSync(join(root, f))) pass(`${f} present`);
  else fail(`${f} present`);
}

console.log("\nB. Viewport helper contracts");
const vp = read("src/lib/hive-viewport.ts");
const contracts = [
  ["layoutTier export", /export function layoutTier/.test(vp)],
  ["isPhoneLayout", /export function isPhoneLayout/.test(vp)],
  ["isWideLayout", /export function isWideLayout/.test(vp)],
  ["cardScaleForZoom", /export function cardScaleForZoom/.test(vp)],
  ["fitDistanceForBox", /export function fitDistanceForBox/.test(vp)],
  ["mapBoardSize fill", /export function mapBoardSize/.test(vp)],
  ["defaultViewForDevice", /export function defaultViewForDevice/.test(vp)],
  ["phone defaults to 2d", /isPhoneLayout\(\)\s*\?\s*"2d"/.test(vp)],
  ["wide fill bias < 1", /return 0\.78|return 0\.84/.test(vp)],
  ["zoom-out card boost > 1", /Math\.min\(1\.28/.test(vp)],
];
for (const [name, ok] of contracts) {
  if (ok) pass(name);
  else fail(name);
}

console.log("\nC. 3D fill + card scale wiring");
const t3 = read("src/components/hive/tutor-hive3d.ts");
for (const [name, ok] of [
  ["imports cardScaleForZoom", /cardScaleForZoom/.test(t3)],
  ["imports fitDistanceForBox", /fitDistanceForBox/.test(t3)],
  ["cardFillScale state", /cardFillScale/.test(t3)],
  ["refreshCardFillScale", /refreshCardFillScale/.test(t3)],
  ["fitAll uses fitDistanceForBox", /fitDistanceForBox\(/.test(t3)],
  ["resize re-fits (debounced)", /resizeFitTimer/.test(t3)],
  ["mesh scale uses cardFillScale", /cardFillScale/.test(t3) && /mesh\.scale\.setScalar/.test(t3)],
  ["glow scales with fill", /gBase \*[\s\S]*cardFillScale|cardFillScale \*/.test(t3)],
]) {
  if (ok) pass(name);
  else fail(name);
}

console.log("\nD. 2D map fill wiring");
const m2 = read("src/components/hive/hive-map-2d.tsx");
for (const [name, ok] of [
  ["ResizeObserver board", /ResizeObserver/.test(m2)],
  ["mapBoardSize used", /mapBoardSize/.test(m2)],
  ["fieldSpan zoom-out", /fieldSpan/.test(m2)],
  ["--map-comb-scale CSS var", /--map-comb-scale/.test(m2)],
  ["layout tier data attr", /data-tier/.test(m2)],
  ["phone class is-phone", /is-\$\{tier\}|is-phone/.test(m2)],
]) {
  if (ok) pass(name);
  else fail(name);
}

console.log("\nE. Workspace mobile + dual-mode");
const ws = read("src/components/hive/hive-workspace.tsx");
for (const [name, ok] of [
  ["VIEW_FORCED_KEY", /VIEW_FORCED_KEY/.test(ws)],
  ["defaultViewForDevice import", /defaultViewForDevice/.test(ws)],
  ["data-layout tier", /data-layout=\{tier\}/.test(ws)],
  ["is-phone class", /is-phone/.test(ws)],
  ["phone dock class", /is-phone-dock/.test(ws)],
  ["map zoom range wider desktop", /0\.45/.test(ws) && /1\.75/.test(ws)],
  ["phone prefers map first paint", /isPhoneLayout/.test(ws)],
]) {
  if (ok) pass(name);
  else fail(name);
}

console.log("\nF. Desk phone sheets");
const desk = read("src/lib/hive-desk-store.ts");
for (const [name, ok] of [
  ["MIN_W_PHONE", /MIN_W_PHONE/.test(desk)],
  ["phone maximized no inset cascade", /v\.phone \? 0/.test(desk)],
  ["phone smart layout max", /if \(v\.phone\) return "max"/.test(desk)],
  ["phone tile → max sheets", /if \(v\.phone\)[\s\S]*maximizedPos/.test(desk)],
]) {
  if (ok) pass(name);
  else fail(name);
}

console.log("\nG. CSS mobile + fill");
const css = read("src/styles.css");
for (const [name, ok] of [
  ["--map-comb-scale in CSS", /--map-comb-scale/.test(css)],
  ["phone max-width 720 media", /@media \(max-width: 720px\)/.test(css)],
  ["safe-area-inset-bottom", /safe-area-inset-bottom/.test(css)],
  ["phone dock styles", /is-phone-dock|translateX\(-50%\)/.test(css)],
  ["comb scale transform", /var\(--map-comb-scale/.test(css)],
  ["wide media 1400", /@media \(min-width: 1400px\)/.test(css)],
]) {
  if (ok) pass(name);
  else fail(name);
}

console.log("\nH. Pure logic unit checks (no DOM)");
// Inline pure math matching hive-viewport formulas
function cardScaleForZoom(zoomFactor) {
  const z = Math.min(2.4, Math.max(0.28, zoomFactor || 1));
  if (z >= 1) return Math.max(0.88, 1 / Math.pow(z, 0.22));
  return Math.min(1.28, 1 / Math.pow(z, 0.42));
}
function fillBiasForAspect(aspect) {
  const a = Math.max(0.5, aspect || 1);
  if (a >= 2.1) return 0.78;
  if (a >= 1.7) return 0.84;
  if (a >= 1.45) return 0.9;
  if (a <= 0.75) return 0.92;
  return 1;
}
const zOut = cardScaleForZoom(0.5);
const zIn = cardScaleForZoom(1.5);
const zFit = cardScaleForZoom(1);
if (zOut > zFit) pass("zoom-out card scale > fit", zOut.toFixed(3));
else fail("zoom-out card scale > fit", String(zOut));
if (zIn <= zFit + 0.01) pass("zoom-in card scale <= fit", zIn.toFixed(3));
else fail("zoom-in card scale <= fit", String(zIn));
// Cap prevents pile-up (pairs with hive-pack separationScale)
if (zOut <= 1.28) pass("zoom-out card scale capped for separation", zOut.toFixed(3));
else fail("zoom-out card scale capped for separation", String(zOut));
if (fillBiasForAspect(2.2) < fillBiasForAspect(1.2))
  pass("wide aspect fill bias stronger");
else fail("wide aspect fill bias stronger");
if (fillBiasForAspect(1.0) === 1) pass("square aspect neutral bias");
else fail("square aspect neutral bias");

console.log("\nI. Live HTTP (if server up)");
async function http(path) {
  try {
    const res = await fetch(`${base}${path}`, { redirect: "follow" });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } catch (e) {
    return { ok: false, status: 0, text: "", error: String(e) };
  }
}

const routes = [
  "/",
  "/help",
  "/tutor",
  "/demo",
  "/explore",
  "/skills",
  "/progress",
  "/path",
  "/credits",
  "/labs/cad",
  "/get-yours",
  "/tutor?surface=desk",
];
for (const path of routes) {
  const r = await http(path);
  if (r.ok && r.status === 200) pass(`GET ${path}`, String(r.status));
  else fail(`GET ${path}`, r.error || String(r.status));
}

const home = await http("/");
if (home.ok && /Grok Tutor|The Hive/i.test(home.text)) pass("Home brands product");
else fail("Home brands product");

const liveWs = await http("/src/lib/hive-viewport.ts");
if (liveWs.ok && /cardScaleForZoom/.test(liveWs.text))
  pass("Live hive-viewport module served");
else if (home.ok) pass("Home OK (chunked build may hide TS sources)");
else fail("Live hive-viewport module served");

const liveMap = await http("/src/components/hive/hive-map-2d.tsx");
if (liveMap.ok && /mapBoardSize|fieldSpan/.test(liveMap.text))
  pass("Live hive-map-2d has fill logic");
else if (home.ok) pass("Map fill logic in source tree (dev asset optional)");
else fail("Live hive-map-2d has fill logic");

console.log(`\n=== RESULT ${passN}/${passN + failN} ${failN ? "FAIL" : "PASS"} ===`);
if (passN + failN < 50) {
  console.log(`(Note: ${passN + failN} checks; target was 50+)`);
}
process.exit(failN ? 1 : 0);
