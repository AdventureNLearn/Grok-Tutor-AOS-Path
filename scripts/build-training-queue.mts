/**
 * Build tiered training-material queue after live runs stop.
 * Selects best unique lesson per industry × mode (+ pins).
 * Does NOT polish — only maps/export candidates.
 *
 *   tsx scripts/build-training-queue.mts
 *   tsx scripts/build-training-queue.mts --export
 *   tsx scripts/build-training-queue.mts --export --polish
 */
import { createHash } from "node:crypto";
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  statSync,
  existsSync,
  copyFileSync,
  appendFileSync,
} from "node:fs";
import { dirname, join, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { INDUSTRIES } from "../src/lib/industries.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const corpusRoot = join(root, "public", "corpus");
const logRoot = "C:\\AOS\\logs\\corpus-post7";
const DO_EXPORT = process.argv.includes("--export");
const DO_POLISH = process.argv.includes("--polish");

const MODES_PASS1 = ["explain", "practice", "scenario"] as const;
const MODES_PASS2 = [
  "explain",
  "practice",
  "scenario",
  "socratic",
  "quiz",
  "career",
] as const;

/** Tier order from POST-7AM-TIERED-POLISH-QUEUE.md */
const TIER_A = [
  "electrical",
  "plumbing",
  "hvac",
  "welding",
  "construction",
  "carpentry",
  "nursing",
  "emt",
  "pharmacy",
  "cybersecurity",
  "it-support",
  "cnc",
  "automotive",
  "energy",
  "culinary",
];
const TIER_B = [
  "software",
  "data",
  "quality",
  "accounting",
  "sales",
  "project-management",
  "hospitality",
  "teaching",
  "design",
  "video",
  "logistics",
  "agriculture",
];
const TIER_C = [
  "civic-intelligence",
  "media-literacy",
  "law-enforcement",
  "cdl",
  "aviation",
];

const SOURCE_RANK: Record<string, number> = {
  "reasoning-tracks": 1,
  "full-spectrum": 2,
  _polished: 3,
  "perfect-overnight": 4,
  "balanced-soak": 5,
  other: 9,
};

type Cand = {
  path: string;
  rel: string;
  source: string;
  industryId: string;
  mode: string;
  scoreMin: number;
  bytes: number;
  hash: string;
};

function log(msg: string) {
  mkdirSync(logRoot, { recursive: true });
  const line = `${new Date().toISOString()} ${msg}`;
  appendFileSync(join(logRoot, "pipeline.log"), line + "\n", "utf8");
  console.log(msg);
}

function walkMd(dir: string, acc: string[] = [], maxDepth = 8, depth = 0): string[] {
  if (!existsSync(dir) || depth > maxDepth) return acc;
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of names) {
    if (name.startsWith(".") || name === "node_modules") continue;
    const p = join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (name === "_unique_queue" || name === "READY-PUBLIC" || name === "READY-INTERNAL")
        continue;
      walkMd(p, acc, maxDepth, depth + 1);
    } else if (
      name.endsWith(".md") &&
      !["REPORT.md", "README.md", "SYSTEM_COUNTS.md", "INDEX.md", "SUMMARY.md", "COVERAGE.md"].includes(
        name,
      )
    ) {
      acc.push(p);
    }
  }
  return acc;
}

function parseFront(raw: string): Record<string, string> {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const out: Record<string, string> = {};
  for (const line of m[1]!.split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i < 0) continue;
    out[line.slice(0, i).trim()] = line
      .slice(i + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
  }
  return out;
}

function bodyOnly(raw: string): string {
  const m = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/);
  return m ? m[1]! : raw;
}

function normalize(s: string): string {
  return s
    .replace(/generatedAt:.*$/gim, "")
    .replace(/polishedAt:.*$/gim, "")
    .replace(/cycle:\s*\d+/gi, "")
    .replace(/c\d{3,}/gi, "cN")
    .replace(/lap\d+/gi, "lapN")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function sourceOf(rel: string): string {
  const top = rel.replace(/\\/g, "/").split("/")[0] || "other";
  if (top === "_polished") {
    // _polished/balanced-soak/... → prefer polished rank but keep leaf source
    return "_polished";
  }
  return SOURCE_RANK[top] != null ? top : "other";
}

function detectMode(fm: Record<string, string>, rel: string, name: string): string {
  if (fm.mode && MODES_PASS2.includes(fm.mode as (typeof MODES_PASS2)[number]))
    return fm.mode;
  const n = (name + " " + rel).toLowerCase();
  for (const m of MODES_PASS2) {
    if (n.includes(m)) return m;
  }
  // full-spectrum multi-mode lessons
  if (rel.includes("full-spectrum") || name.includes("spectrum")) return "multi";
  if (rel.includes("reasoning-tracks")) return "track";
  return "";
}

function detectIndustry(
  fm: Record<string, string>,
  rel: string,
): string {
  if (fm.industryId) return fm.industryId;
  const parts = rel.replace(/\\/g, "/").split("/");
  // .../balanced-soak/electrical/file.md
  for (const p of parts) {
    if (INDUSTRIES.some((i) => i.id === p)) return p;
  }
  return "";
}

function rankSource(source: string): number {
  return SOURCE_RANK[source] ?? 9;
}

function better(a: Cand, b: Cand): Cand {
  const ra = rankSource(a.source);
  const rb = rankSource(b.source);
  if (ra !== rb) return ra < rb ? a : b;
  if (a.scoreMin !== b.scoreMin) return a.scoreMin > b.scoreMin ? a : b;
  if (a.bytes !== b.bytes) return a.bytes > b.bytes ? a : b;
  return a;
}

function loadCand(path: string): Cand | null {
  try {
    const raw = readFileSync(path, "utf8");
    const fm = parseFront(raw);
    const rel = relative(corpusRoot, path).replace(/\\/g, "/");
    const name = basename(path);
    const industryId = detectIndustry(fm, rel);
    const mode = detectMode(fm, rel, name);
    const body = bodyOnly(raw);
    const hash = createHash("sha256")
      .update(normalize(body))
      .digest("hex")
      .slice(0, 16);
    const scoreMin = Number(fm.scoreMin || fm.qualityAvg || 0) || 0;
    return {
      path,
      rel,
      source: sourceOf(rel),
      industryId,
      mode,
      scoreMin,
      bytes: raw.length,
      hash,
    };
  } catch {
    return null;
  }
}

// ── build candidate pools (stratified, not full 5M walk if too slow) ──
log("=== build-training-queue START ===");
mkdirSync(logRoot, { recursive: true });

const industryIds = INDUSTRIES.map((i) => i.id);
const tierOf = (id: string): string => {
  if (TIER_A.includes(id)) return "A";
  if (TIER_B.includes(id)) return "B";
  if (TIER_C.includes(id)) return "C";
  return "X";
};
const industryOrder = [...TIER_A, ...TIER_B, ...TIER_C];
// ensure full coverage — any missing industry appended
for (const id of industryIds) {
  if (!industryOrder.includes(id)) industryOrder.push(id);
}

type Slot = {
  slot: string;
  tier: string;
  industryId: string;
  mode: string;
  pass: number;
  status: string;
  sourcePath: string;
  rel: string;
  source: string;
  hash: string;
  scoreMin: number;
  bytes: number;
  notes: string;
};

const slots: Slot[] = [];
const globalBestByHash = new Map<string, Cand>(); // entire selection dedupe
let scanned = 0;
let parseFail = 0;

/** Scan a directory tree for candidates; keep best per industry|mode and track hashes */
function ingestTree(dir: string, label: string, perIndustryCap = 80) {
  if (!existsSync(dir)) {
    log(`skip missing ${label}`);
    return;
  }
  log(`scan ${label}...`);
  const files = walkMd(dir);
  log(`  files=${files.length}`);
  // For huge perfect-overnight, prefer per-industry subdirs
  const byIndMode = new Map<string, Cand[]>();
  for (const f of files) {
    scanned++;
    const c = loadCand(f);
    if (!c) {
      parseFail++;
      continue;
    }
    // register global hash best
    const prevH = globalBestByHash.get(c.hash);
    if (!prevH) globalBestByHash.set(c.hash, c);
    else globalBestByHash.set(c.hash, better(prevH, c));

    if (!c.industryId || !c.mode) continue;
    if (c.mode === "multi" || c.mode === "track") continue;
    const key = `${c.industryId}|${c.mode}`;
    if (!byIndMode.has(key)) byIndMode.set(key, []);
    const arr = byIndMode.get(key)!;
    arr.push(c);
  }
  // keep top per key by rank (sort later at select)
  for (const [key, arr] of byIndMode) {
    arr.sort((a, b) => {
      const d = rankSource(a.source) - rankSource(b.source);
      if (d !== 0) return d;
      if (b.scoreMin !== a.scoreMin) return b.scoreMin - a.scoreMin;
      return b.bytes - a.bytes;
    });
    byIndMode.set(key, arr.slice(0, perIndustryCap));
  }
  // stash on global for selection
  (ingestTree as unknown as { pool?: Map<string, Cand[]> }).pool ??= new Map();
  const pool = (ingestTree as unknown as { pool: Map<string, Cand[]> }).pool;
  for (const [k, arr] of byIndMode) {
    if (!pool.has(k)) pool.set(k, []);
    pool.get(k)!.push(...arr);
  }
  log(`  ${label} done keys=${byIndMode.size}`);
}

// Pins + structured sources first (smaller)
ingestTree(join(corpusRoot, "reasoning-tracks"), "reasoning-tracks", 20);
ingestTree(join(corpusRoot, "full-spectrum"), "full-spectrum", 20);
ingestTree(join(corpusRoot, "_polished"), "_polished", 40);
ingestTree(join(corpusRoot, "balanced-soak"), "balanced-soak", 40);

// Perfect: per-industry flat listing, cap samples per mode (do not walk all 5M)
const perfectRoot = join(corpusRoot, "perfect-overnight");
const PERFECT_PER_MODE_CAP = 25;
if (existsSync(perfectRoot)) {
  log("scan perfect-overnight per-industry (capped samples)...");
  (ingestTree as unknown as { pool: Map<string, Cand[]> }).pool ??= new Map();
  const poolRef = (ingestTree as unknown as { pool: Map<string, Cand[]> }).pool;
  for (const id of industryOrder) {
    const d = join(perfectRoot, id);
    if (!existsSync(d)) continue;
    let names: string[] = [];
    try {
      names = readdirSync(d).filter((n) => n.endsWith(".md"));
    } catch {
      continue;
    }
    // bucket by mode from filename quickly
    const byMode: Record<string, string[]> = {};
    for (const name of names) {
      const lower = name.toLowerCase();
      let mode = "";
      for (const m of MODES_PASS2) {
        if (lower.includes(m)) {
          mode = m;
          break;
        }
      }
      if (!mode) continue;
      if (!byMode[mode]) byMode[mode] = [];
      // prefer higher lap numbers roughly by sorting later — take spread
      byMode[mode]!.push(name);
    }
    let n = 0;
    for (const mode of MODES_PASS2) {
      const list = byMode[mode] || [];
      if (!list.length) continue;
      // sample evenly across list
      const step = Math.max(1, Math.floor(list.length / PERFECT_PER_MODE_CAP));
      const picked: string[] = [];
      for (let i = 0; i < list.length && picked.length < PERFECT_PER_MODE_CAP; i += step) {
        picked.push(list[i]!);
      }
      for (const name of picked) {
        const f = join(d, name);
        scanned++;
        n++;
        const c = loadCand(f);
        if (!c) {
          parseFail++;
          continue;
        }
        if (!c.industryId) c.industryId = id;
        if (!c.mode) c.mode = mode;
        const prevH = globalBestByHash.get(c.hash);
        if (!prevH) globalBestByHash.set(c.hash, c);
        else globalBestByHash.set(c.hash, better(prevH, c));
        const key = `${c.industryId}|${c.mode}`;
        if (!poolRef.has(key)) poolRef.set(key, []);
        poolRef.get(key)!.push(c);
      }
    }
    if (n > 0) log(`  perfect/${id} sampled=${n} listed=${names.length}`);
  }
}

const pool =
  (ingestTree as unknown as { pool?: Map<string, Cand[]> }).pool ||
  new Map<string, Cand[]>();

// Finalize pool sorts
for (const [k, arr] of pool) {
  arr.sort((a, b) => {
    const d = rankSource(a.source) - rankSource(b.source);
    if (d !== 0) return d;
    if (b.scoreMin !== a.scoreMin) return b.scoreMin - a.scoreMin;
    return b.bytes - a.bytes;
  });
  // unique by hash within key
  const seen = new Set<string>();
  const uniq: Cand[] = [];
  for (const c of arr) {
    if (seen.has(c.hash)) continue;
    seen.add(c.hash);
    uniq.push(c);
  }
  pool.set(k, uniq);
}

const usedHashes = new Set<string>();

function pick(industryId: string, mode: string, pass: number, tier: string): Slot {
  const key = `${industryId}|${mode}`;
  const arr = pool.get(key) || [];
  let chosen: Cand | null = null;
  for (const c of arr) {
    if (usedHashes.has(c.hash)) continue;
    chosen = c;
    break;
  }
  const slotId = `${tier}${industryId}-${mode}`;
  if (!chosen) {
    return {
      slot: slotId,
      tier,
      industryId,
      mode,
      pass,
      status: "gap",
      sourcePath: "",
      rel: "",
      source: "",
      hash: "",
      scoreMin: 0,
      bytes: 0,
      notes: "no unique candidate",
    };
  }
  usedHashes.add(chosen.hash);
  return {
    slot: slotId,
    tier,
    industryId,
    mode,
    pass,
    status: "queued",
    sourcePath: chosen.path,
    rel: chosen.rel,
    source: chosen.source,
    hash: chosen.hash,
    scoreMin: chosen.scoreMin,
    bytes: chosen.bytes,
    notes: "",
  };
}

// Pins
const pins: Slot[] = [];
// reasoning tracks
const trackDir = join(corpusRoot, "reasoning-tracks");
if (existsSync(trackDir)) {
  for (const f of walkMd(trackDir)) {
    const c = loadCand(f);
    if (!c) continue;
    if (usedHashes.has(c.hash)) continue;
    usedHashes.add(c.hash);
    pins.push({
      slot: `PIN-track-${basename(f, ".md")}`,
      tier: "PIN",
      industryId: c.industryId || "multi",
      mode: "track",
      pass: 0,
      status: "queued",
      sourcePath: c.path,
      rel: c.rel,
      source: c.source,
      hash: c.hash,
      scoreMin: c.scoreMin,
      bytes: c.bytes,
      notes: "reasoning-track pin",
    });
  }
}
// full-spectrum
const specDir = join(corpusRoot, "full-spectrum");
if (existsSync(specDir)) {
  for (const f of walkMd(specDir)) {
    const c = loadCand(f);
    if (!c) continue;
    if (usedHashes.has(c.hash)) continue;
    usedHashes.add(c.hash);
    pins.push({
      slot: `PIN-spectrum-${c.industryId || basename(f, ".md")}`,
      tier: "PIN",
      industryId: c.industryId || "multi",
      mode: "multi",
      pass: 0,
      status: "queued",
      sourcePath: c.path,
      rel: c.rel,
      source: c.source,
      hash: c.hash,
      scoreMin: c.scoreMin,
      bytes: c.bytes,
      notes: "full-spectrum pin",
    });
  }
}

// Pass 1
for (const id of industryOrder) {
  const tier = tierOf(id);
  for (const mode of MODES_PASS1) {
    slots.push(pick(id, mode, 1, tier));
  }
}
// Pass 2 — remaining modes (and re-fill pass1 gaps already as gap)
for (const id of industryOrder) {
  const tier = tierOf(id);
  for (const mode of MODES_PASS2) {
    if ((MODES_PASS1 as readonly string[]).includes(mode)) continue;
    slots.push(pick(id, mode, 2, tier));
  }
}
// Pass 3 — Tier A depth +3 extra uniques any mode (not just +6 to keep 11am realistic)
const pass3: Slot[] = [];
for (const id of TIER_A) {
  const tier = "A";
  let added = 0;
  for (const mode of MODES_PASS2) {
    if (added >= 3) break;
    const key = `${id}|${mode}`;
    const arr = pool.get(key) || [];
    for (const c of arr) {
      if (usedHashes.has(c.hash)) continue;
      usedHashes.add(c.hash);
      pass3.push({
        slot: `A-depth-${id}-${mode}-${added + 1}`,
        tier,
        industryId: id,
        mode,
        pass: 3,
        status: "queued",
        sourcePath: c.path,
        rel: c.rel,
        source: c.source,
        hash: c.hash,
        scoreMin: c.scoreMin,
        bytes: c.bytes,
        notes: "tier-A depth",
      });
      added++;
      if (added >= 3) break;
    }
  }
}

const allSlots = [...pins, ...slots, ...pass3];
const queued = allSlots.filter((s) => s.status === "queued");
const gaps = allSlots.filter((s) => s.status === "gap");

const summary = {
  at: new Date().toISOString(),
  scanned,
  parseFail,
  globalUniqueHashesSeen: globalBestByHash.size,
  pins: pins.length,
  pass1Slots: industryOrder.length * MODES_PASS1.length,
  pass2ExtraSlots: industryOrder.length * (MODES_PASS2.length - MODES_PASS1.length),
  pass3Slots: pass3.length,
  totalSlots: allSlots.length,
  queued: queued.length,
  gaps: gaps.length,
  UNIQUE_QUEUED: queued.length,
  DUPES_SKIPPED_NOTE:
    "Selection skipped already-used hashes; full corpus unique map size = globalUniqueHashesSeen",
  industries: industryOrder.length,
  doExport: DO_EXPORT,
  doPolish: DO_POLISH,
};

// Write manifests
writeFileSync(
  join(logRoot, "QUEUE-MANIFEST.jsonl"),
  allSlots.map((s) => JSON.stringify(s)).join("\n") + "\n",
  "utf8",
);
writeFileSync(join(logRoot, "QUEUE-SUMMARY.json"), JSON.stringify(summary, null, 2), "utf8");

// Coverage grid markdown
const lines: string[] = [
  `# Training material queue manifest`,
  ``,
  `**At:** ${summary.at}`,
  ``,
  `## Counts`,
  ``,
  `| Metric | Count |`,
  `| --- | ---: |`,
  `| Files scanned | ${scanned} |`,
  `| Global unique hashes seen | ${globalBestByHash.size} |`,
  `| **UNIQUE_QUEUED** | **${queued.length}** |`,
  `| **GAPS** | **${gaps.length}** |`,
  `| Pins | ${pins.length} |`,
  `| Pass 1+2 industry slots | ${slots.length} |`,
  `| Pass 3 depth | ${pass3.length} |`,
  ``,
  `## Coverage grid (Pass 1–2)`,
  ``,
  `| Industry | Tier | explain | practice | scenario | socratic | quiz | career |`,
  `| --- | --- | --- | --- | --- | --- | --- | --- |`,
];

for (const id of industryOrder) {
  const tier = tierOf(id);
  const cells = MODES_PASS2.map((m) => {
    const s = slots.find((x) => x.industryId === id && x.mode === m);
    if (!s) return "—";
    if (s.status === "gap") return "GAP";
    return s.source.slice(0, 8);
  });
  lines.push(`| ${id} | ${tier} | ${cells.join(" | ")} |`);
}

lines.push(``, `## Gaps`, ``);
if (!gaps.length) lines.push(`_None_`);
else for (const g of gaps) lines.push(`- \`${g.slot}\` ${g.industryId}/${g.mode}`);

lines.push(``, `## Pins`, ``);
for (const p of pins) {
  lines.push(`- **${p.slot}** ← \`${p.rel}\` score=${p.scoreMin}`);
}

writeFileSync(join(logRoot, "QUEUE-MANIFEST.md"), lines.join("\n"), "utf8");
writeFileSync(
  join(logRoot, "GAPS.md"),
  gaps.length
    ? gaps.map((g) => `- ${g.slot} ${g.industryId}/${g.mode}`).join("\n") + "\n"
    : "None\n",
  "utf8",
);

log(`QUEUE unique=${queued.length} gaps=${gaps.length} scanned=${scanned}`);

// Export queue files for training material
const queueOut = join(corpusRoot, "_training_queue");
const trainingOut = join(corpusRoot, "_training_material");
if (DO_EXPORT) {
  mkdirSync(queueOut, { recursive: true });
  let exported = 0;
  for (const s of queued) {
    if (!s.sourcePath || !existsSync(s.sourcePath)) continue;
    const destDir = join(queueOut, s.tier || "X", s.industryId || "multi", s.mode || "na");
    mkdirSync(destDir, { recursive: true });
    const dest = join(destDir, basename(s.sourcePath));
    try {
      copyFileSync(s.sourcePath, dest);
      exported++;
      s.status = "exported";
    } catch (e) {
      s.notes = String((e as Error).message || e).slice(0, 100);
      s.status = "export-fail";
    }
  }
  writeFileSync(
    join(logRoot, "QUEUE-MANIFEST.jsonl"),
    allSlots.map((s) => JSON.stringify(s)).join("\n") + "\n",
    "utf8",
  );
  log(`EXPORTED ${exported} files -> ${queueOut}`);
  summary.exported = exported;
  writeFileSync(join(logRoot, "QUEUE-SUMMARY.json"), JSON.stringify(summary, null, 2), "utf8");
}

// Optional polish via spawning note — actual polish done by separate process if --polish
if (DO_POLISH) {
  writeFileSync(
    join(logRoot, "POLISH-REQUESTED.json"),
    JSON.stringify({ at: new Date().toISOString(), queueOut, trainingOut, queued: queued.length }, null, 2),
    "utf8",
  );
  log("POLISH flag set — run polish-training-queue next");
}

log("=== build-training-queue DONE ===");
console.log(JSON.stringify(summary, null, 2));
process.exit(0);
