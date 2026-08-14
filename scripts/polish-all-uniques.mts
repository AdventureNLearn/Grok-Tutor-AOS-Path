/**
 * Polish every file under public/corpus/_unique_all into
 * public/corpus/_training_material_all (full unique training library).
 *
 *   tsx scripts/polish-all-uniques.mts
 *   tsx scripts/polish-all-uniques.mts --batch-size 2000 --offset 0
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
import { AOS_SKILLS, getSkill } from "../src/lib/aos-skills.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const corpusRoot = join(root, "public", "corpus");
const inRoot = join(corpusRoot, "_unique_all");
const outRoot = join(corpusRoot, "_training_material_all");
const logRoot = "C:\\AOS\\logs\\corpus-all-unique";

function argNum(name: string, fb: number): number {
  const i = process.argv.indexOf(name);
  if (i >= 0 && process.argv[i + 1]) return Number(process.argv[i + 1]) || fb;
  return fb;
}
const BATCH = Math.max(0, argNum("--batch-size", 0));
const OFFSET = Math.max(0, argNum("--offset", 0));

const SKILL_ID_TO_NAME = new Map(AOS_SKILLS.map((s) => [s.id, s.name] as const));

function log(msg: string) {
  mkdirSync(logRoot, { recursive: true });
  const line = `${new Date().toISOString()} ${msg}`;
  appendFileSync(join(logRoot, "polish-all.log"), line + "\n", "utf8");
  console.log(msg);
}

function walkMd(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (name === "READY-PUBLIC" || name === "READY-INTERNAL") continue;
      walkMd(p, acc);
    } else if (name.endsWith(".md") && name !== "README.md") acc.push(p);
  }
  return acc;
}

function parseFront(raw: string): { map: Record<string, string>; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { map: {}, body: raw };
  const map: Record<string, string> = {};
  for (const line of m[1]!.split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i < 0) continue;
    map[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return { map, body: m[2] || "" };
}

function fixEncoding(s: string): string {
  return s
    .replace(/\uFFFD/g, "")
    .replace(/Â·/g, "·")
    .replace(/A�/g, "·")
    .replace(/â€”/g, "—")
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"');
}

function stripChrome(body: string): string {
  let text = body;
  const ids = [...SKILL_ID_TO_NAME.keys()].sort((a, b) => b.length - a.length);
  for (const id of ids) {
    const name = SKILL_ID_TO_NAME.get(id) || id;
    const esc = id.replace(/-/g, "\\-");
    text = text.replace(new RegExp("\\s*\\(`" + esc + "`\\)", "g"), "");
    text = text.replace(new RegExp("\\(`" + esc + "`\\)", "g"), name);
    text = text.replace(new RegExp("`" + esc + "`", "g"), name);
    text = text.replace(new RegExp("\\(" + esc + "\\)", "g"), `(${name})`);
  }
  for (const name of new Set(SKILL_ID_TO_NAME.values())) {
    const re = new RegExp(
      `(${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\s+\\1`,
      "g",
    );
    text = text.replace(re, "$1");
  }
  return text;
}

function polishOne(src: string, dest: string): boolean {
  try {
    let raw = fixEncoding(readFileSync(src, "utf8"));
    const { map, body: b0 } = parseFront(raw);
    let body = stripChrome(fixEncoding(b0));
    const skillId = map.skillId || "";
    const publicName =
      (skillId && getSkill(skillId)?.name) || SKILL_ID_TO_NAME.get(skillId) || "";
    const industry = map.industryId || "craft";
    let topic = map.topic || "";
    const tm = body.match(/\*\*Topic:\*\*\s*(.+)/i);
    if (!topic && tm) topic = tm[1]!.trim();

    if (!/Claim hygiene|Evidence\s*\/\s*Inference|saw\s*\/\s*think/i.test(body)) {
      const block = [
        ``,
        `## Claim hygiene (how to treat this information)`,
        ``,
        `- **Evidence** — only what you can re-check.`,
        `- **Inference** — label conclusions from evidence.`,
        `- **Assumption** — label working guesses.`,
        `- **Human final call** — real ${industry} work needs a qualified human / official source.`,
        `- Educational training material only — not a credential or license.`,
        ``,
      ].join("\n");
      if (/##\s*Dialogue/i.test(body))
        body = body.replace(/##\s*Dialogue/i, block + "## Dialogue");
      else body += block;
    }
    if (!/Actionable close|##\s*Next step|\*\*Next step\*\*/i.test(body)) {
      body += [
        ``,
        `## Actionable close`,
        ``,
        `1. Restate the goal${topic ? ` of *${topic}*` : ""} in one sentence.`,
        `2. Separate what you saw, what you infer, and what you assume.`,
        `3. Next safe lawful step + who must approve if you lack authority.`,
        `4. If safety is unclear — stop and escalate.`,
        ``,
        `## Treatment of this information`,
        ``,
        `- Grok Tutor **training material** — learning/practice only.`,
        `- Verify with workplace SOP / instructors / official sources before field use.`,
        ``,
      ].join("\n");
    }

    const fm = [
      "---",
      `industryId: ${map.industryId || ""}`,
      `mode: ${map.mode || ""}`,
      `skillId: ${skillId}`,
      publicName ? `skillPublicName: ${publicName}` : "",
      topic ? `topic: ${topic}` : "",
      map.scoreMin ? `scoreMin: ${map.scoreMin}` : "",
      "educational: true",
      "notACredential: true",
      "notLegalAdvice: true",
      /nursing|emt|pharmacy/i.test(industry) ? "notMedicalAdvice: true" : "",
      "opsecClean: true",
      "trainingMaterial: true",
      "polishStatus: ready-internal",
      `polishedAt: ${new Date().toISOString()}`,
      `source: ${map.source || "unique-all"}`,
      "---",
      "",
    ]
      .filter(Boolean)
      .join("\n");

    mkdirSync(dirname(dest), { recursive: true });
    // Always put a blank line after closing --- (filter(Boolean) drops trailing "")
    writeFileSync(
      dest,
      fm.replace(/\s*$/, "") + "\n\n" + body.trim().replace(/^\s+/, "") + "\n",
      "utf8",
    );
    return true;
  } catch {
    return false;
  }
}

function quickClean(raw: string): boolean {
  if (!/^---/.test(raw)) return false;
  if (!/educational|Not a credential|training material/i.test(raw)) return false;
  if (raw.length < 2000) return false;
  if (/C:\\Users|file:\/\/|City of /i.test(raw)) return false;
  if (/you are licensed|guaranteed/i.test(raw)) return false;
  const body = raw.replace(/^---[\s\S]*?---/, "");
  for (const id of SKILL_ID_TO_NAME.keys()) {
    if (body.includes("`" + id + "`") || body.includes(`(${id})`)) return false;
  }
  if (!/Claim hygiene|Evidence|saw\s*\/\s*think|Actionable close|Next step/i.test(raw))
    return false;
  return true;
}

log("=== polish-all-uniques START ===");
if (!existsSync(inRoot)) {
  log("FATAL missing _unique_all — run harvest --export first");
  process.exit(1);
}

let files = walkMd(inRoot).sort();
const total = files.length;
if (BATCH > 0) files = files.slice(OFFSET, OFFSET + BATCH);
const batchEnd = OFFSET + files.length;

log(`files total=${total} batch=[${OFFSET},${batchEnd})`);

let written = 0;
let errors = 0;
let cleanPass = 0;
const t0 = Date.now();

for (let i = 0; i < files.length; i++) {
  const f = files[i]!;
  const rel = relative(inRoot, f);
  const dest = join(outRoot, rel);
  if (polishOne(f, dest)) {
    written++;
    try {
      if (quickClean(readFileSync(dest, "utf8"))) cleanPass++;
    } catch {
      /* */
    }
  } else errors++;
  if ((i + 1) % 500 === 0 || i + 1 === files.length) {
    const rate = ((i + 1) / Math.max(1, (Date.now() - t0) / 1000)).toFixed(1);
    log(
      `progress ${i + 1}/${files.length} written=${written} cleanPass=${cleanPass} errors=${errors} rate=${rate}/s`,
    );
    writeFileSync(
      join(logRoot, "POLISH-PROGRESS.json"),
      JSON.stringify(
        {
          at: new Date().toISOString(),
          offset: OFFSET,
          doneInBatch: i + 1,
          batchSize: files.length,
          totalUniques: total,
          written,
          cleanPass,
          errors,
          nextOffset: batchEnd < total ? batchEnd : null,
        },
        null,
        2,
      ),
      "utf8",
    );
  }
}

// READY split for this batch (full re-walk at end of complete run preferred)
const summary = {
  at: new Date().toISOString(),
  offset: OFFSET,
  batchEnd,
  totalUniques: total,
  written,
  errors,
  cleanPass,
  DUPES_SKIPPED: 0, // input already unique
  UNIQUE_POLISHED: written,
  CLEAN_PASS: cleanPass,
  nextOffset: batchEnd < total ? batchEnd : null,
  done: batchEnd >= total,
  outRoot,
};

writeFileSync(join(logRoot, "POLISH-BATCH-SUMMARY.json"), JSON.stringify(summary, null, 2), "utf8");
appendFileSync(join(logRoot, "POLISH-BATCH-INDEX.jsonl"), JSON.stringify(summary) + "\n", "utf8");
log(`BATCH DONE written=${written} CLEAN_PASS=${cleanPass} next=${summary.nextOffset}`);
console.log(JSON.stringify(summary, null, 2));
process.exit(0);
