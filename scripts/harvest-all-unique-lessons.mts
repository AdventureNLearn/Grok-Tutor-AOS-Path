/**
 * Harvest ALL produced lessons → one best file per content hash.
 * Walks entire corpus (perfect, soak, spectrum, tracks, polished).
 * Does not polish — writes unique index + optional export.
 *
 *   tsx scripts/harvest-all-unique-lessons.mts
 *   tsx scripts/harvest-all-unique-lessons.mts --export
 *   tsx scripts/harvest-all-unique-lessons.mts --export --resume
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
  createWriteStream,
} from "node:fs";
import { dirname, join, relative, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const corpusRoot = join(root, "public", "corpus");
const logRoot = "C:\\AOS\\logs\\corpus-all-unique";
const DO_EXPORT = process.argv.includes("--export");
const RESUME = process.argv.includes("--resume");

const SOURCE_RANK: Record<string, number> = {
  "reasoning-tracks": 1,
  "full-spectrum": 2,
  _polished: 3,
  "_training_material": 3,
  "perfect-overnight": 4,
  "balanced-soak": 5,
  other: 9,
};

type Best = {
  hash: string;
  path: string;
  rel: string;
  source: string;
  industryId: string;
  mode: string;
  scoreMin: number;
  bytes: number;
};

function log(msg: string) {
  mkdirSync(logRoot, { recursive: true });
  const line = `${new Date().toISOString()} ${msg}`;
  appendFileSync(join(logRoot, "harvest.log"), line + "\n", "utf8");
  console.log(msg);
}

function walkMd(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of names) {
    if (name.startsWith(".") || name === "node_modules") continue;
    // skip output folders of this pipeline to avoid feedback loops mid-run
    if (
      name === "_training_queue" ||
      name === "_unique_all" ||
      name === "READY-PUBLIC" ||
      name === "READY-INTERNAL"
    )
      continue;
    const p = join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walkMd(p, acc);
    else if (
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
    .replace(/\bc\d{3,}\b/gi, "cN")
    .replace(/lap\d+/gi, "lapN")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function sourceOf(rel: string): string {
  const top = rel.replace(/\\/g, "/").split("/")[0] || "other";
  return SOURCE_RANK[top] != null ? top : "other";
}

function rank(s: string): number {
  return SOURCE_RANK[s] ?? 9;
}

function better(a: Best, b: Best): Best {
  const ra = rank(a.source);
  const rb = rank(b.source);
  if (ra !== rb) return ra < rb ? a : b;
  if (a.scoreMin !== b.scoreMin) return a.scoreMin > b.scoreMin ? a : b;
  if (a.bytes !== b.bytes) return a.bytes > b.bytes ? a : b;
  return a;
}

function detectMode(fm: Record<string, string>, name: string, rel: string): string {
  if (fm.mode) return fm.mode;
  const n = (name + " " + rel).toLowerCase();
  for (const m of ["explain", "practice", "scenario", "socratic", "quiz", "career"]) {
    if (n.includes(m)) return m;
  }
  if (rel.includes("full-spectrum")) return "multi";
  if (rel.includes("reasoning-tracks")) return "track";
  return "";
}

function detectIndustry(fm: Record<string, string>, rel: string): string {
  if (fm.industryId) return fm.industryId;
  const parts = rel.replace(/\\/g, "/").split("/");
  // known second segment often industry
  if (parts.length >= 2) return parts[1] || "";
  return "";
}

const best = new Map<string, Best>();
let scanned = 0;
let errors = 0;
let lastProgress = Date.now();

function consider(path: string) {
  try {
    const raw = readFileSync(path, "utf8");
    const fm = parseFront(raw);
    const rel = relative(corpusRoot, path).replace(/\\/g, "/");
    const body = bodyOnly(raw);
    const hash = createHash("sha256").update(normalize(body)).digest("hex").slice(0, 16);
    const rec: Best = {
      hash,
      path,
      rel,
      source: sourceOf(rel),
      industryId: detectIndustry(fm, rel),
      mode: detectMode(fm, basename(path), rel),
      scoreMin: Number(fm.scoreMin || fm.qualityAvg || 0) || 0,
      bytes: raw.length,
    };
    const prev = best.get(hash);
    if (!prev) best.set(hash, rec);
    else best.set(hash, better(prev, rec));
    scanned++;
    if (scanned % 10000 === 0 || Date.now() - lastProgress > 15000) {
      lastProgress = Date.now();
      const dupes = scanned - best.size;
      log(
        `progress scanned=${scanned} UNIQUE=${best.size} DUPES=${dupes} last=${rel.slice(0, 80)}`,
      );
      writeFileSync(
        join(logRoot, "PROGRESS.json"),
        JSON.stringify(
          {
            at: new Date().toISOString(),
            scanned,
            unique: best.size,
            dupes: scanned - best.size,
          },
          null,
          2,
        ),
        "utf8",
      );
    }
  } catch {
    errors++;
  }
}

function checkpoint(tag: string) {
  const unique = [...best.values()];
  writeFileSync(
    join(logRoot, "unique-index.jsonl"),
    unique.map((u) => JSON.stringify(u)).join("\n") + "\n",
    "utf8",
  );
  writeFileSync(
    join(logRoot, "CHECKPOINT.json"),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        tag,
        scanned,
        unique: best.size,
        dupes: scanned - best.size,
        errors,
      },
      null,
      2,
    ),
    "utf8",
  );
  log(`CHECKPOINT ${tag} scanned=${scanned} UNIQUE=${best.size} DUPES=${scanned - best.size}`);
}

function loadCheckpoint() {
  const idx = join(logRoot, "unique-index.jsonl");
  const ck = join(logRoot, "CHECKPOINT.json");
  if (!existsSync(idx) || !existsSync(ck)) return null;
  try {
    const meta = JSON.parse(readFileSync(ck, "utf8")) as {
      scanned: number;
      tag: string;
    };
    let n = 0;
    for (const line of readFileSync(idx, "utf8").split(/\r?\n/)) {
      if (!line.trim()) continue;
      const u = JSON.parse(line) as Best;
      if (u.hash) {
        best.set(u.hash, u);
        n++;
      }
    }
    scanned = meta.scanned || 0;
    log(`RESUME loaded unique=${n} scanned=${scanned} tag=${meta.tag}`);
    return meta.tag;
  } catch (e) {
    log(`resume load fail ${e}`);
    return null;
  }
}

function walkAndConsider(dir: string, label: string, skipUntilSub?: string | null) {
  if (!existsSync(dir)) {
    log(`skip missing ${label}`);
    return;
  }
  log(`WALK start ${label}`);
  let names: string[] = [];
  try {
    names = readdirSync(dir);
  } catch {
    log(`cannot read ${label}`);
    return;
  }
  const subdirs = names
    .filter((n) => {
      try {
        return statSync(join(dir, n)).isDirectory();
      } catch {
        return false;
      }
    })
    .sort();
  const rootFiles = names.filter((n) => n.endsWith(".md"));

  let skipping = Boolean(skipUntilSub);
  if (!skipping) {
    for (const f of rootFiles) consider(join(dir, f));
  }

  for (const sub of subdirs) {
    if (sub.startsWith("_") && label !== "_polished" && !label.includes("polished")) continue;
    if (skipping) {
      if (sub === skipUntilSub) {
        skipping = false;
        log(`  resume continue after ${sub}`);
      }
      // still need to re-process skipUntilSub? if we checkpoint AFTER sub done, skip until next
      continue;
    }
    const subPath = join(dir, sub);
    let files: string[] = [];
    try {
      files = readdirSync(subPath).filter((n) => n.endsWith(".md"));
    } catch {
      walkMd(subPath).forEach(consider);
      checkpoint(`${label}/${sub}`);
      continue;
    }
    if (files.length === 0) {
      walkMd(subPath).forEach(consider);
      checkpoint(`${label}/${sub}`);
      continue;
    }
    log(`  ${label}/${sub} md=${files.length}`);
    for (const f of files) consider(join(subPath, f));
    checkpoint(`${label}/${sub}`);
  }
  log(`WALK done ${label} scanned=${scanned} unique=${best.size}`);
}

// ── main ─────────────────────────────────────────────────────────────
mkdirSync(logRoot, { recursive: true });
log("=== harvest-all-unique START ===");
log(`export=${DO_EXPORT} resume=${RESUME}`);

const resumeTag = RESUME ? loadCheckpoint() : null;
// resumeTag like "perfect-overnight/aviation" — skip completed subs in that root
let resumeRoot: string | null = null;
let resumeSub: string | null = null;
if (resumeTag && resumeTag.includes("/")) {
  const parts = resumeTag.split("/");
  resumeRoot = parts[0] || null;
  resumeSub = parts[1] || null;
  log(`resume plan root=${resumeRoot} afterSub=${resumeSub}`);
}

// Order: better sources first so first-seen is good; still re-rank with better()
const roots = [
  join(corpusRoot, "reasoning-tracks"),
  join(corpusRoot, "full-spectrum"),
  join(corpusRoot, "_training_material"),
  join(corpusRoot, "_polished"),
  join(corpusRoot, "balanced-soak"),
  join(corpusRoot, "perfect-overnight"),
];

let pastResumeRoot = !resumeRoot;
for (const r of roots) {
  const label = relative(corpusRoot, r).replace(/\\/g, "/");
  if (!pastResumeRoot) {
    if (label === resumeRoot) {
      // re-walk this root but skip subs already done (checkpoint is AFTER sub)
      // skip until the sub AFTER resumeSub
      const names = existsSync(r)
        ? readdirSync(r)
            .filter((n) => {
              try {
                return statSync(join(r, n)).isDirectory();
              } catch {
                return false;
              }
            })
            .sort()
        : [];
      const idx = resumeSub ? names.indexOf(resumeSub) : -1;
      const nextSub = idx >= 0 && idx + 1 < names.length ? names[idx + 1] : null;
      if (nextSub) {
        log(`resume ${label} from sub=${nextSub} (skip through ${resumeSub})`);
        // Checkpoint is AFTER a sub completes — skip all subs <= resumeSub, start at nextSub.
        // Do NOT full-walk the root first (that re-scanned accounting.. and burned hours).
        const skipSet = new Set(names.slice(0, idx + 1));
        log(`WALK start ${label} (resume)`);
        for (const sub of names) {
          if (skipSet.has(sub)) {
            log(`  resume skip ${label}/${sub}`);
            continue;
          }
          const subPath = join(r, sub);
          let files: string[] = [];
          try {
            files = readdirSync(subPath).filter((n) => n.endsWith(".md"));
          } catch {
            walkMd(subPath).forEach(consider);
            checkpoint(`${label}/${sub}`);
            continue;
          }
          if (files.length === 0) {
            walkMd(subPath).forEach(consider);
            checkpoint(`${label}/${sub}`);
            continue;
          }
          log(`  ${label}/${sub} md=${files.length}`);
          for (const f of files) consider(join(subPath, f));
          checkpoint(`${label}/${sub}`);
        }
        log(`WALK done ${label} scanned=${scanned} unique=${best.size}`);
      } else {
        log(`resume ${label} already complete`);
      }
      pastResumeRoot = true;
      continue;
    } else {
      log(`resume skip already-done root ${label}`);
      continue;
    }
  }
  walkAndConsider(r, label);
}

const unique = [...best.values()];
const dupes = scanned - unique.length;

const bySource: Record<string, number> = {};
const byIndustry: Record<string, number> = {};
for (const u of unique) {
  bySource[u.source] = (bySource[u.source] || 0) + 1;
  const ind = u.industryId || "unknown";
  byIndustry[ind] = (byIndustry[ind] || 0) + 1;
}

const summary = {
  at: new Date().toISOString(),
  SCANNED: scanned,
  UNIQUE: unique.length,
  DUPES: dupes,
  errors,
  uniquePct: scanned ? Math.round((1000 * unique.length) / scanned) / 10 : 0,
  bySource,
  byIndustry,
  export: DO_EXPORT,
};

writeFileSync(join(logRoot, "HARVEST-SUMMARY.json"), JSON.stringify(summary, null, 2), "utf8");
writeFileSync(
  join(logRoot, "unique-index.jsonl"),
  unique.map((u) => JSON.stringify(u)).join("\n") + "\n",
  "utf8",
);
writeFileSync(
  join(logRoot, "HARVEST-COUNTS.md"),
  [
    `# Full corpus unique harvest`,
    ``,
    `**At:** ${summary.at}`,
    ``,
    `| Metric | Count |`,
    `| --- | ---: |`,
    `| **SCANNED** (all produced lessons visited) | **${scanned}** |`,
    `| **UNIQUE** (distinct content hashes) | **${unique.length}** |`,
    `| **DUPES** (scanned − unique) | **${dupes}** |`,
    `| Unique % | ${summary.uniquePct}% |`,
    `| Errors | ${errors} |`,
    ``,
    `## By source (unique winners)`,
    ``,
    ...Object.entries(bySource)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `- **${k}:** ${v}`),
    ``,
    `## By industry (unique winners)`,
    ``,
    ...Object.entries(byIndustry)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `- **${k}:** ${v}`),
    ``,
  ].join("\n"),
  "utf8",
);

log(`HARVEST DONE SCANNED=${scanned} UNIQUE=${unique.length} DUPES=${dupes}`);

if (DO_EXPORT) {
  const outRoot = join(corpusRoot, "_unique_all");
  mkdirSync(outRoot, { recursive: true });
  let exported = 0;
  let expErr = 0;
  log(`EXPORT start -> ${outRoot}`);
  for (const u of unique) {
    try {
      if (!existsSync(u.path)) {
        expErr++;
        continue;
      }
      const destDir = join(
        outRoot,
        u.source || "other",
        u.industryId || "unknown",
        u.mode || "na",
      );
      mkdirSync(destDir, { recursive: true });
      // unique name by hash prefix to avoid collisions
      const dest = join(destDir, `${u.hash}-${basename(u.path)}`);
      copyFileSync(u.path, dest);
      exported++;
      if (exported % 2000 === 0) log(`  export progress ${exported}/${unique.length}`);
    } catch {
      expErr++;
    }
  }
  summary.exported = exported;
  summary.exportErrors = expErr;
  writeFileSync(join(logRoot, "HARVEST-SUMMARY.json"), JSON.stringify(summary, null, 2), "utf8");
  log(`EXPORT DONE exported=${exported} errors=${expErr}`);
}

log("=== harvest-all-unique DONE ===");
console.log(JSON.stringify(summary, null, 2));
process.exit(0);
