/**
 * Corpus polish audit — automated gates A1–A12 from docs/CORPUS-AUDIT-TEMPLATE.md
 *
 *   tsx scripts/corpus-polish-audit.mts --root public/corpus/balanced-soak --tier public
 *   tsx scripts/corpus-polish-audit.mts --root public/corpus/perfect-overnight --tier public --batch-size 500 --offset 0
 *   tsx scripts/corpus-polish-audit.mts --roots balanced-soak,perfect-overnight,full-spectrum,reasoning-tracks --tier public --batch-size 1000
 *
 * Outputs under scripts/sim-output/corpus-polish-audit/<runId>/ and C:\AOS\logs\corpus-polish-audit\
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
import { INDUSTRIES } from "../src/lib/industries.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const aosLogRoot = join("C:\\AOS\\logs", "corpus-polish-audit");

function arg(name: string, fb = ""): string {
  const i = process.argv.indexOf(name);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1]!;
  return fb;
}
function argNum(name: string, fb: number): number {
  const n = Number(arg(name, String(fb)));
  return Number.isFinite(n) ? n : fb;
}

const TIER = (arg("--tier", "public") || "public").toLowerCase() as
  | "internal"
  | "public"
  | "pack-seed";
const BATCH_SIZE = Math.max(0, argNum("--batch-size", 0)); // 0 = all
const OFFSET = Math.max(0, argNum("--offset", 0));
const MIN_LEN =
  TIER === "public" || TIER === "pack-seed"
    ? argNum("--min-len", 4000)
    : argNum("--min-len", 2500);

const SAFETY_FIRST = new Set(
  INDUSTRIES.filter((i) => i.safetyFirst).map((i) => i.id),
);

const INTERNAL_SKILL_IDS = [
  "evidence-gate",
  "shatter-protocol",
  "anti-pattern-scanner",
  "psyop-narrative-detector",
  "jurisdiction-ops",
  "permit-coordinator",
  "construction-oversight",
  "public-records-forensics",
  "4-agent-orchestration",
  "working-doc-manager",
  "mission-spine-guard",
  "ops-hardening-architect",
  "reasoning-architect",
  "report-operator",
  "content-ops",
  "content-systems-architect",
  "visual-systems-architect",
  "civic-intelligence-coordinator",
  "evenhandedness-illusion-breaker",
  "influence-mapping-analyst",
  "oversight-kit-builder",
];

type GateId =
  | "A1"
  | "A2"
  | "A3"
  | "A4"
  | "A5"
  | "A6"
  | "A7"
  | "A8"
  | "A9"
  | "A10"
  | "A11"
  | "A12";

type GateResult = { id: GateId; pass: boolean; detail: string };
type LessonResult = {
  path: string;
  rel: string;
  source: string;
  industryId: string;
  mode: string;
  skillId: string;
  scoreMin: number;
  bytes: number;
  bodyHash: string;
  tier: string;
  hardFail: boolean;
  softFail: boolean;
  passCount: number;
  failCount: number;
  fails: string[];
  gates: GateResult[];
  polishHint: string[];
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
    else if (
      name.endsWith(".md") &&
      !["README.md", "SYSTEM_COUNTS.md", "REPORT.md", "COVERAGE.md"].includes(
        name,
      ) &&
      name !== "INDEX.md"
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
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (k) out[k] = v;
  }
  return out;
}

function bodyOnly(raw: string): string {
  const m = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);
  return m ? m[1]! : raw;
}

function normalizeForHash(body: string): string {
  return body
    .replace(/generatedAt:.*$/gim, "")
    .replace(/cycle:\s*\d+/gi, "")
    .replace(/c\d{3,}/gi, "cN")
    .replace(/lap\d+/gi, "lapN")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function sourceOf(rel: string): string {
  const top = rel.replace(/\\/g, "/").split("/")[0] || "other";
  if (top === "balanced-soak") return "balanced-soak";
  if (top === "perfect-overnight") return "perfect-overnight";
  if (top === "full-spectrum") return "full-spectrum";
  if (top === "reasoning-tracks") return "reasoning-tracks";
  return top || "other";
}

function resolveOneRoot(spec: string): string {
  const s = spec.trim();
  if (!s) return "";
  if (/^[A-Za-z]:[\\/]/.test(s) || s.startsWith("\\\\")) return s;
  if (s.startsWith("public/") || s.startsWith("public\\")) return join(root, s);
  // bare corpus folder name
  return join(root, "public", "corpus", s);
}

function resolveRoots(): string[] {
  const multi = arg("--roots", "");
  if (multi) {
    return multi
      .split(",")
      .map(resolveOneRoot)
      .filter(Boolean);
  }
  const single = arg("--root", "");
  if (single) return [resolveOneRoot(single)].filter(Boolean);
  return [
    join(root, "public", "corpus", "balanced-soak"),
    join(root, "public", "corpus", "perfect-overnight"),
    join(root, "public", "corpus", "full-spectrum"),
    join(root, "public", "corpus", "reasoning-tracks"),
  ];
}

function auditFile(
  path: string,
  corpusRoot: string,
  seenHash: Map<string, string>,
): LessonResult {
  const raw = readFileSync(path, "utf8");
  const fm = parseFront(raw);
  const body = bodyOnly(raw);
  const rel = relative(join(root, "public", "corpus"), path).replace(
    /\\/g,
    "/",
  );
  const industryId = fm.industryId || rel.split("/")[1] || "";
  const mode = fm.mode || "";
  const skillId = fm.skillId || "";
  const scoreMin = Number(fm.scoreMin || fm.qualityAvg || 0) || 0;
  const norm = normalizeForHash(body);
  const bodyHash = createHash("sha256").update(norm).digest("hex").slice(0, 16);

  const gates: GateResult[] = [];
  const polishHint: string[] = [];

  // A1 frontmatter
  const hasFm = /^---\r?\n[\s\S]*?\r?\n---/.test(raw);
  gates.push({
    id: "A1",
    pass: hasFm,
    detail: hasFm ? "frontmatter ok" : "missing YAML frontmatter",
  });
  if (!hasFm) polishHint.push("add YAML frontmatter");

  // A2 educational + not credential
  const edu =
    /educational:\s*true/i.test(raw) ||
    /Educational sample/i.test(raw) ||
    /educational:\s*true/i.test(JSON.stringify(fm));
  const notCred =
    /not a credential|notACredential|not a certificate|not a license/i.test(
      raw,
    );
  const a2 = edu && notCred;
  gates.push({
    id: "A2",
    pass: a2,
    detail: a2
      ? "disclaimer ok"
      : `edu=${edu} notCredential=${notCred}`,
  });
  if (!a2) polishHint.push("add educational + not-credential disclaimer");

  // A3 length
  const minLen = MIN_LEN;
  const a3 = raw.length >= minLen;
  gates.push({
    id: "A3",
    pass: a3,
    detail: `len=${raw.length} min=${minLen}`,
  });
  if (!a3) polishHint.push(`expand body to ≥${minLen} chars`);

  // A4 dialogue / multi-turn lesson body
  const a4 =
    /##\s*Dialogue/i.test(raw) ||
    /###\s*Learner/i.test(raw) ||
    /###\s*Tutor/i.test(raw) ||
    /##\s*Craft frame/i.test(raw) ||
    /##\s*Mode\b/i.test(raw) ||
    /\*\*Goal:\*\*/i.test(raw) ||
    /###\s*(Explain|Socratic|Practice|Quiz|Scenario|Career)/i.test(raw);
  gates.push({
    id: "A4",
    pass: a4,
    detail: a4 ? "dialogue/lesson body present" : "no dialogue/lesson section",
  });
  if (!a4) polishHint.push("add multi-turn dialogue");

  // A5 safety for safetyFirst industries
  const needsSafety = SAFETY_FIRST.has(industryId);
  const hasSafety =
    /safety|stop if|stop-work|PPE|licensed|hurt|escalat|lockout|test-before-touch/i.test(
      raw,
    );
  const a5 = !needsSafety || hasSafety;
  gates.push({
    id: "A5",
    pass: a5,
    detail: needsSafety
      ? hasSafety
        ? "safety lexicon ok"
        : "safetyFirst industry missing safety language"
      : "n/a (not safetyFirst)",
  });
  if (!a5) polishHint.push("add safety/stop language for safety-first craft");

  // A6 OPSEC
  const opsec =
    /C:\\Users|file:\/\/|\\\\Users\\/i.test(raw) ||
    /\bCity of \b|\bCounty of \b/i.test(raw);
  gates.push({
    id: "A6",
    pass: !opsec,
    detail: opsec ? "OPSEC leak pattern" : "opsec clean",
  });
  if (opsec) polishHint.push("remove host paths / municipality names");

  // A7 overclaim
  const over =
    /you are licensed|guaranteed|legal advice for your|this app certif|accredited by this|you are now certified/i.test(
      raw,
    );
  gates.push({
    id: "A7",
    pass: !over,
    detail: over ? "overclaim language" : "no overclaim",
  });
  if (over) polishHint.push("remove overclaim / false authority");

  // A8 claim hygiene (required public/pack-seed)
  const claim =
    /Claim hygiene|Evidence\s*\/\s*Inference\s*\/\s*Assumption|saw\s*\/\s*think\s*\/\s*guess|Saw\s*\/\s*think\s*\/\s*guess|what you saw.*what you think/i.test(
      raw,
    );
  const a8req = TIER === "public" || TIER === "pack-seed";
  const a8 = !a8req || claim;
  gates.push({
    id: "A8",
    pass: a8,
    detail: a8req
      ? claim
        ? "claim hygiene present"
        : "missing claim hygiene (public tier)"
      : claim
        ? "present (optional)"
        : "optional at internal tier",
  });
  if (!a8) polishHint.push("add claim hygiene (E/I/A or saw/think/guess)");

  // A9 actionable close or next step (public)
  const action =
    /Actionable close|##\s*Next step|Next step\s*\n|\*\*Next step\*\*|Your job|Check your understanding|Paste your draft|Reply with your/i.test(
      raw,
    );
  const a9req = TIER === "public" || TIER === "pack-seed";
  // public wants stronger: actionable close OR explicit next step block
  const strongAction =
    /Actionable close|##\s*Next step|\*\*Next step\*\*/i.test(raw) ||
    (/Your job/i.test(raw) && /Check your understanding|Paste your draft|Reply with/i.test(raw));
  const a9 = !a9req || strongAction || action;
  // tighten public: prefer strongAction
  const a9pass =
    TIER === "public" ? strongAction || /Actionable close|Next step/i.test(raw) : a9;
  gates.push({
    id: "A9",
    pass: a9pass,
    detail: a9pass
      ? "actionable / next step ok"
      : "missing actionable close or next step (public)",
  });
  if (!a9pass) polishHint.push("add Actionable close or explicit Next step");

  // A10 near-duplicate
  const prior = seenHash.get(bodyHash);
  const a10 = !prior;
  gates.push({
    id: "A10",
    pass: a10,
    detail: a10 ? "unique in run" : `duplicate of ${prior}`,
  });
  if (!a10) polishHint.push("dedupe / drop near-duplicate");
  else seenHash.set(bodyHash, rel);

  // A11 encoding / replacement char
  const badEnc =
    raw.includes("\uFFFD") ||
    /A�|Ã.|â€|â€™|â€œ|Â·/.test(raw) ||
    // common mojibake for middle-dot / arrows in titles when double-encoded
    /# .*(A�|Ã—)/.test(raw);
  gates.push({
    id: "A11",
    pass: !badEnc,
    detail: badEnc ? "encoding/mojibake markers" : "encoding ok",
  });
  if (badEnc) polishHint.push("normalize UTF-8 titles/punctuation");

  // A12 skill chrome in learner-facing body (public)
  // Allow skillId in frontmatter only; fail if raw ids appear in body (esp. H1)
  const bodyForChrome = body;
  const chromeHits = INTERNAL_SKILL_IDS.filter(
    (id) =>
      bodyForChrome.includes(`\`${id}\``) ||
      bodyForChrome.includes(`(${id})`) ||
      new RegExp(`\\b${id}\\b`).test(bodyForChrome),
  );
  const a12req = TIER === "public" || TIER === "pack-seed";
  const a12 = !a12req || chromeHits.length === 0;
  gates.push({
    id: "A12",
    pass: a12,
    detail: a12
      ? "no internal skill ids in body"
      : `skill chrome in body: ${chromeHits.slice(0, 4).join(", ")}`,
  });
  if (!a12)
    polishHint.push("use public skill names only; keep ids in frontmatter");

  const fails = gates.filter((g) => !g.pass).map((g) => g.id);
  const hardFail = fails.some((id) =>
    ["A1", "A2", "A6", "A7"].includes(id),
  );
  const softFail = !hardFail && fails.length > 0;
  const passCount = gates.filter((g) => g.pass).length;

  return {
    path,
    rel,
    source: sourceOf(rel),
    industryId,
    mode,
    skillId,
    scoreMin,
    bytes: raw.length,
    bodyHash,
    tier: TIER,
    hardFail,
    softFail,
    passCount,
    failCount: fails.length,
    fails,
    gates,
    polishHint,
  };
}

// ── main ─────────────────────────────────────────────────────────────
const roots = resolveRoots().filter((r) => existsSync(r));
if (!roots.length) {
  console.error("No corpus roots found. Pass --root or --roots.");
  process.exit(1);
}

let files: string[] = [];
for (const r of roots) {
  walkMd(r, files);
}
// skip pure reports
files = files.filter(
  (f) =>
    !/REPORT\.md$/i.test(f) &&
    !/COVERAGE\.md$/i.test(f) &&
    !/SUMMARY\.md$/i.test(f),
);
files.sort();

const totalFiles = files.length;
const slice =
  BATCH_SIZE > 0
    ? files.slice(OFFSET, OFFSET + BATCH_SIZE)
    : files.slice(OFFSET);
const batchEnd = OFFSET + slice.length;

const runId = new Date().toISOString().replace(/[:.]/g, "-");
const outDir = join(
  root,
  "scripts",
  "sim-output",
  "corpus-polish-audit",
  runId,
);
mkdirSync(outDir, { recursive: true });
mkdirSync(aosLogRoot, { recursive: true });

console.log(`Corpus polish audit`);
console.log(`tier=${TIER} minLen=${MIN_LEN}`);
console.log(`roots=${roots.map((r) => relative(root, r)).join(", ")}`);
console.log(
  `files total=${totalFiles} batch offset=${OFFSET} size=${slice.length} range=[${OFFSET},${batchEnd})`,
);

const seenHash = new Map<string, string>();
// Persist hashes across batches for corpus-wide A10
const globalHashPath = join(aosLogRoot, "global-body-hashes.jsonl");
if (existsSync(globalHashPath) && OFFSET > 0) {
  try {
    const lines = readFileSync(globalHashPath, "utf8").split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      try {
        const o = JSON.parse(line) as { hash: string; rel: string };
        if (o.hash && o.rel && !seenHash.has(o.hash)) seenHash.set(o.hash, o.rel);
      } catch {
        /* skip */
      }
    }
    console.log(`loaded global hashes=${seenHash.size} from prior batches`);
  } catch {
    /* ignore */
  }
} else if (OFFSET === 0 && existsSync(globalHashPath)) {
  // fresh full run: reset global hash store
  writeFileSync(globalHashPath, "", "utf8");
}

const results: LessonResult[] = [];
let i = 0;
for (const f of slice) {
  i++;
  try {
    results.push(auditFile(f, join(root, "public", "corpus"), seenHash));
  } catch (e) {
    results.push({
      path: f,
      rel: relative(join(root, "public", "corpus"), f),
      source: "error",
      industryId: "",
      mode: "",
      skillId: "",
      scoreMin: 0,
      bytes: 0,
      bodyHash: "",
      tier: TIER,
      hardFail: true,
      softFail: false,
      passCount: 0,
      failCount: 12,
      fails: ["A1"],
      gates: [
        {
          id: "A1",
          pass: false,
          detail: String((e as Error)?.message || e).slice(0, 120),
        },
      ],
      polishHint: ["unreadable file"],
    });
  }
  if (i % 200 === 0) {
    console.log(`  … ${i}/${slice.length}`);
  }
}

const hard = results.filter((r) => r.hardFail);
const soft = results.filter((r) => r.softFail && !r.hardFail);
const clean = results.filter((r) => r.failCount === 0);
const byFail: Record<string, number> = {};
const bySource: Record<string, { n: number; hard: number; soft: number; clean: number }> = {};
for (const r of results) {
  for (const id of r.fails) byFail[id] = (byFail[id] || 0) + 1;
  if (!bySource[r.source])
    bySource[r.source] = { n: 0, hard: 0, soft: 0, clean: 0 };
  bySource[r.source]!.n++;
  if (r.hardFail) bySource[r.source]!.hard++;
  else if (r.softFail) bySource[r.source]!.soft++;
  else bySource[r.source]!.clean++;
}

const summary = {
  runId,
  at: new Date().toISOString(),
  tier: TIER,
  minLen: MIN_LEN,
  offset: OFFSET,
  batchSize: BATCH_SIZE || slice.length,
  batchEnd,
  totalInCorpus: totalFiles,
  audited: results.length,
  clean: clean.length,
  softFail: soft.length,
  hardFail: hard.length,
  cleanPct: results.length
    ? Math.round((1000 * clean.length) / results.length) / 10
    : 0,
  byFail,
  bySource,
  roots: roots.map((r) => relative(root, r)),
  nextOffset: batchEnd < totalFiles ? batchEnd : null,
  done: batchEnd >= totalFiles,
};

// CSV
const csvHeader = [
  "rel",
  "source",
  "industryId",
  "mode",
  "skillId",
  "scoreMin",
  "bytes",
  "hardFail",
  "softFail",
  "passCount",
  "fails",
  "polishHints",
  "bodyHash",
  ...(["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12"] as GateId[]),
].join(",");

function esc(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const csvRows = results.map((r) => {
  const gateMap = Object.fromEntries(r.gates.map((g) => [g.id, g.pass ? "PASS" : "FAIL"]));
  return [
    esc(r.rel),
    r.source,
    r.industryId,
    r.mode,
    r.skillId,
    r.scoreMin,
    r.bytes,
    r.hardFail,
    r.softFail,
    r.passCount,
    esc(r.fails.join("|")),
    esc(r.polishHint.join("; ")),
    r.bodyHash,
    ...(["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12"] as GateId[]).map(
      (id) => gateMap[id] || "",
    ),
  ].join(",");
});

// append new unique hashes for cross-batch A10
mkdirSync(aosLogRoot, { recursive: true });
const hashLines: string[] = [];
for (const r of results) {
  if (r.bodyHash && !r.fails.includes("A10")) {
    hashLines.push(JSON.stringify({ hash: r.bodyHash, rel: r.rel }));
  }
}
if (hashLines.length) {
  appendFileSync(globalHashPath, hashLines.join("\n") + "\n", "utf8");
}

writeFileSync(join(outDir, "SUMMARY.json"), JSON.stringify(summary, null, 2), "utf8");
writeFileSync(
  join(outDir, "results.jsonl"),
  results.map((r) => JSON.stringify(r)).join("\n") + "\n",
  "utf8",
);
writeFileSync(
  join(outDir, "FAILS.csv"),
  [csvHeader, ...csvRows.filter((_, idx) => results[idx]!.failCount > 0)].join(
    "\n",
  ) + "\n",
  "utf8",
);
writeFileSync(
  join(outDir, "ALL.csv"),
  [csvHeader, ...csvRows].join("\n") + "\n",
  "utf8",
);

const report = [
  `# Corpus polish audit`,
  ``,
  `- **Run:** \`${runId}\``,
  `- **Tier:** ${TIER}`,
  `- **Batch:** offset ${OFFSET} · audited **${results.length}** of ${totalFiles}`,
  `- **Clean (12/12):** ${clean.length} (${summary.cleanPct}%)`,
  `- **Soft fail:** ${soft.length}`,
  `- **Hard fail:** ${hard.length}`,
  `- **Next offset:** ${summary.nextOffset ?? "DONE"}`,
  ``,
  `## Fails by gate`,
  ``,
  ...Object.entries(byFail)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `- **${k}:** ${v}`),
  ``,
  `## By source`,
  ``,
  ...Object.entries(bySource).map(
    ([k, v]) =>
      `- **${k}:** n=${v.n} clean=${v.clean} soft=${v.soft} hard=${v.hard}`,
  ),
  ``,
  `## Artifacts`,
  ``,
  `- \`${relative(root, join(outDir, "SUMMARY.json"))}\``,
  `- \`${relative(root, join(outDir, "FAILS.csv"))}\``,
  `- \`${relative(root, join(outDir, "ALL.csv"))}\``,
  `- \`${relative(root, join(outDir, "results.jsonl"))}\``,
  ``,
].join("\n");

writeFileSync(join(outDir, "REPORT.md"), report, "utf8");

// mirror to AOS logs + append batch index
const batchTag = `batch-${OFFSET}-${batchEnd}`;
writeFileSync(
  join(aosLogRoot, `${runId}-${batchTag}-SUMMARY.json`),
  JSON.stringify(summary, null, 2),
  "utf8",
);
writeFileSync(join(aosLogRoot, `${runId}-${batchTag}-REPORT.md`), report, "utf8");
writeFileSync(
  join(aosLogRoot, `${runId}-${batchTag}-FAILS.csv`),
  [csvHeader, ...csvRows.filter((_, idx) => results[idx]!.failCount > 0)].join(
    "\n",
  ) + "\n",
  "utf8",
);

const indexPath = join(aosLogRoot, "BATCH-INDEX.jsonl");
appendFileSync(
  indexPath,
  JSON.stringify({
    at: summary.at,
    runId,
    tier: TIER,
    offset: OFFSET,
    batchEnd,
    audited: results.length,
    clean: clean.length,
    soft: soft.length,
    hard: hard.length,
    nextOffset: summary.nextOffset,
    outDir,
  }) + "\n",
  "utf8",
);

// latest pointer
writeFileSync(
  join(aosLogRoot, "LATEST.json"),
  JSON.stringify({ ...summary, outDir, report: join(outDir, "REPORT.md") }, null, 2),
  "utf8",
);
writeFileSync(
  join(root, "scripts", "sim-output", "corpus-polish-audit", "LATEST.json"),
  JSON.stringify({ ...summary, outDir }, null, 2),
  "utf8",
);

console.log(report);
console.log(
  summary.done
    ? "BATCH COMPLETE — corpus fully covered for this root set"
    : `NEXT: --offset ${summary.nextOffset} --batch-size ${BATCH_SIZE || 1000}`,
);

// exit 0 always for batch pipeline (hard fails recorded in report)
process.exit(0);
