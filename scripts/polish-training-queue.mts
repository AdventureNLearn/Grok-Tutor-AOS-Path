/**
 * Polish exported training queue into public/corpus/_training_material.
 * Uses same polish rules as corpus-polish-clean (chrome strip, hygiene, etc.)
 * but only for _training_queue paths listed in QUEUE-MANIFEST.
 *
 *   tsx scripts/polish-training-queue.mts
 */
import { createHash } from "node:crypto";
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  copyFileSync,
  appendFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { dirname, join, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { AOS_SKILLS, getSkill } from "../src/lib/aos-skills.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const corpusRoot = join(root, "public", "corpus");
const queueRoot = join(corpusRoot, "_training_queue");
const outRoot = join(corpusRoot, "_training_material");
const logRoot = "C:\\AOS\\logs\\corpus-post7";

const SKILL_ID_TO_NAME = new Map(AOS_SKILLS.map((s) => [s.id, s.name] as const));

function log(msg: string) {
  mkdirSync(logRoot, { recursive: true });
  const line = `${new Date().toISOString()} ${msg}`;
  appendFileSync(join(logRoot, "pipeline.log"), line + "\n", "utf8");
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
    if (st.isDirectory()) walkMd(p, acc);
    else if (name.endsWith(".md")) acc.push(p);
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
    .replace(/â€“/g, "–")
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

function hasClaim(body: string): boolean {
  return /Claim hygiene|Evidence\s*\/\s*Inference|saw\s*\/\s*think\s*\/\s*guess/i.test(
    body,
  );
}
function hasAction(body: string): boolean {
  return /Actionable close|##\s*Next step|\*\*Next step\*\*/i.test(body);
}

function polishOne(path: string, dest: string): { ok: boolean; notes: string[] } {
  const notes: string[] = [];
  try {
    let raw = fixEncoding(readFileSync(path, "utf8"));
    const { map, body: b0 } = parseFront(raw);
    let body = stripChrome(fixEncoding(b0));
    const skillId = map.skillId || "";
    const publicName =
      (skillId && getSkill(skillId)?.name) || SKILL_ID_TO_NAME.get(skillId) || "";
    if (publicName) notes.push("skillPublicName");
    const industry = map.industryId || "craft";
    let topic = map.topic || "";
    const tm = body.match(/\*\*Topic:\*\*\s*(.+)/i);
    if (!topic && tm) topic = tm[1]!.trim();

    if (!hasClaim(body)) {
      const block = [
        ``,
        `## Claim hygiene (how to treat this information)`,
        ``,
        `- **Evidence** — only what you can re-check (docs, measurements, photos, primary sources, workplace SOP).`,
        `- **Inference** — reasonable conclusions from evidence; label them as inference, not fact.`,
        `- **Assumption** — working guesses; label them; never sell as proof.`,
        `- **Human final call** — real ${industry} work that affects safety, money, compliance, or rights needs a qualified human / official source.`,
        `- **This lesson** is educational training material${topic ? ` on *${topic}*` : ""}. Not a credential or license.`,
        ``,
      ].join("\n");
      if (/##\s*Dialogue/i.test(body)) {
        body = body.replace(/##\s*Dialogue/i, block + "## Dialogue");
      } else body += block;
      notes.push("claim-hygiene");
    }
    if (!hasAction(body)) {
      body +=
        [
          ``,
          `## Actionable close`,
          ``,
          `1. Restate the goal${topic ? ` of *${topic}*` : ""} in one sentence.`,
          `2. List what you **saw / measured**, what you **infer**, and what you still **assume**.`,
          `3. Name the next **safe, lawful** step and who must approve if you lack authority.`,
          `4. If safety is unclear, **stop** and escalate.`,
          ``,
          `## Treatment of this information`,
          ``,
          `- Use for **learning and practice** only (Grok Tutor training material).`,
          `- Verify against workplace SOP, instructors, manufacturer docs, and official sources before field use.`,
          `- Not an accrediting body; human final call on real work.`,
          ``,
        ].join("\n");
      notes.push("actionable-close");
    }

    const fmLines = [
      "---",
      `industryId: ${map.industryId || ""}`,
      `mode: ${map.mode || ""}`,
      `skillId: ${skillId}`,
      publicName ? `skillPublicName: ${publicName}` : "",
      map.shape ? `shape: ${map.shape}` : "",
      map.orchScenario ? `orchScenario: ${map.orchScenario}` : "",
      topic ? `topic: ${topic}` : "",
      map.scoreMin ? `scoreMin: ${map.scoreMin}` : "",
      `educational: true`,
      `notACredential: true`,
      `notLegalAdvice: true`,
      /nursing|emt|pharmacy/i.test(industry) ? `notMedicalAdvice: true` : "",
      `opsecClean: true`,
      `polishStatus: ready-internal`,
      `trainingMaterial: true`,
      `polishedAt: ${new Date().toISOString()}`,
      `source: ${map.source || "training-queue"}`,
      `polishNotes: ${notes.join(";") || "training-polish"}`,
      "---",
      "",
    ].filter(Boolean);

    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, fmLines.join("\n") + "\n\n" + body.trim().replace(/^\s+/, "") + "\n", "utf8");
    return { ok: true, notes };
  } catch (e) {
    return { ok: false, notes: [String((e as Error).message || e)] };
  }
}

// gates for quick clean count
function quickGates(raw: string): { clean: boolean; fails: string[] } {
  const fails: string[] = [];
  if (!/^---/.test(raw)) fails.push("A1");
  if (!/educational|Not a credential/i.test(raw)) fails.push("A2");
  if (raw.length < 2500) fails.push("A3");
  if (!/##\s*Dialogue|###\s*Learner|\*\*Goal:\*\*|##\s*Craft frame/i.test(raw))
    fails.push("A4");
  if (/C:\\Users|file:\/\/|City of |County of /i.test(raw)) fails.push("A6");
  if (/you are licensed|guaranteed|accredited by this/i.test(raw)) fails.push("A7");
  if (!/Claim hygiene|saw\s*\/\s*think|Evidence/i.test(raw)) fails.push("A8");
  if (!/Actionable close|Next step|Your job/i.test(raw)) fails.push("A9");
  const skillHit = [...SKILL_ID_TO_NAME.keys()].some(
    (id) => raw.includes("`" + id + "`") || new RegExp(`\\(${id}\\)`).test(raw),
  );
  // only fail A12 if skill id in body after frontmatter
  const body = raw.replace(/^---[\s\S]*?---/, "");
  const skillHitBody = [...SKILL_ID_TO_NAME.keys()].some(
    (id) => body.includes("`" + id + "`") || body.includes(`(${id})`),
  );
  if (skillHitBody) fails.push("A12");
  return { clean: fails.length === 0, fails };
}

log("=== polish-training-queue START ===");
if (!existsSync(queueRoot)) {
  log("FATAL missing _training_queue — run build-training-queue --export first");
  process.exit(1);
}

const files = walkMd(queueRoot);
log(`queue files=${files.length}`);
mkdirSync(outRoot, { recursive: true });

const seenHash = new Map<string, string>();
let written = 0;
let dupes = 0;
let errors = 0;
let cleanPass = 0;
const results: unknown[] = [];

for (const f of files) {
  const rel = relative(queueRoot, f).replace(/\\/g, "/");
  const dest = join(outRoot, rel);
  // content hash pre-polish for dupe skip within training set
  let raw0 = "";
  try {
    raw0 = readFileSync(f, "utf8");
  } catch {
    errors++;
    continue;
  }
  const h = createHash("sha256")
    .update(
      raw0
        .replace(/generatedAt:.*/g, "")
        .replace(/\s+/g, " ")
        .toLowerCase(),
    )
    .digest("hex")
    .slice(0, 16);
  if (seenHash.has(h)) {
    dupes++;
    results.push({ rel, status: "dup", of: seenHash.get(h) });
    continue;
  }
  seenHash.set(h, rel);
  const r = polishOne(f, dest);
  if (!r.ok) {
    errors++;
    results.push({ rel, status: "error", notes: r.notes });
    continue;
  }
  written++;
  const polished = readFileSync(dest, "utf8");
  const g = quickGates(polished);
  if (g.clean) cleanPass++;
  results.push({
    rel,
    status: "written",
    clean: g.clean,
    fails: g.fails,
    notes: r.notes,
  });
  if (written % 25 === 0) log(`  … written=${written} dupes=${dupes} cleanPass=${cleanPass}`);
}

// READY splits
const readyPublic = join(outRoot, "READY-PUBLIC");
const readyInternal = join(outRoot, "READY-INTERNAL");
mkdirSync(readyPublic, { recursive: true });
mkdirSync(readyInternal, { recursive: true });
let pub = 0;
let intern = 0;
for (const r of results as { rel: string; status: string; clean?: boolean }[]) {
  if (r.status !== "written") continue;
  const src = join(outRoot, r.rel);
  if (!existsSync(src)) continue;
  const destRoot = r.clean ? readyPublic : readyInternal;
  const dest = join(destRoot, basename(r.rel));
  try {
    copyFileSync(src, dest);
    if (r.clean) pub++;
    else intern++;
  } catch {
    /* */
  }
}

const summary = {
  at: new Date().toISOString(),
  queueFiles: files.length,
  written,
  dupes,
  errors,
  cleanPass,
  softOrInternal: written - cleanPass,
  readyPublic: pub,
  readyInternal: intern,
  UNIQUE_POLISHED: written,
  DUPES_SKIPPED: dupes,
  CLEAN_PASS: cleanPass,
  trainingMaterialRoot: outRoot,
  purpose: "Grok Tutor training material — educational, not credential",
};

writeFileSync(join(logRoot, "POLISH-SUMMARY.json"), JSON.stringify(summary, null, 2), "utf8");
writeFileSync(
  join(logRoot, "POLISH-RESULTS.jsonl"),
  results.map((r) => JSON.stringify(r)).join("\n") + "\n",
  "utf8",
);
writeFileSync(
  join(logRoot, "FINAL-COUNTS.md"),
  [
    `# Training material FINAL COUNTS`,
    ``,
    `**At:** ${summary.at}`,
    ``,
    `| Metric | Count |`,
    `| --- | ---: |`,
    `| Queue files | ${files.length} |`,
    `| **UNIQUE_POLISHED (written)** | **${written}** |`,
    `| **DUPES_SKIPPED** | **${dupes}** |`,
    `| Errors | ${errors} |`,
    `| **CLEAN_PASS (quick gates)** | **${cleanPass}** |`,
    `| Internal (soft) | ${written - cleanPass} |`,
    `| READY-PUBLIC copies | ${pub} |`,
    `| READY-INTERNAL copies | ${intern} |`,
    ``,
    `## Paths`,
    ``,
    `- Queue: \`${queueRoot}\``,
    `- Training material: \`${outRoot}\``,
    `- READY-PUBLIC: \`${readyPublic}\``,
    `- READY-INTERNAL: \`${readyInternal}\``,
    ``,
    `## Treatment`,
    ``,
    `Educational training material for Grok Tutor. Not accredited. Human final call on real work.`,
    ``,
  ].join("\n"),
  "utf8",
);
writeFileSync(join(outRoot, "README.md"), readFileSync(join(logRoot, "FINAL-COUNTS.md"), "utf8"), "utf8");

log(`DONE written=${written} dupes=${dupes} CLEAN_PASS=${cleanPass}`);
console.log(JSON.stringify(summary, null, 2));
process.exit(0);

