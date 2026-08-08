/**
 * Corpus polish clean — auto-fix fixable public-tier gaps:
 * - A11 encoding / common mojibake
 * - A12 replace internal skill ids in body with public names
 * - A8 inject claim hygiene if missing
 * - A9 inject actionable close if missing
 * - Demote raw orch/shape noise slightly (keep in frontmatter)
 * - A10 keep first unique body hash only (skip writing dups)
 * - Set polishStatus + opsecClean in frontmatter
 *
 * Writes to public/corpus/_polished/<source>/... (never fights live generators in-place)
 *
 *   tsx scripts/corpus-polish-clean.mts --roots balanced-soak,full-spectrum,reasoning-tracks
 *   tsx scripts/corpus-polish-clean.mts --roots perfect-overnight --batch-size 2000 --offset 0
 */
import { createHash } from "node:crypto";
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  statSync,
  existsSync,
  appendFileSync,
} from "node:fs";
import { dirname, join, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { AOS_SKILLS, getSkill } from "../src/lib/aos-skills.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const corpusRoot = join(root, "public", "corpus");
const polishedRoot = join(corpusRoot, "_polished");
const aosLog = join("C:\\AOS\\logs", "corpus-polish-clean");

function arg(name: string, fb = ""): string {
  const i = process.argv.indexOf(name);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1]!;
  return fb;
}
function argNum(name: string, fb: number): number {
  const n = Number(arg(name, String(fb)));
  return Number.isFinite(n) ? n : fb;
}

const BATCH_SIZE = Math.max(0, argNum("--batch-size", 0));
const OFFSET = Math.max(0, argNum("--offset", 0));
const DRY = process.argv.includes("--dry-run");

const SKILL_ID_TO_NAME = new Map(
  AOS_SKILLS.map((s) => [s.id, s.name] as const),
);

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
    else if (
      name.endsWith(".md") &&
      !["README.md", "REPORT.md", "SYSTEM_COUNTS.md", "INDEX.md", "SUMMARY.md"].includes(
        name,
      )
    ) {
      acc.push(p);
    }
  }
  return acc;
}

function resolveRoots(): string[] {
  const multi = arg("--roots", "balanced-soak,full-spectrum,reasoning-tracks");
  return multi
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      if (/^[A-Za-z]:[\\/]/.test(s)) return s;
      return join(corpusRoot, s);
    })
    .filter((p) => existsSync(p));
}

function parseFront(raw: string): { fm: string; body: string; map: Record<string, string> } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { fm: "", body: raw, map: {} };
  const map: Record<string, string> = {};
  for (const line of m[1]!.split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i < 0) continue;
    map[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return { fm: m[1]!, body: m[2] || "", map };
}

function fixEncoding(s: string): string {
  // Normalize common UTF-8 / cp1252 mojibake and replacement chars
  return s
    .replace(/\uFFFD/g, "")
    .replace(/\u00C2\u00B7/g, "·")
    .replace(/Â·/g, "·")
    .replace(/Ã—/g, "×")
    .replace(/â†’/g, "→")
    .replace(/â€”/g, "—")
    .replace(/â€“/g, "–")
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€\u009d/g, '"')
    .replace(/â€/g, '"')
    .replace(/�+['']?/g, "·")
    .replace(/ � /g, " · ")
    .replace(/A�/g, "·");
}

function stripSkillChrome(body: string): { text: string; hits: string[] } {
  let text = body;
  const hits: string[] = [];
  // longer ids first — only strip code/id forms, not bare words that double public names
  const ids = [...SKILL_ID_TO_NAME.keys()].sort((a, b) => b.length - a.length);
  for (const id of ids) {
    const name = SKILL_ID_TO_NAME.get(id) || id;
    let changed = false;
    const before = text;
    // (**Name**) (`id`) → (**Name**)
    text = text.replace(new RegExp("\\s*\\(`" + id.replace(/-/g, "\\-") + "`\\)", "g"), () => {
      changed = true;
      return "";
    });
    // bare (`id`) or `id`
    text = text.replace(new RegExp("\\(`" + id.replace(/-/g, "\\-") + "`\\)", "g"), () => {
      changed = true;
      return name;
    });
    text = text.replace(new RegExp("`" + id.replace(/-/g, "\\-") + "`", "g"), () => {
      changed = true;
      return name;
    });
    // parenthetical raw id only: (evidence-gate)
    text = text.replace(new RegExp("\\(" + id.replace(/-/g, "\\-") + "\\)", "g"), () => {
      changed = true;
      return `(${name})`;
    });
    if (changed || text !== before) hits.push(id);
  }
  // collapse accidental "Name Name" after partial replaces
  for (const name of new Set(SKILL_ID_TO_NAME.values())) {
    const re = new RegExp(
      `(${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\s+\\1`,
      "g",
    );
    text = text.replace(re, "$1");
  }
  return { text, hits: [...new Set(hits)] };
}

function hasClaimHygiene(body: string): boolean {
  return /Claim hygiene|Evidence\s*\/\s*Inference\s*\/\s*Assumption|saw\s*\/\s*think\s*\/\s*guess|Saw\s*\/\s*think\s*\/\s*guess/i.test(
    body,
  );
}

function hasActionableClose(body: string): boolean {
  return /Actionable close|##\s*Next step|\*\*Next step\*\*/i.test(body);
}

function claimBlock(industry: string, topic: string): string {
  return [
    ``,
    `## Claim hygiene (how to treat this information)`,
    ``,
    `- **Evidence** — only what you can re-check (docs, measurements, photos, primary sources, workplace SOP).`,
    `- **Inference** — reasonable conclusions from evidence; label them as inference, not fact.`,
    `- **Assumption** — working guesses; label them; never sell as proof.`,
    `- **Human final call** — real ${industry || "craft"} work that affects safety, money, compliance, or rights needs a qualified human / official source.`,
    `- **This lesson** is educational practice${topic ? ` on *${topic}*` : ""}. Not a credential, license, or place-specific legal ruling.`,
    ``,
  ].join("\n");
}

function actionableBlock(topic: string): string {
  return [
    ``,
    `## Actionable close`,
    ``,
    `1. Restate the goal${topic ? ` of *${topic}*` : ""} in one sentence.`,
    `2. List what you **saw / measured**, what you **infer**, and what you still **assume**.`,
    `3. Name the next **safe, lawful** step and who must approve if you lack authority.`,
    `4. If safety is unclear, **stop** and escalate — schedule does not override a clear hazard.`,
    ``,
    `## Treatment of this information`,
    ``,
    `- Use for **learning and practice** only.`,
    `- Verify against workplace SOP, instructor guidance, manufacturer docs, and official sources before field use.`,
    `- Grok Tutor is educational software — not an accrediting body.`,
    ``,
  ].join("\n");
}

function rebuildFrontmatter(
  map: Record<string, string>,
  extra: Record<string, string>,
): string {
  const merged = { ...map, ...extra };
  // stable preferred keys first
  const order = [
    "industryId",
    "mode",
    "skillId",
    "skillPublicName",
    "shape",
    "orchScenario",
    "topic",
    "scoreMin",
    "repaired",
    "lap",
    "cycle",
    "generatedAt",
    "source",
    "educational",
    "notACredential",
    "notLegalAdvice",
    "notMedicalAdvice",
    "opsecClean",
    "polishStatus",
    "polishedAt",
    "polishNotes",
  ];
  const lines: string[] = ["---"];
  const seen = new Set<string>();
  for (const k of order) {
    if (merged[k] != null && merged[k] !== "") {
      lines.push(`${k}: ${merged[k]}`);
      seen.add(k);
    }
  }
  for (const [k, v] of Object.entries(merged)) {
    if (!seen.has(k) && v != null && v !== "") lines.push(`${k}: ${v}`);
  }
  lines.push("---", "");
  return lines.join("\n");
}

function normalizeHash(body: string): string {
  return body
    .replace(/generatedAt:.*$/gim, "")
    .replace(/polishedAt:.*$/gim, "")
    .replace(/cycle:\s*\d+/gi, "")
    .replace(/c\d{3,}/gi, "cN")
    .replace(/lap\d+/gi, "lapN")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function cleanOne(
  path: string,
  seen: Map<string, string>,
): {
  status: "written" | "dup-skip" | "dry" | "error";
  rel: string;
  out?: string;
  notes: string[];
  hash: string;
  sourceHash?: string;
} {
  const rel = relative(corpusRoot, path).replace(/\\/g, "/");
  const notes: string[] = [];
  try {
    let raw = readFileSync(path, "utf8");
    raw = fixEncoding(raw);
    const { body: body0, map } = parseFront(raw);
    let body = fixEncoding(body0);

    // Source content fingerprint (pre-polish) — must match full-corpus index
    const sourceHash = createHash("sha256")
      .update(normalizeHash(body))
      .digest("hex")
      .slice(0, 16);
    if (seen.has(sourceHash)) {
      return {
        status: "dup-skip",
        rel,
        notes: [`dup-source-of:${seen.get(sourceHash)}`],
        hash: sourceHash,
        sourceHash,
      };
    }

    const skillId = map.skillId || "";
    const publicName =
      (skillId && getSkill(skillId)?.name) ||
      (skillId && SKILL_ID_TO_NAME.get(skillId)) ||
      "";

    const chrome = stripSkillChrome(body);
    body = chrome.text;
    if (chrome.hits.length) notes.push(`chrome:${chrome.hits.slice(0, 5).join("|")}`);

    // Prefer public skill name in H1 if still showing raw id fragments
    if (publicName) {
      body = body.replace(
        new RegExp(`# ([^\\n]*)${skillId}([^\\n]*)`, "g"),
        `# $1${publicName}$2`,
      );
    }

    const industry = map.industryId || rel.split("/")[1] || "craft";
    // topic from frontmatter or first **Topic:** line
    let topic = map.topic || "";
    const tm = body.match(/\*\*Topic:\*\*\s*(.+)/i);
    if (!topic && tm) topic = tm[1]!.trim();

    if (!hasClaimHygiene(body)) {
      // insert before ## Dialogue if present
      if (/##\s*Dialogue/i.test(body)) {
        body = body.replace(
          /##\s*Dialogue/i,
          claimBlock(industry, topic) + "## Dialogue",
        );
      } else {
        body = body + claimBlock(industry, topic);
      }
      notes.push("inject:claim-hygiene");
    }

    if (!hasActionableClose(body)) {
      body = body.trimEnd() + "\n" + actionableBlock(topic);
      notes.push("inject:actionable-close");
    }

    // soft demote: ensure educational disclaimers in frontmatter
    const extra: Record<string, string> = {
      educational: "true",
      notACredential: "true",
      notLegalAdvice: "true",
      opsecClean: "true",
      polishStatus: "ready-internal",
      polishedAt: new Date().toISOString(),
      polishNotes: notes.join("; ") || "encoding+chrome+structure",
      source: map.source || rel.split("/")[0] || "corpus",
    };
    if (publicName) extra.skillPublicName = publicName;
    if (topic) extra.topic = topic;

    // care industries
    if (
      /nursing|emt|pharmacy|healthcare/i.test(industry) ||
      /nursing|emt|pharmacy/.test(rel)
    ) {
      extra.notMedicalAdvice = "true";
    }

    const outBody = rebuildFrontmatter({ ...map, ...extra }, {}) + body.trim() + "\n";
    const hash = createHash("sha256")
      .update(normalizeHash(outBody))
      .digest("hex")
      .slice(0, 16);

    if (seen.has(hash)) {
      return {
        status: "dup-skip",
        rel,
        notes: [...notes, `dup-polished-of:${seen.get(hash)}`],
        hash,
        sourceHash,
      };
    }
    // Register both source + polished fingerprints against entire corpus map
    seen.set(sourceHash, rel);
    seen.set(hash, rel);

    // public/corpus/_polished/<same relative path under source>
    const outPath = join(polishedRoot, rel);
    if (!DRY) {
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, outBody, "utf8");
    }
    return {
      status: DRY ? "dry" : "written",
      rel,
      out: outPath,
      notes,
      hash,
    };
  } catch (e) {
    return {
      status: "error",
      rel,
      notes: [String((e as Error)?.message || e).slice(0, 120)],
      hash: "",
    };
  }
}

// ── main ─────────────────────────────────────────────────────────────
mkdirSync(aosLog, { recursive: true });
mkdirSync(polishedRoot, { recursive: true });

const roots = resolveRoots();
if (!roots.length) {
  console.error("No roots found");
  process.exit(1);
}

let files: string[] = [];
for (const r of roots) walkMd(r, files);
files = files.filter((f) => !f.replace(/\\/g, "/").includes("/_polished/"));
files.sort();

const total = files.length;
const slice =
  BATCH_SIZE > 0 ? files.slice(OFFSET, OFFSET + BATCH_SIZE) : files.slice(OFFSET);
const batchEnd = OFFSET + slice.length;

const seen = new Map<string, string>();
const globalHashPath = join(aosLog, "clean-global-hashes.jsonl");
const fullIndexPath = join(aosLog, "full-corpus-content-index.jsonl");
const FULL_CORPUS =
  process.argv.includes("--full-corpus-index") ||
  !process.argv.includes("--no-full-corpus-index"); // default ON

function loadHashFile(path: string, into: Map<string, string>, label: string): number {
  if (!existsSync(path)) return 0;
  let n = 0;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const o = JSON.parse(line) as { hash: string; rel: string };
      if (o.hash && o.rel && !into.has(o.hash)) {
        into.set(o.hash, o.rel);
        n++;
      }
    } catch {
      /* skip */
    }
  }
  console.log(`loaded ${label}=${n} (mapSize=${into.size})`);
  return n;
}

function hashRawFile(path: string): { hash: string; rel: string } | null {
  try {
    const raw = readFileSync(path, "utf8");
    const body = bodyOnly(raw);
    const hash = createHash("sha256")
      .update(normalizeHash(fixEncoding(body)))
      .digest("hex")
      .slice(0, 16);
    const rel = relative(corpusRoot, path).replace(/\\/g, "/");
    return { hash, rel };
  } catch {
    return null;
  }
}

/** Always rebuild unique index from entire _polished library */
function indexPolishedTree(into: Map<string, string>): number {
  if (!existsSync(polishedRoot)) return 0;
  const files = walkMd(polishedRoot, []);
  let n = 0;
  for (const f of files) {
    const h = hashRawFile(f);
    if (!h) continue;
    if (!into.has(h.hash)) {
      into.set(h.hash, h.rel);
      n++;
    }
  }
  console.log(`indexed _polished unique=${into.size} (scanned=${files.length})`);
  return n;
}

/**
 * Check against entire corpus: load durable full-corpus index every batch.
 * Rebuild streams to disk (no giant in-memory string) when --rebuild-index or missing.
 */
function indexEntireCorpus(into: Map<string, string>, forceRebuild: boolean): number {
  const sourceRoots = [
    join(corpusRoot, "balanced-soak"),
    join(corpusRoot, "perfect-overnight"),
    join(corpusRoot, "full-spectrum"),
    join(corpusRoot, "reasoning-tracks"),
  ].filter((p) => existsSync(p));

  if (!forceRebuild && existsSync(fullIndexPath)) {
    return loadHashFile(fullIndexPath, into, "full-corpus-index");
  }

  console.log("building FULL corpus content index (streamed to disk)...");
  // fresh file
  writeFileSync(fullIndexPath, "", "utf8");
  let scanned = 0;
  let uniqueWritten = 0;
  for (const r of sourceRoots) {
    const files = walkMd(r, []);
    console.log(`  root ${relative(corpusRoot, r)} files=${files.length}`);
    for (const f of files) {
      scanned++;
      const h = hashRawFile(f);
      if (!h) continue;
      if (!into.has(h.hash)) {
        into.set(h.hash, h.rel);
        appendFileSync(
          fullIndexPath,
          JSON.stringify({ hash: h.hash, rel: h.rel, source: "corpus" }) + "\n",
          "utf8",
        );
        uniqueWritten++;
      }
      if (scanned % 10000 === 0) {
        console.log(
          `  … full-index scanned=${scanned} unique=${into.size} written=${uniqueWritten}`,
        );
      }
    }
  }
  console.log(
    `full corpus index done scanned=${scanned} unique=${into.size} written=${uniqueWritten}`,
  );
  return into.size;
}

// ALWAYS load durable hash memory + entire polished set + entire corpus index
loadHashFile(globalHashPath, seen, "clean-global-hashes");
indexPolishedTree(seen);
if (FULL_CORPUS) {
  indexEntireCorpus(seen, process.argv.includes("--rebuild-index"));
}
const uniqueBefore = seen.size;
console.log(`DUPE CHECK BASELINE uniqueAcrossCorpus=${uniqueBefore}`);

console.log(
  `CLEAN roots=${roots.map((r) => relative(corpusRoot, r)).join(",")} total=${total} batch=[${OFFSET},${batchEnd}) dry=${DRY}`,
);

const stats = {
  written: 0,
  dupSkip: 0,
  dry: 0,
  error: 0,
  chromeFixed: 0,
  claimInject: 0,
  actionInject: 0,
  uniqueBefore: uniqueBefore,
  uniqueAfter: 0,
  polishedFilesOnDisk: 0,
};
const results: unknown[] = [];

let i = 0;
for (const f of slice) {
  i++;
  const r = cleanOne(f, seen);
  results.push(r);
  if (r.status === "written") stats.written++;
  else if (r.status === "dup-skip") stats.dupSkip++;
  else if (r.status === "dry") stats.dry++;
  else stats.error++;
  if (r.notes.some((n) => n.startsWith("chrome:"))) stats.chromeFixed++;
  if (r.notes.includes("inject:claim-hygiene")) stats.claimInject++;
  if (r.notes.includes("inject:actionable-close")) stats.actionInject++;
  if (r.status === "written" || r.status === "dry") {
    if (r.hash) {
      appendFileSync(
        globalHashPath,
        JSON.stringify({ hash: r.hash, rel: r.rel, kind: "polished" }) + "\n",
        "utf8",
      );
    }
    if (r.sourceHash) {
      appendFileSync(
        globalHashPath,
        JSON.stringify({ hash: r.sourceHash, rel: r.rel, kind: "source" }) + "\n",
        "utf8",
      );
      appendFileSync(
        fullIndexPath,
        JSON.stringify({ hash: r.sourceHash, rel: r.rel, source: "written" }) +
          "\n",
        "utf8",
      );
    }
  }
  if (i % 500 === 0)
    console.log(
      `  … ${i}/${slice.length} written=${stats.written} dups=${stats.dupSkip} unique=${seen.size}`,
    );
}

stats.uniqueAfter = seen.size;
try {
  stats.polishedFilesOnDisk = walkMd(polishedRoot, []).length;
} catch {
  stats.polishedFilesOnDisk = 0;
}

const summary = {
  at: new Date().toISOString(),
  offset: OFFSET,
  batchEnd,
  total,
  audited: slice.length,
  nextOffset: batchEnd < total ? batchEnd : null,
  done: batchEnd >= total,
  dry: DRY,
  polishedRoot,
  fullCorpusIndex: FULL_CORPUS,
  counts: {
    batchWritten: stats.written,
    batchDupes: stats.dupSkip,
    batchErrors: stats.error,
    uniqueBefore: stats.uniqueBefore,
    uniqueAfter: stats.uniqueAfter,
    uniqueNew: Math.max(0, stats.uniqueAfter - stats.uniqueBefore),
    polishedFilesOnDisk: stats.polishedFilesOnDisk,
    // aliases for operators
    cleanUnique: stats.uniqueAfter,
    dupesThisBatch: stats.dupSkip,
  },
  stats,
  roots: roots.map((r) => relative(root, r)),
};

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
writeFileSync(
  join(aosLog, `clean-${stamp}-SUMMARY.json`),
  JSON.stringify(summary, null, 2),
  "utf8",
);
writeFileSync(join(aosLog, "LATEST-CLEAN.json"), JSON.stringify(summary, null, 2), "utf8");
// Operator-facing always-updated counts
const countsDoc = {
  at: summary.at,
  batch: {
    written: stats.written,
    dupes: stats.dupSkip,
    scanned: slice.length,
    errors: stats.error,
  },
  corpus: {
    uniqueClean: stats.uniqueAfter,
    uniqueBeforeBatch: stats.uniqueBefore,
    uniqueNewThisBatch: Math.max(0, stats.uniqueAfter - stats.uniqueBefore),
    polishedFilesOnDisk: stats.polishedFilesOnDisk,
    sourceTotalInRoots: total,
    offset: OFFSET,
    nextOffset: summary.nextOffset,
  },
  note: "uniqueClean = hashes known across entire corpus index + polished library. dupes = batch items matching that full index.",
};
writeFileSync(join(aosLog, "LATEST-COUNTS.json"), JSON.stringify(countsDoc, null, 2), "utf8");
writeFileSync(
  join(aosLog, "LATEST-COUNTS.md"),
  [
    `# Polish counts`,
    ``,
    `- **At:** ${summary.at}`,
    `- **Batch written (new unique polished):** **${stats.written}**`,
    `- **Batch dupes (matched entire corpus index):** **${stats.dupSkip}**`,
    `- **Unique clean (corpus-wide index size):** **${stats.uniqueAfter}**`,
    `- **Polished files on disk:** **${stats.polishedFilesOnDisk}**`,
    `- **Source progress:** offset ${OFFSET} → ${batchEnd} of ${total}`,
    ``,
  ].join("\n"),
  "utf8",
);
appendFileSync(
  join(aosLog, "BATCH-INDEX.jsonl"),
  JSON.stringify(summary) + "\n",
  "utf8",
);

console.log(JSON.stringify(summary, null, 2));
console.log(
  `COUNTS batchWritten=${stats.written} batchDupes=${stats.dupSkip} uniqueClean=${stats.uniqueAfter} polishedOnDisk=${stats.polishedFilesOnDisk}`,
);
console.log(
  summary.done
    ? "CLEAN COMPLETE for these roots"
    : `NEXT: --offset ${summary.nextOffset} --batch-size ${BATCH_SIZE || 2000}`,
);
process.exit(0);
