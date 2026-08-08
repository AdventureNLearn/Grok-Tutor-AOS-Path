/**
 * Salvage incomplete public-tier content (10-12 window):
 * - A12: replace bare skill ids + code forms in body with public names
 * - A11: encoding / mojibake
 * - blank mode: infer from path (career|socratic|explain|practice|quiz|scenario)
 * - in-place on listed soft-fail files from audit ALL.csv
 *
 * Does NOT re-write pure A10 dups (no unique content to salvage).
 *
 *   tsx scripts/salvage-incomplete.mts --audit scripts/sim-output/corpus-polish-audit/<run>/ALL.csv
 *   tsx scripts/salvage-incomplete.mts --audit ... --include-a10-a12
 *   tsx scripts/salvage-incomplete.mts --audit ... --dry-run
 */
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  appendFileSync,
  copyFileSync,
} from "node:fs";
import { dirname, join, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { AOS_SKILLS } from "../src/lib/aos-skills.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const corpusRoot = join(root, "public", "corpus");
const logRoot = "C:\\AOS\\logs\\corpus-salvage-1012";

function arg(name: string, fb = ""): string {
  const i = process.argv.indexOf(name);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1]!;
  return fb;
}

const DRY = process.argv.includes("--dry-run");
const INCLUDE_A10_A12 = process.argv.includes("--include-a10-a12");
const FIX_BLANK_MODE = !process.argv.includes("--no-blank-mode");
const BACKUP = process.argv.includes("--backup");
const AUDIT_CSV = arg(
  "--audit",
  join(
    root,
    "scripts",
    "sim-output",
    "corpus-polish-audit",
    "2026-08-08T12-32-08-130Z",
    "ALL.csv",
  ),
);

const SKILL_ID_TO_NAME = new Map(AOS_SKILLS.map((s) => [s.id, s.name] as const));
// also cover audit INTERNAL list aliases not in AOS_SKILLS
const EXTRA: Record<string, string> = {
  "anti-pattern-scanner": "Pattern Check",
  "ops-hardening-architect": "Ops Hardening",
  "reasoning-architect": "Reasoning Coach",
  "report-operator": "Report Builder",
  "content-ops": "Content Ops",
  "content-systems-architect": "Content Systems",
  "visual-systems-architect": "Visual Systems",
  "influence-mapping-analyst": "Influence Mapping",
  "oversight-kit-builder": "Oversight Kit Basics",
  "construction-oversight": "Build Oversight Basics",
};
for (const [k, v] of Object.entries(EXTRA)) {
  if (!SKILL_ID_TO_NAME.has(k)) SKILL_ID_TO_NAME.set(k, v);
}

const MODES = ["career", "socratic", "explain", "practice", "quiz", "scenario"] as const;

function log(msg: string) {
  mkdirSync(logRoot, { recursive: true });
  const line = `${new Date().toISOString()} ${msg}`;
  appendFileSync(join(logRoot, "salvage.log"), line + "\n", "utf8");
  console.log(msg);
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = splitCsvLine(lines[0]!);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]!);
    const o: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) o[headers[j]!] = cols[j] ?? "";
    rows.push(o);
  }
  return rows;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i]!;
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') inQ = false;
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

function splitFm(raw: string): { fm: string; body: string; map: Record<string, string>; structureFixed: boolean } {
  let structureFixed = false;
  let text = raw;
  if (text.includes("---#")) {
    text = text.replace(/---#/g, "---\n\n#");
    structureFixed = true;
  }
  if (/---#{1,6}\s/.test(text)) {
    text = text.replace(/---(#{1,6}\s)/g, "---\n\n$1");
    structureFixed = true;
  }
  if (!text.startsWith("---")) return { fm: "", body: text, map: {}, structureFixed };
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { fm: "", body: text, map: {}, structureFixed };
  const fm = m[1]!;
  const body = m[2] || "";
  const map: Record<string, string> = {};
  for (const line of fm.split(/\r?\n/)) {
    const mm = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (mm) map[mm[1]!] = mm[2]!.replace(/^["']|["']$/g, "").trim();
  }
  return { fm, body, map, structureFixed };
}

function fixEncoding(s: string): string {
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

/** Stronger than polish-clean: also replace bare skill ids (A12 uses \\b id \\b). */
function stripSkillChrome(body: string): { text: string; hits: string[] } {
  let text = body;
  const hits: string[] = [];
  const ids = [...SKILL_ID_TO_NAME.keys()].sort((a, b) => b.length - a.length);
  for (const id of ids) {
    const name = SKILL_ID_TO_NAME.get(id) || id;
    const esc = id.replace(/-/g, "\\-");
    let changed = false;
    const before = text;
    text = text.replace(new RegExp("\\s*\\(`" + esc + "`\\)", "g"), () => {
      changed = true;
      return "";
    });
    text = text.replace(new RegExp("\\(`" + esc + "`\\)", "g"), () => {
      changed = true;
      return name;
    });
    text = text.replace(new RegExp("`" + esc + "`", "g"), () => {
      changed = true;
      return name;
    });
    text = text.replace(new RegExp("\\(" + esc + "\\)", "g"), () => {
      changed = true;
      return `(${name})`;
    });
    // bare id as whole word (hyphen-safe)
    text = text.replace(new RegExp(`(?<![A-Za-z0-9_])${esc}(?![A-Za-z0-9_])`, "g"), () => {
      changed = true;
      return name;
    });
    if (changed || text !== before) hits.push(id);
  }
  for (const name of new Set(SKILL_ID_TO_NAME.values())) {
    const re = new RegExp(
      `(${name.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")})\\s+\\1`,
      "g",
    );
    text = text.replace(re, "$1");
  }
  // soften "Thinking tools (ids):" chrome labels
  text = text.replace(/Thinking tools\s*\(ids\)/gi, "Thinking tools");
  text = text.replace(/skillIds:\s*\[[^\]]*\]/g, "skillTools: (see frontmatter)");
  return { text, hits: [...new Set(hits)] };
}

function inferMode(rel: string, map: Record<string, string>): string {
  if (map.mode && MODES.includes(map.mode as (typeof MODES)[number])) return map.mode;
  const low = rel.replace(/\\/g, "/").toLowerCase();
  for (const m of MODES) {
    if (low.includes(`/${m}/`) || low.includes(`-${m}-`) || low.includes(`/${m}.`)) return m;
  }
  // full-spectrum / reasoning track single lesson.md — default explain
  if (low.endsWith("/lesson.md")) return "explain";
  return "";
}

function setFmField(fm: string, key: string, value: string): string {
  const re = new RegExp(`^${key}:\\s*.*$`, "m");
  if (re.test(fm)) return fm.replace(re, `${key}: ${JSON.stringify(value)}`);
  return fm.trimEnd() + `\n${key}: ${JSON.stringify(value)}\n`;
}

function salvageOne(abs: string, rel: string): {
  rel: string;
  status: string;
  hits: string[];
  modeFixed: boolean;
  notes: string[];
} {
  const notes: string[] = [];
  if (!existsSync(abs)) return { rel, status: "missing", hits: [], modeFixed: false, notes: ["missing"] };
  const raw0 = readFileSync(abs, "utf8");
  let raw = fixEncoding(raw0);
  if (raw !== raw0) notes.push("encoding");
  const parsed = splitFm(raw);
  const { fm, body, map } = parsed;
  if (parsed.structureFixed) notes.push("structure:---#");
  if (!fm) return { rel, status: "no-fm", hits: [], modeFixed: false, notes: notes.concat(["no-frontmatter"]) };

  const chrome = stripSkillChrome(body);
  let newBody = chrome.text;
  if (chrome.hits.length) notes.push(`chrome:${chrome.hits.slice(0, 6).join("|")}`);

  let newFm = fm;
  let modeFixed = false;
  if (FIX_BLANK_MODE) {
    const mode = inferMode(rel, map);
    if (mode && (!map.mode || !String(map.mode).trim())) {
      newFm = setFmField(newFm, "mode", mode);
      modeFixed = true;
      notes.push(`mode:${mode}`);
    }
  }
  newFm = setFmField(newFm, "polishStatus", "salvaged-public-candidate");
  newFm = setFmField(newFm, "salvagedAt", new Date().toISOString());

  const out = `---\n${newFm.trim()}\n---\n\n${newBody.replace(/^\s+/, "")}`;
  if (out === raw0) return { rel, status: "unchanged", hits: chrome.hits, modeFixed, notes };

  if (DRY) return { rel, status: "dry", hits: chrome.hits, modeFixed, notes };
  if (BACKUP) {
    copyFileSync(abs, abs + ".pre-salvage.bak");
  }
  writeFileSync(abs, out, "utf8");
  return { rel, status: "written", hits: chrome.hits, modeFixed, notes };
}

// ── main ─────────────────────────────────────────────────────────────
mkdirSync(logRoot, { recursive: true });
log("=== salvage-incomplete START ===");
log(`audit=${AUDIT_CSV} dry=${DRY} includeA10A12=${INCLUDE_A10_A12}`);

if (!existsSync(AUDIT_CSV)) {
  console.error("missing audit csv", AUDIT_CSV);
  process.exit(1);
}

const rows = parseCsv(readFileSync(AUDIT_CSV, "utf8"));
const targets = rows.filter((r) => {
  const f = (r.fails || "").trim();
  if (f === "A12") return true;
  if (INCLUDE_A10_A12 && (f === "A10|A12" || f === "A12|A10")) return true;
  return false;
});

// also salvage CLEAN blank-mode rows if --blank-clean
const blankClean = process.argv.includes("--blank-clean")
  ? rows.filter(
      (r) =>
        r.softFail === "false" &&
        r.hardFail === "false" &&
        !(r.mode || "").trim(),
    )
  : [];

const allRels = new Map<string, string>();
for (const r of targets) allRels.set(r.rel, r.fails || "A12");
for (const r of blankClean) if (!allRels.has(r.rel)) allRels.set(r.rel, "blank-mode");

log(`targets A12-set=${targets.length} blankClean=${blankClean.length} uniquePaths=${allRels.size}`);

const stats = {
  written: 0,
  dry: 0,
  unchanged: 0,
  missing: 0,
  noFm: 0,
  chromeFiles: 0,
  modeFixed: 0,
  hitCounts: {} as Record<string, number>,
};

const results: unknown[] = [];
for (const [rel, reason] of allRels) {
  const abs = join(corpusRoot, rel.replace(/\//g, "\\"));
  const r = salvageOne(abs, rel);
  results.push({ ...r, reason });
  if (r.status === "written") stats.written++;
  else if (r.status === "dry") stats.dry++;
  else if (r.status === "unchanged") stats.unchanged++;
  else if (r.status === "missing") stats.missing++;
  else if (r.status === "no-fm") stats.noFm++;
  if (r.hits.length) {
    stats.chromeFiles++;
    for (const h of r.hits) stats.hitCounts[h] = (stats.hitCounts[h] || 0) + 1;
  }
  if (r.modeFixed) stats.modeFixed++;
}

const summary = {
  at: new Date().toISOString(),
  audit: relative(root, AUDIT_CSV).replace(/\\/g, "/"),
  dry: DRY,
  includeA10A12: INCLUDE_A10_A12,
  targetPaths: allRels.size,
  stats,
  sample: results.slice(0, 15),
};

writeFileSync(join(logRoot, "SALVAGE-SUMMARY.json"), JSON.stringify(summary, null, 2), "utf8");
writeFileSync(join(logRoot, "SALVAGE-RESULTS.jsonl"), results.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf8");

const md = [
  `# Salvage incomplete content (10-12 window)`,
  ``,
  `**At:** ${summary.at}`,
  `**Audit:** ${summary.audit}`,
  `**Dry:** ${DRY}`,
  ``,
  `| Metric | Count |`,
  `| --- | ---: |`,
  `| Target paths | ${allRels.size} |`,
  `| Written | **${stats.written}** |`,
  `| Dry | ${stats.dry} |`,
  `| Unchanged | ${stats.unchanged} |`,
  `| Missing | ${stats.missing} |`,
  `| Chrome fixed (files) | **${stats.chromeFiles}** |`,
  `| Mode filled | **${stats.modeFixed}** |`,
  ``,
  `## Skill ids replaced (file hits)`,
  ``,
  ...Object.entries(stats.hitCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([k, v]) => `- \`${k}\`: ${v}`),
  ``,
  `## Next`,
  `- Re-audit: \`tsx scripts/corpus-polish-audit.mts --tier public --roots _polished,_training_material\``,
  `- Expect CLEAN lift mainly from A12-only (${targets.filter((t) => t.fails === "A12").length} candidates)`,
  `- Pure A10 (${rows.filter((r) => r.fails === "A10").length}) left as dups — no unique salvage`,
  ``,
].join("\n");

writeFileSync(join(logRoot, "SALVAGE-REPORT.md"), md, "utf8");
writeFileSync(join(root, "docs", "SALVAGE-1012-REPORT.md"), md, "utf8");

log(JSON.stringify(stats));
log("=== salvage-incomplete DONE ===");
console.log(md);

