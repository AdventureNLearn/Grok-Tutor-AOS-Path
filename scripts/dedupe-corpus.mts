/**
 * Dedupe Grok Tutor simulation corpus every N minutes (or on demand).
 *
 * - Scans all lesson sources under public/corpus/**
 * - Fingerprints normalized content (ignores timestamps / cycle ids)
 * - Keeps best copy (higher score, longer body); archives duplicates offline
 * - Writes TOTALS: system-wide + active soak run
 * - Portable offline mirror under C:\AOS\logs\tutor-corpus-portable\
 *
 *   tsx scripts/dedupe-corpus.mts
 *   tsx scripts/dedupe-corpus.mts --dry-run
 */
import { createHash } from "node:crypto";
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  statSync,
  copyFileSync,
  renameSync,
  existsSync,
  appendFileSync,
} from "node:fs";
import { dirname, join, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const DRY = process.argv.includes("--dry-run");

const corpusRoot = join(root, "public", "corpus");
const livePath = join(root, "public", "soak", "LIVE.json");
const portableRoot = join("C:\\AOS\\logs", "tutor-corpus-portable");
const archiveDupRoot = join(portableRoot, "duplicates");
const runsArchive = join(portableRoot, "sim-output-archive");
const countsPath = join(corpusRoot, "SYSTEM_COUNTS.json");
const countsMd = join(corpusRoot, "SYSTEM_COUNTS.md");
const dedupeLog = join(portableRoot, "dedupe-history.jsonl");
const stamp = new Date().toISOString().replace(/[:.]/g, "-");

type LessonRec = {
  path: string;
  rel: string;
  source: string; // balanced-soak | full-spectrum | reasoning-tracks | other
  industryId: string;
  mode: string;
  skillId: string;
  shape: string;
  orch: string;
  score: number;
  bytes: number;
  hash: string;
  bodyHash: string;
};

function walkMd(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    if (name.startsWith("_") || name === "node_modules") continue;
    const p = join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walkMd(p, acc);
    else if (name.endsWith(".md") && name !== "README.md" && name !== "SYSTEM_COUNTS.md")
      acc.push(p);
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
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    out[k] = v;
  }
  return out;
}

function normalizeBody(raw: string): string {
  let body = raw.replace(/^---[\s\S]*?---\r?\n/, "");
  // drop volatile lines
  body = body
    .replace(/generatedAt:.*$/gim, "")
    .replace(/qualityAvg:.*$/gim, "")
    .replace(/scoreMin:.*$/gim, "")
    .replace(/repaired:.*$/gim, "")
    .replace(/pass:.*$/gim, "")
    .replace(/cycle[^\n]*/gi, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .toLowerCase();
  return body;
}

function sha(s: string): string {
  return createHash("sha256").update(s, "utf8").digest("hex").slice(0, 24);
}

function sourceOf(rel: string): string {
  if (rel.startsWith("balanced-soak")) return "balanced-soak";
  if (rel.startsWith("full-spectrum")) return "full-spectrum";
  if (rel.startsWith("reasoning-tracks")) return "reasoning-tracks";
  return "other";
}

function loadLessons(): LessonRec[] {
  const files = walkMd(corpusRoot);
  const out: LessonRec[] = [];
  for (const path of files) {
    let raw: string;
    try {
      raw = readFileSync(path, "utf8");
    } catch {
      continue;
    }
    if (raw.length < 80) continue;
    const fm = parseFront(raw);
    const body = normalizeBody(raw);
    const bodyHash = sha(body);
    // identity: industry+mode+skill+shape+body (content-addressed)
    const industryId =
      fm.industryId ||
      fm.id?.replace(/^spectrum-/, "") ||
      basename(dirname(path));
    const mode = fm.mode || "multi";
    const skillId = fm.skillId || (fm.skillIds || "").replace(/[\[\]\"]/g, "").split(",")[0] || "";
    const shape = fm.shape || fm.hiveShape || "";
    const orch = fm.orchScenario || "";
    const score = Number(fm.scoreMin || fm.qualityAvg || fm.quality || 0) || 0;
    // Slot key: collapses near-dupes from continuous cycles (same craft/mode/tool/shape)
    const slotKey = sha(
      [industryId, mode, skillId || "na", shape || "na", sourceOf(relative(corpusRoot, path).replace(/\\/g, "/"))].join("|"),
    );
    // Exact content key
    const contentKey = sha([industryId, mode, bodyHash].join("|"));
    const rel = relative(corpusRoot, path).replace(/\\/g, "/");
    out.push({
      path,
      rel,
      source: sourceOf(rel),
      industryId,
      mode,
      skillId,
      shape,
      orch,
      score,
      bytes: raw.length,
      hash: slotKey, // primary dedupe dimension
      bodyHash: contentKey,
    });
  }
  return out;
}

function ensureDir(p: string) {
  mkdirSync(p, { recursive: true });
}

function countBy(arr: LessonRec[], key: keyof LessonRec): Record<string, number> {
  const o: Record<string, number> = {};
  for (const r of arr) {
    const k = String(r[key] || "unknown");
    o[k] = (o[k] || 0) + 1;
  }
  return o;
}

// ── Main ────────────────────────────────────────────────
console.log(`\nCorpus dedupe ${DRY ? "(DRY RUN)" : ""}`);
console.log(`Corpus: ${corpusRoot}\n`);

ensureDir(portableRoot);
ensureDir(archiveDupRoot);
ensureDir(runsArchive);
ensureDir(join(archiveDupRoot, stamp));

const all = loadLessons();
console.log(`Scanned lessons: ${all.length}`);

// Pass 1: slot dedupe (industry|mode|skill|shape|source) — continuous soak near-dupes
// Pass 2: content dedupe across sources (same dialogue body)
function collapse(
  items: LessonRec[],
  keyFn: (L: LessonRec) => string,
): { kept: LessonRec[]; dupes: number; moved: number; removed: { keep: string; drop: string; hash: string }[] } {
  const groups = new Map<string, LessonRec[]>();
  for (const L of items) {
    const k = keyFn(L);
    const g = groups.get(k) || [];
    g.push(L);
    groups.set(k, g);
  }
  const kept: LessonRec[] = [];
  let dupes = 0;
  let moved = 0;
  const removed: { keep: string; drop: string; hash: string }[] = [];
  for (const [hash, group] of groups) {
    group.sort(
      (a, b) => b.score - a.score || b.bytes - a.bytes || a.rel.localeCompare(b.rel),
    );
    const winner = group[0]!;
    kept.push(winner);
    for (let i = 1; i < group.length; i++) {
      const d = group[i]!;
      dupes++;
      removed.push({ keep: winner.rel, drop: d.rel, hash });
      if (!DRY) {
        const destDir = join(archiveDupRoot, stamp, d.source);
        ensureDir(destDir);
        let dest = join(destDir, `${d.industryId}__${basename(d.path)}`);
        if (existsSync(dest)) dest = join(destDir, `${Date.now()}_${basename(d.path)}`);
        try {
          renameSync(d.path, dest);
          moved++;
        } catch {
          try {
            copyFileSync(d.path, dest);
            moved++;
          } catch (e) {
            console.warn("could not archive", d.rel, e);
          }
        }
      }
    }
  }
  return { kept, dupes, moved, removed };
}

const pass1 = collapse(all, (L) => L.hash);
const pass2 = collapse(pass1.kept, (L) => L.bodyHash);
const kept = pass2.kept;
const unique = kept.length;
const dupes = pass1.dupes + pass2.dupes;
const moved = pass1.moved + pass2.moved;
const removed = [...pass1.removed, ...pass2.removed];

// Active run from LIVE
let active: Record<string, unknown> = {};
if (existsSync(livePath)) {
  try {
    active = JSON.parse(readFileSync(livePath, "utf8"));
  } catch {
    active = {};
  }
}

// Portable mirror of unique corpus (always refresh index + copy kept lessons summary)
const portableCorpus = join(portableRoot, "corpus-unique");
ensureDir(portableCorpus);
if (!DRY) {
  // light index only + copy kept files preserving structure
  for (const L of kept) {
    const dest = join(portableCorpus, L.rel);
    ensureDir(dirname(dest));
    try {
      copyFileSync(L.path, dest);
    } catch {
      /* may already be moved if winner was wrong path - skip */
    }
  }
  // archive sim-output snapshots (reports only + latest)
  const simOut = join(root, "scripts", "sim-output");
  if (existsSync(simOut)) {
    const destSim = join(runsArchive, stamp);
    ensureDir(destSim);
    // copy LATEST jsons and REPORT.md files
    function copyReports(dir: string, depth = 0) {
      if (depth > 5) return;
      let names: string[];
      try {
        names = readdirSync(dir);
      } catch {
        return;
      }
      for (const name of names) {
        const p = join(dir, name);
        let st;
        try {
          st = statSync(p);
        } catch {
          continue;
        }
        if (st.isDirectory()) copyReports(p, depth + 1);
        else if (
          /LATEST|SUMMARY|REPORT|MATRIX|COVERAGE|SYSTEM_COUNTS|e2e-.*report/i.test(name) ||
          (name.endsWith(".json") && st.size < 2_000_000) ||
          (name.endsWith(".md") && st.size < 500_000)
        ) {
          const rel = relative(simOut, p);
          const d = join(destSim, rel);
          ensureDir(dirname(d));
          try {
            copyFileSync(p, d);
          } catch {
            /* ignore */
          }
        }
      }
    }
    copyReports(simOut);
  }
}

const system = {
  at: new Date().toISOString(),
  dryRun: DRY,
  scanned: all.length,
  unique,
  duplicatesFound: dupes,
  duplicatesArchived: DRY ? 0 : moved,
  bySource: countBy(kept, "source"),
  byIndustry: countBy(kept, "industryId"),
  byMode: countBy(kept, "mode"),
  byShape: countBy(
    kept.map((k) => ({ ...k, shape: k.shape || "n/a" })),
    "shape",
  ),
  bytesUnique: kept.reduce((s, k) => s + k.bytes, 0),
  portableRoot,
  archiveDupRoot: join(archiveDupRoot, stamp),
};

const activeRun = {
  engine: (active as { engine?: string }).engine || null,
  cycles: (active as { cycles?: number }).cycles || 0,
  lessonsWritten: (active as { lessonsWritten?: number }).lessonsWritten || 0,
  pass: (active as { pass?: number }).pass || 0,
  soft: (active as { soft?: number }).soft || 0,
  fail: (active as { fail?: number }).fail || 0,
  suitesComplete: (active as { suitesComplete?: number }).suitesComplete || 0,
  repairs: (active as { repairs?: number }).repairs || 0,
  updatedAt: (active as { updatedAt?: string }).updatedAt || null,
  coverage: (active as { coverage?: unknown }).coverage || null,
  lastMessage: (active as { lastMessage?: string }).lastMessage || null,
};

const totals = {
  generatedAt: system.at,
  system,
  activeRun,
  note:
    "system = deduped unique lessons across all corpus folders. activeRun = current LIVE soak counters (may include pre-dedupe writes).",
};

writeFileSync(countsPath, JSON.stringify(totals, null, 2), "utf8");
writeFileSync(
  join(portableRoot, "SYSTEM_COUNTS.json"),
  JSON.stringify(totals, null, 2),
  "utf8",
);

const md = [
  `# Tutor corpus system counts`,
  ``,
  `- At: ${system.at}`,
  `- Dry run: ${DRY}`,
  ``,
  `## System (deduped unique lessons)`,
  ``,
  `| Metric | Value |`,
  `|---|---:|`,
  `| Scanned files | ${system.scanned} |`,
  `| **Unique lessons** | **${system.unique}** |`,
  `| Duplicates found | ${system.duplicatesFound} |`,
  `| Duplicates archived | ${system.duplicatesArchived} |`,
  `| Unique bytes | ${system.bytesUnique} |`,
  ``,
  `### By source`,
  ``,
  ...Object.entries(system.bySource)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `- **${k}**: ${v}`),
  ``,
  `### By mode`,
  ``,
  ...Object.entries(system.byMode)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `- **${k}**: ${v}`),
  ``,
  `### By industry (top 15)`,
  ``,
  ...Object.entries(system.byIndustry)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([k, v]) => `- **${k}**: ${v}`),
  ``,
  `## Active soak run (LIVE.json)`,
  ``,
  `| Metric | Value |`,
  `|---|---|`,
  `| Engine | ${activeRun.engine} |`,
  `| Cycles | ${activeRun.cycles} |`,
  `| Lessons written (run) | ${activeRun.lessonsWritten} |`,
  `| Pass / soft / fail | ${activeRun.pass} / ${activeRun.soft} / ${activeRun.fail} |`,
  `| Balance laps | ${activeRun.suitesComplete} |`,
  `| Updated | ${activeRun.updatedAt} |`,
  `| Last | ${activeRun.lastMessage} |`,
  ``,
  `## Offline portability`,
  ``,
  `- Portable root: \`${portableRoot}\``,
  `- Unique corpus mirror: \`corpus-unique/\``,
  `- Duplicates archive: \`${system.archiveDupRoot}\``,
  `- Sim-output reports archive: \`sim-output-archive/${stamp}/\``,
  ``,
];
writeFileSync(countsMd, md.join("\n"), "utf8");
writeFileSync(join(portableRoot, "SYSTEM_COUNTS.md"), md.join("\n"), "utf8");

appendFileSync(
  dedupeLog,
  JSON.stringify({
    at: system.at,
    scanned: system.scanned,
    unique: system.unique,
    duplicatesFound: system.duplicatesFound,
    duplicatesArchived: system.duplicatesArchived,
    dryRun: DRY,
  }) + "\n",
  "utf8",
);

// Patch LIVE.json with systemTotals (do not clobber active engine fields)
if (existsSync(livePath) && !DRY) {
  try {
    const live = JSON.parse(readFileSync(livePath, "utf8"));
    live.systemTotals = {
      uniqueLessons: system.unique,
      scannedFiles: system.scanned,
      duplicatesRemoved: system.duplicatesArchived,
      bySource: system.bySource,
      byMode: system.byMode,
      lastDedupeAt: system.at,
      portableRoot,
    };
    live.activeRun = {
      cycles: live.cycles,
      lessonsWritten: live.lessonsWritten,
      pass: live.pass,
      soft: live.soft,
    };
    writeFileSync(livePath, JSON.stringify(live, null, 2), "utf8");
  } catch (e) {
    console.warn("LIVE patch soft-fail", e);
  }
}

console.log(`Unique: ${unique} · Dupes: ${dupes} · Archived: ${moved}`);
console.log(`System counts → ${countsPath}`);
console.log(`Portable → ${portableRoot}`);
console.log(`Active run lessonsWritten=${activeRun.lessonsWritten} cycles=${activeRun.cycles}\n`);
console.log(md.slice(0, 40).join("\n"));

process.exit(0);
