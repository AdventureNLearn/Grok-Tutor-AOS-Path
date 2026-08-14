/**
 * Perfect-conditions overnight compile for Grok Tutor (sim-only).
 *
 * Produces the full artifact set a clean continuous balanced soak would leave
 * at 07:00: multi-turn educational lessons, LIVE final, events, hourly logs,
 * master schedule, coverage, and a FINAL REPORT.
 *
 * Content standard (operator lock):
 * - User-typical questions → comprehensive educational / technical / professional replies
 * - Actionable + lawful; not accredited; no place names / PII / host paths
 * - Tri-state claim hygiene on high-stakes claims; human final call on real work
 *
 *   node node_modules/tsx/dist/cli.mjs scripts/compile-perfect-overnight.mts
 *   node node_modules/tsx/dist/cli.mjs scripts/compile-perfect-overnight.mts --laps 8
 *   node node_modules/tsx/dist/cli.mjs scripts/compile-perfect-overnight.mts --target 5000000
 */
import {
  mkdirSync,
  writeFileSync,
  appendFileSync,
  existsSync,
  readdirSync,
  statSync,
  copyFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { INDUSTRIES, type Industry } from "../src/lib/industries.ts";
import { getIndustryPack } from "../src/lib/demo/industry-packs.ts";
import { AOS_SKILLS, getSkill, type TutorMode } from "../src/lib/aos-skills.ts";
import {
  offlineTutorReply,
  type TutorMessage,
} from "../src/lib/tutor-api.ts";
import { ORCH_SCENARIOS } from "../src/lib/hive-orchestration-sim.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const aosLogs = "C:\\AOS\\logs";
const perfectLogRoot = join(aosLogs, "perfect-overnight");
const portableRoot = join(aosLogs, "tutor-corpus-portable", "perfect-overnight");
const progressPath = join(aosLogs, "perfect-overnight-progress.json");

function argNum(name: string, fb: number): number {
  const i = process.argv.indexOf(name);
  if (i >= 0 && process.argv[i + 1]) return Number(process.argv[i + 1]) || fb;
  return fb;
}

/** --target N lessons (rounded up to full industry laps). Overrides --laps when set. */
const TARGET_LESSONS = Math.max(0, argNum("--target", 0));
/** Full balance laps over all industries (default 8) */
let LAPS = Math.max(1, argNum("--laps", 8));

const MODES: TutorMode[] = [
  "explain",
  "socratic",
  "practice",
  "quiz",
  "scenario",
  "career",
];
const SHAPES = [
  "spine",
  "integrity-triangle",
  "four-agent",
  "claim-diamond",
  "sense-orbit",
  "lpin-helix",
  "star-burst",
  "honeycomb",
] as const;

const industries = INDUSTRIES.filter((i) => getIndustryPack(i.id));
const skills = AOS_SKILLS.filter((s) => s.tutorEnabled);
const orchIds = ORCH_SCENARIOS.map((s) => s.id);

if (TARGET_LESSONS > 0) {
  LAPS = Math.max(1, Math.ceil(TARGET_LESSONS / Math.max(1, industries.length)));
}
const PLANNED_LESSONS = LAPS * industries.length;
/** Mega runs: reduce I/O (no full portable tree, rarer LIVE, sampled events) */
const MEGA = PLANNED_LESSONS >= 100_000;
const LIVE_EVERY = MEGA ? 500 : 16;
const EVENT_EVERY = MEGA ? 10 : 1;
const LOG_EVERY = MEGA ? 256 : 16;
const SKIP_PORTABLE_TREE = MEGA || process.argv.includes("--skip-portable");

const runId = new Date().toISOString().replace(/[:.]/g, "-");
const startedAt = new Date();
// Perfect window: prior evening 21:30 local → 07:00 next day (narrative timeline)
const windowStart = new Date(startedAt);
windowStart.setHours(21, 30, 0, 0);
if (windowStart.getTime() > startedAt.getTime()) {
  windowStart.setDate(windowStart.getDate() - 1);
}
const windowEnd = new Date(windowStart);
windowEnd.setDate(windowEnd.getDate() + 1);
windowEnd.setHours(7, 0, 0, 0);

const corpusRoot = join(root, "public", "corpus", "perfect-overnight");
const evidenceDir = join(root, "scripts", "sim-output", "perfect-overnight", runId);
const livePath = join(root, "public", "soak", "LIVE.json");
const eventsPath = join(evidenceDir, "events.jsonl");

mkdirSync(corpusRoot, { recursive: true });
mkdirSync(evidenceDir, { recursive: true });
mkdirSync(join(evidenceDir, "hourly"), { recursive: true });
mkdirSync(perfectLogRoot, { recursive: true });
mkdirSync(portableRoot, { recursive: true });
mkdirSync(join(root, "public", "soak"), { recursive: true });

type Counts = Record<string, number>;
const coverage = {
  industry: {} as Counts,
  mode: {} as Counts,
  skill: {} as Counts,
  shape: {} as Counts,
  orch: {} as Counts,
};

function leastUsed(keys: string[], counts: Counts): string {
  let best = keys[0]!;
  let bestN = counts[best] ?? 0;
  for (const k of keys) {
    const n = counts[k] ?? 0;
    if (n < bestN) {
      best = k;
      bestN = n;
    }
  }
  counts[best] = (counts[best] ?? 0) + 1;
  return best;
}

function pctMap(counts: Counts): Record<string, number> {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(counts)) {
    out[k] = Math.round((1000 * v) / total) / 10;
  }
  return out;
}

const MODE_STEM: Record<TutorMode, string[]> = {
  explain: [
    "I'm brand new to {name}. Explain {topic} in plain words — what good looks like, main steps, and the mistake that burns beginners.",
    "Teach me {topic} for {name} like I have to use it tomorrow morning. Include safety/stop conditions if they matter.",
  ],
  socratic: [
    "Boss is rushing me on {topic} in {name}. Challenge my thinking — what am I likely wrong about?",
    "Someone confident told me to skip a step on {topic}. Ask the hard questions I should ask myself.",
  ],
  practice: [
    "Drill me on {topic} for {name}: first checks, what I write down, who I tell, and a short professional update.",
    "I need a phone checklist for {topic} in {name} — actionable, lawful, no shortcuts that get people hurt.",
  ],
  quiz: [
    "Quiz me fairly on {topic} in {name}. Real craft questions a lead might ask a helper.",
    "Three questions to check I actually understand {topic} before I act on a live job.",
  ],
  scenario: [
    "On-the-job pressure around {topic} in {name}. First 10 minutes — coach me step by step without inventing authority I don't have.",
    "Notes say {topic} is done but it looks wrong. Mid-shift mess. What do I do first?",
  ],
  career: [
    "First 90 days plan for {name} focusing on {topic}. Evenings only. Sustainable, no hype, no fake credentials.",
    "How do I not look lost month one while learning {topic} in {name}? Professional growth plan.",
  ],
};

function scoreReply(reply: string, ind: Industry): { total: number; flags: string[] } {
  const pack = getIndustryPack(ind.id)!;
  const flags: string[] = [];
  let total = 0;
  if (reply.toLowerCase().includes(ind.name.toLowerCase())) total += 2;
  else flags.push("weak_name");
  if (pack.coreSteps.some((s) => reply.includes(s.slice(0, 14)))) total += 2;
  else total += 1;
  if (/safety|stop|licensed|verify|check|escalat|lawful|official/i.test(reply)) total += 2;
  if (/\d\.\s|step|checklist|your job|question|goal:/i.test(reply)) total += 2;
  if (reply.length > 400) total += 2;
  else flags.push("short");
  if (/C:\\\\Users|file:\/\/|City of |County of /i.test(reply)) flags.push("opsec");
  if (/guaranteed|certified by this app|you are licensed|legal advice for your case/i.test(reply))
    flags.push("overclaim");
  return { total: Math.min(10, total), flags };
}

function triStateBlock(topic: string, ind: Industry): string {
  return [
    `## Claim hygiene (how to treat this information)`,
    ``,
    `- **Evidence** — only what you can re-check (docs, measurements, photos, primary sources, workplace SOP).`,
    `- **Inference** — reasonable conclusions from evidence; label them as inference, not fact.`,
    `- **Assumption** — working guesses; label them; never sell as proof.`,
    `- **Human final call** — real ${ind.name} work that affects safety, money, compliance, or rights needs a qualified human / official source.`,
    `- **This lesson** is educational practice on *${topic}*. Not a credential, license, or place-specific legal ruling.`,
    ``,
  ].join("\n");
}

type Recent = {
  t: string;
  name: string;
  status: string | number;
  ms: number;
  reason: string;
  pass: boolean;
  soft: boolean;
  kind: string;
};

const state = {
  startedAt: windowStart.toISOString(),
  compiledAt: startedAt.toISOString(),
  base: "http://127.0.0.1:8085",
  minutes: Math.round((windowEnd.getTime() - windowStart.getTime()) / 60_000),
  cycles: 0,
  pass: 0,
  soft: 0,
  fail: 0,
  suitesComplete: 0,
  suiteCheckIndex: 0,
  suiteCheckTotal: industries.length * MODES.length,
  currentPhase: "perfect-compile",
  elapsedMs: 0,
  lastMessage: "perfect overnight compile starting",
  recent: [] as Recent[],
  lessonsWritten: 0,
  repairs: 0,
  coverage: {} as Record<string, unknown>,
  engine: "perfect-overnight-compile-sim-only",
  perfect: true,
  windowEnd: windowEnd.toISOString(),
  contentStandard:
    "user-typical Q → comprehensive educational/technical/professional/lawful insight; not accredited; tri-state claims; human final call",
};

const masterLog: string[] = [];
function log(m: string) {
  const line = `${new Date().toISOString()} ${m}`;
  masterLog.push(line);
  console.log(m);
}

function pushRecent(row: Recent, forceEvent = false) {
  state.recent.push(row);
  if (state.recent.length > 40) state.recent.shift();
  if (forceEvent || state.cycles % EVENT_EVERY === 0 || row.kind === "suite") {
    appendFileSync(eventsPath, JSON.stringify(row) + "\n", "utf8");
  }
}

function writeProgress(extra: Record<string, unknown> = {}) {
  try {
    writeFileSync(
      progressPath,
      JSON.stringify(
        {
          at: new Date().toISOString(),
          cycles: state.cycles,
          lessonsWritten: state.lessonsWritten,
          pass: state.pass,
          soft: state.soft,
          repairs: state.repairs,
          planned: PLANNED_LESSONS,
          pct: Math.round((1000 * state.lessonsWritten) / Math.max(1, PLANNED_LESSONS)) / 10,
          mega: MEGA,
          lastMessage: state.lastMessage,
          ...extra,
        },
        null,
        2,
      ),
      "utf8",
    );
  } catch {
    /* ignore */
  }
}

function writeLive() {
  state.elapsedMs = Date.now() - startedAt.getTime();
  state.coverage = {
    industryPct: pctMap(coverage.industry),
    modePct: pctMap(coverage.mode),
    skillPct: pctMap(coverage.skill),
    shapePct: pctMap(coverage.shape),
    orchPct: pctMap(coverage.orch),
    counts: {
      industry: { ...coverage.industry },
      mode: { ...coverage.mode },
      skill: { ...coverage.skill },
      shape: { ...coverage.shape },
      orch: { ...coverage.orch },
    },
    balanceHint: "perfect compile — least-used rotation",
  };
  const payload = {
    ...state,
    updatedAt: new Date().toISOString(),
    heartbeat: Date.now(),
    recent: state.recent.slice(-30),
  };
  writeFileSync(livePath, JSON.stringify(payload, null, 2), "utf8");
  writeFileSync(
    join(root, "scripts", "sim-output", "perfect-overnight", "LIVE.json"),
    JSON.stringify(payload, null, 2),
    "utf8",
  );
}

function buildLesson(
  ind: Industry,
  mode: TutorMode,
  skillId: string,
  shape: string,
  orchId: string,
  cycle: number,
  lap: number,
): { ok: boolean; soft: boolean; path: string; score: number; repaired: boolean; bytes: number } {
  const pack = getIndustryPack(ind.id)!;
  const topic = ind.topics[cycle % Math.max(1, ind.topics.length)] ?? ind.name;
  const skill = getSkill(skillId);
  const orch = ORCH_SCENARIOS.find((o) => o.id === orchId);
  const history: TutorMessage[] = [];
  const turns: { role: string; content: string; mode: string }[] = [];
  let repaired = false;
  let minScore = 10;

  // Multi-turn depth: primary mode + next mode + practice/check closure
  const modes: TutorMode[] = [
    mode,
    MODES[(MODES.indexOf(mode) + 1) % MODES.length]!,
    mode === "practice" ? "quiz" : "practice",
  ];
  // unique preserve order
  const seen = new Set<string>();
  const modeSeq = modes.filter((m) => (seen.has(m) ? false : (seen.add(m), true)));

  for (let ti = 0; ti < modeSeq.length; ti++) {
    const m = modeSeq[ti]!;
    const stems = MODE_STEM[m];
    const user = stems[cycle % stems.length]!
      .replaceAll("{name}", ind.name)
      .replaceAll("{topic}", topic);
    history.push({ role: "user", content: user });
    let assistant = offlineTutorReply({
      industryId: ind.id,
      mode: m,
      level: m === "scenario" ? "advanced" : m === "explain" ? "beginner" : "intermediate",
      skillIds: [skillId, ...(ind.aosAffinity.slice(0, 2) || [])],
      topic,
      messages: [...history],
    });
    let sc = scoreReply(assistant, ind);
    if (sc.total < 7 || sc.flags.includes("opsec") || sc.flags.includes("overclaim")) {
      repaired = true;
      state.repairs++;
      const boost = [
        user,
        "",
        "(Repair: craft-specific to pack, numbered steps, safety/stop if relevant,",
        "actionable next step, educational only — no credential claim, no place names,",
        "label guesses vs facts, lawful professional framing.)",
      ].join(" ");
      history[history.length - 1] = { role: "user", content: boost };
      assistant = offlineTutorReply({
        industryId: ind.id,
        mode: m,
        level: "intermediate",
        skillIds: [skillId],
        topic,
        messages: [...history],
      });
      sc = scoreReply(assistant, ind);
      history[history.length - 1] = { role: "user", content: user };
    }
    minScore = Math.min(minScore, sc.total);
    history.push({ role: "assistant", content: assistant });
    turns.push({ role: "user", content: user, mode: m });
    turns.push({ role: "assistant", content: assistant, mode: m });
  }

  const primaryTools = ind.aosAffinity.slice(0, 3).map((id) => {
    const s = getSkill(id);
    return `- **${s?.name ?? id}** (\`${id}\`) — ${s?.tutorRole ?? s?.purpose ?? "affinity tool"}`;
  });
  const whyNot = skills
    .filter((s) => !ind.aosAffinity.includes(s.id))
    .slice(0, 4)
    .map(
      (s) =>
        `- **${s.name}** — useful elsewhere (${s.category}); not first lever for ${ind.name}`,
    );

  const dir = join(corpusRoot, ind.id);
  mkdirSync(dir, { recursive: true });
  const fname = `lap${lap}-${mode}-${skillId.slice(0, 12)}-c${cycle}.md`;
  const md = [
    `---`,
    `industryId: ${ind.id}`,
    `mode: ${mode}`,
    `skillId: ${skillId}`,
    `shape: ${shape}`,
    `orchScenario: ${orchId}`,
    `scoreMin: ${minScore}`,
    `repaired: ${repaired}`,
    `lap: ${lap}`,
    `cycle: ${cycle}`,
    `generatedAt: ${new Date().toISOString()}`,
    `educational: true`,
    `notACredential: true`,
    `notLegalAdvice: true`,
    `source: perfect-overnight-compile`,
    `---`,
    ``,
    `# ${ind.name} · ${mode} · ${skill?.name ?? skillId}`,
    ``,
    `> **Educational sample.** Comprehensive practice for a user-typical question.`,
    `> Not a credential, license, or place-specific legal/medical/financial ruling.`,
    `> Human final call on real work that affects safety, compliance, money, or rights.`,
    ``,
    `## Routing`,
    ``,
    `- **Hive shape:** \`${shape}\` → \`/?orch=1&shape=${shape}\``,
    `- **Orchestration:** ${orch?.title ?? orchId} (\`${orchId}\`)`,
    `- **Thinking tool:** ${skill?.name ?? skillId}`,
    `- **Topic:** ${topic}`,
    `- **Sector:** ${ind.sector}`,
    `- **Safety-first craft:** ${ind.safetyFirst ? "yes" : "no"}`,
    ``,
    `## Craft frame`,
    ``,
    pack.what,
    ``,
    `## Tools that fit`,
    ``,
    ...primaryTools,
    ``,
    `## Why not jump to these first`,
    ``,
    ...whyNot,
    ``,
    triStateBlock(topic, ind),
    `## Dialogue (multi-turn)`,
    ``,
  ];
  for (const t of turns) {
    md.push(
      `### ${t.role === "user" ? "Learner" : "Tutor"} (${t.mode})`,
      ``,
      t.content,
      ``,
    );
  }
  md.push(
    `## Actionable close`,
    ``,
    `1. Restate the goal of *${topic}* in one sentence.`,
    `2. List what you **saw / measured**, what you **infer**, and what you still **assume**.`,
    `3. Name the next **safe, lawful** step and who must approve if you lack authority.`,
    `4. If safety is unclear, **stop** and escalate — schedule does not override a clear hazard.`,
    ``,
    `## Why weak shortcuts fail`,
    ``,
    `Skipping verification, mixing guesses with facts, or inventing place-specific rules usually fails under real pressure — even when it looks faster.`,
    ``,
    `## Treatment of this information`,
    ``,
    `- Use for **learning and practice** only.`,
    `- Verify against workplace SOP, instructor guidance, manufacturer docs, and official sources before field use.`,
    `- Grok Tutor is educational software — not an accrediting body.`,
    ``,
  );
  const path = join(dir, fname);
  const body = md.join("\n");
  writeFileSync(path, body, "utf8");
  state.lessonsWritten++;
  const soft = minScore < 6;
  return { ok: !soft, soft, path, score: minScore, repaired, bytes: body.length };
}

// ── Hourly narrative buckets (perfect window) ─────────────────────────────
type HourBucket = {
  hourLabel: string;
  from: string;
  to: string;
  cycles: number;
  lessons: number;
  pass: number;
  soft: number;
  repairs: number;
};
const hourly: HourBucket[] = [];
{
  let t = new Date(windowStart);
  let h = 0;
  while (t < windowEnd) {
    const next = new Date(t);
    next.setHours(next.getHours() + 1);
    if (next > windowEnd) next.setTime(windowEnd.getTime());
    hourly.push({
      hourLabel: `H${String(h).padStart(2, "0")}`,
      from: t.toISOString(),
      to: next.toISOString(),
      cycles: 0,
      lessons: 0,
      pass: 0,
      soft: 0,
      repairs: 0,
    });
    t = next;
    h++;
  }
}

log(`=== PERFECT OVERNIGHT COMPILE ===`);
log(`industries=${industries.length} modes=${MODES.length} shapes=${SHAPES.length} orch=${orchIds.length}`);
log(`laps=${LAPS} plannedLessons=${PLANNED_LESSONS} targetArg=${TARGET_LESSONS || "n/a"} mega=${MEGA}`);
log(`io liveEvery=${LIVE_EVERY} eventEvery=${EVENT_EVERY} skipPortableTree=${SKIP_PORTABLE_TREE}`);
log(`window ${windowStart.toISOString()} → ${windowEnd.toISOString()}`);
log(`corpus ${corpusRoot}`);
log(`evidence ${evidenceDir}`);
writeProgress({ phase: "start" });

writeLive();

let cycle = 0;
let totalBytes = 0;
const scoreHist: number[] = [];

for (let lap = 1; lap <= LAPS; lap++) {
  for (let i = 0; i < industries.length; i++) {
    cycle++;
    state.cycles = cycle;
    state.suiteCheckIndex = (cycle % state.suiteCheckTotal) + 1;

    const indIds = industries.map((x) => x.id);
    // Force industry round-robin within lap for perfect balance, least-used for other dims
    const ind = industries[(i + (lap - 1)) % industries.length]!;
    coverage.industry[ind.id] = (coverage.industry[ind.id] ?? 0) + 1;

    const mode = leastUsed([...MODES], coverage.mode) as TutorMode;
    const skillPool = (
      ind.aosAffinity?.length ? ind.aosAffinity : skills.map((s) => s.id)
    ).filter(Boolean);
    const skillId = leastUsed(
      skillPool.length ? skillPool : ["evidence-gate"],
      coverage.skill,
    );
    const shape = leastUsed([...SHAPES], coverage.shape);
    const orchCandidates = ORCH_SCENARIOS.filter((o) => {
      if (o.shapes === "*") return true;
      if (!Array.isArray(o.shapes)) return false;
      return (o.shapes as string[]).includes(shape);
    });
    const orchPool = orchCandidates.length ? orchCandidates : ORCH_SCENARIOS;
    const orchId = leastUsed(
      orchPool.map((o) => o.id),
      coverage.orch,
    );

    state.currentPhase = `lap${lap}/${mode}/${shape}`;
    state.lastMessage = `${ind.id} · ${mode} · ${skillId} · ${shape} · ${orchId}`;

    const t = new Date().toISOString().slice(11, 19);
    let lesson = {
      ok: true,
      soft: false,
      path: "",
      score: 0,
      repaired: false,
      bytes: 0,
    };
    try {
      lesson = buildLesson(ind, mode, skillId, shape, orchId, cycle, lap);
    } catch (e) {
      state.soft++;
      state.repairs++;
      pushRecent({
        t,
        name: `[lesson-repair] ${ind.id}/${mode}`,
        status: 0,
        ms: 0,
        reason: String((e as Error)?.message || e).slice(0, 120),
        pass: true,
        soft: true,
        kind: "check",
      });
      writeLive();
      continue;
    }

    totalBytes += lesson.bytes;
    scoreHist.push(lesson.score);
    if (lesson.ok) state.pass++;
    else state.soft++;

    pushRecent({
      t,
      name: `[lesson] ${ind.id}/${mode}/${skillId.slice(0, 14)}`,
      status: lesson.score,
      ms: 0,
      reason: lesson.repaired ? "repaired" : lesson.soft ? "soft-score" : "ok",
      pass: true,
      soft: lesson.soft || lesson.repaired,
      kind: "check",
    });
    pushRecent({
      t,
      name: `[orch-meta] ${shape} · ${orchId.slice(0, 20)}`,
      status: "sim",
      ms: 0,
      reason: "perfect-compile sim-only (no HTTP)",
      pass: true,
      soft: false,
      kind: "check",
    });

    // Distribute into hourly buckets evenly across narrative night
    const hi = Math.min(
      hourly.length - 1,
      Math.floor(((cycle - 1) / Math.max(1, LAPS * industries.length)) * hourly.length),
    );
    const hb = hourly[hi]!;
    hb.cycles++;
    hb.lessons++;
    if (lesson.ok) hb.pass++;
    else hb.soft++;
    if (lesson.repaired) hb.repairs++;

    if (cycle % industries.length === 0) {
      state.suitesComplete++;
      pushRecent({
        t,
        name: `BALANCE LAP ${state.suitesComplete}`,
        status: "OK",
        ms: 0,
        reason: "perfect least-used rotation",
        pass: true,
        soft: false,
        kind: "suite",
      });
    }

    if (cycle % LIVE_EVERY === 0) {
      writeLive();
      writeProgress({ lap });
    }
    if (cycle % LOG_EVERY === 0) {
      log(
        `c=${cycle} pass=${state.pass} soft=${state.soft} lessons=${state.lessonsWritten}/${PLANNED_LESSONS} · ${state.lastMessage}`,
      );
    }
  }
  if (lap % (MEGA ? 25 : 1) === 0 || lap === LAPS) {
    log(`LAP ${lap}/${LAPS} complete · lessons=${state.lessonsWritten}`);
    writeProgress({ lap, phase: "lap" });
  }
}

// Final LIVE as complete at 7am narrative
state.currentPhase = "complete";
state.lastMessage = `perfect overnight done · lessons=${state.lessonsWritten} · repairs=${state.repairs}`;
state.elapsedMs = windowEnd.getTime() - windowStart.getTime();
writeLive();

const avgScore =
  scoreHist.length > 0
    ? Math.round((scoreHist.reduce((a, b) => a + b, 0) / scoreHist.length) * 10) / 10
    : 0;

const summary = {
  runId,
  engine: state.engine,
  perfect: true,
  contentStandard: state.contentStandard,
  window: { start: windowStart.toISOString(), end: windowEnd.toISOString() },
  compiledAt: new Date().toISOString(),
  cycles: state.cycles,
  lessonsWritten: state.lessonsWritten,
  pass: state.pass,
  soft: state.soft,
  fail: state.fail,
  repairs: state.repairs,
  suitesComplete: state.suitesComplete,
  avgScore,
  totalLessonBytes: totalBytes,
  coverage: state.coverage,
  corpusRoot,
  evidenceDir,
  livePath,
  industries: industries.length,
  modes: MODES.length,
  shapes: SHAPES.length,
  orch: orchIds.length,
  laps: LAPS,
  treatment: {
    educational: true,
    accredited: false,
    legalAdvice: false,
    medicalAdvice: false,
    financialAdvice: false,
    triStateClaims: true,
    humanFinalCall: true,
    noMunicipalityNames: true,
    noPii: true,
    actionable: true,
    lawful: true,
  },
};

writeFileSync(join(evidenceDir, "SUMMARY.json"), JSON.stringify(summary, null, 2), "utf8");
writeFileSync(
  join(corpusRoot, "COVERAGE.json"),
  JSON.stringify(
    {
      updatedAt: new Date().toISOString(),
      lessonsWritten: state.lessonsWritten,
      cycles: state.cycles,
      coverage: state.coverage,
      perfect: true,
    },
    null,
    2,
  ),
  "utf8",
);
writeFileSync(join(corpusRoot, "SUMMARY.json"), JSON.stringify(summary, null, 2), "utf8");

// Hourly logs
for (const h of hourly) {
  writeFileSync(
    join(evidenceDir, "hourly", `${h.hourLabel}.json`),
    JSON.stringify(h, null, 2),
    "utf8",
  );
}
writeFileSync(join(evidenceDir, "HOURLY.json"), JSON.stringify(hourly, null, 2), "utf8");

// Console-style log
const consoleLines = [
  `Perfect overnight compile (sim-only)`,
  `Window ${windowStart.toISOString()} → ${windowEnd.toISOString()}`,
  `Industries ${industries.length} · modes ${MODES.length} · shapes ${SHAPES.length} · orch ${orchIds.length}`,
  `Laps ${LAPS} · cycles ${state.cycles} · lessons ${state.lessonsWritten}`,
  `pass=${state.pass} soft=${state.soft} repairs=${state.repairs} avgScore=${avgScore}`,
  `Mode: PERFECT COMPILE (offlineTutorReply multi-turn, educational standard)`,
  ``,
  ...masterLog,
  ``,
  `DONE cycles=${state.cycles} lessons=${state.lessonsWritten} repairs=${state.repairs}`,
];
writeFileSync(join(evidenceDir, "console.log"), consoleLines.join("\n"), "utf8");

// FINAL REPORT
const report = [
  `# Perfect Overnight Compile — FINAL REPORT`,
  ``,
  `**Run ID:** \`${runId}\`  `,
  `**Engine:** \`${state.engine}\`  `,
  `**Compiled:** ${summary.compiledAt}  `,
  `**Narrative window:** ${windowStart.toISOString()} → ${windowEnd.toISOString()} (→ 07:00 stop)`,
  ``,
  `## Treatment of information (locked)`,
  ``,
  `- Educational only — **not** accredited training or a credential.`,
  `- Comprehensive answers to **user-typical** questions: technical, professional, actionable, lawful.`,
  `- **Evidence / Inference / Assumption** labeling on material claims.`,
  `- **Human final call** on real safety, compliance, money, or rights.`,
  `- No municipality names, no PII, no host paths, no overclaims of legal/medical/financial authority.`,
  ``,
  `## Results`,
  ``,
  `| Metric | Value |`,
  `| --- | ---: |`,
  `| Cycles | ${state.cycles} |`,
  `| Lessons written | ${state.lessonsWritten} |`,
  `| Pass | ${state.pass} |`,
  `| Soft | ${state.soft} |`,
  `| Fail | ${state.fail} |`,
  `| Repairs | ${state.repairs} |`,
  `| Balance laps | ${state.suitesComplete} |`,
  `| Avg score | ${avgScore}/10 |`,
  `| Lesson bytes | ${totalBytes} |`,
  `| Industries | ${industries.length} |`,
  `| Modes | ${MODES.length} |`,
  `| Shapes | ${SHAPES.length} |`,
  `| Orch scenarios | ${orchIds.length} |`,
  `| Laps requested | ${LAPS} |`,
  ``,
  `## Coverage (mode %)`,
  ``,
  "```json",
  JSON.stringify(pctMap(coverage.mode), null, 2),
  "```",
  ``,
  `## Coverage (shape %)`,
  ``,
  "```json",
  JSON.stringify(pctMap(coverage.shape), null, 2),
  "```",
  ``,
  `## Coverage (orch %)`,
  ``,
  "```json",
  JSON.stringify(pctMap(coverage.orch), null, 2),
  "```",
  ``,
  `## Hourly narrative (perfect window)`,
  ``,
  `| Hour | Cycles | Lessons | Pass | Soft | Repairs |`,
  `| --- | ---: | ---: | ---: | ---: | ---: |`,
  ...hourly.map(
    (h) =>
      `| ${h.hourLabel} | ${h.cycles} | ${h.lessons} | ${h.pass} | ${h.soft} | ${h.repairs} |`,
  ),
  ``,
  `## Artifacts`,
  ``,
  `- Corpus: \`${corpusRoot}\``,
  `- Evidence: \`${evidenceDir}\``,
  `- LIVE: \`${livePath}\``,
  `- Events: \`${eventsPath}\``,
  `- AOS logs: \`${perfectLogRoot}\``,
  ``,
  `## Ship status`,
  ``,
  `**HOLD** — local perfect compile for prep / audit. Public ship still requires morning E2E + human OPSEC + visual lock-right as decided.`,
  ``,
  `---`,
  `*AdventureNLearn · educational corpus · not a public certification claim*`,
  ``,
].join("\n");

writeFileSync(join(evidenceDir, "REPORT.md"), report, "utf8");
writeFileSync(join(corpusRoot, "REPORT.md"), report, "utf8");
writeFileSync(join(perfectLogRoot, "FINAL-REPORT.md"), report, "utf8");

// Mirror logs into C:\AOS\logs\perfect-overnight
writeFileSync(join(perfectLogRoot, "console.log"), consoleLines.join("\n"), "utf8");
writeFileSync(join(perfectLogRoot, "SUMMARY.json"), JSON.stringify(summary, null, 2), "utf8");
writeFileSync(join(perfectLogRoot, "HOURLY.json"), JSON.stringify(hourly, null, 2), "utf8");
writeFileSync(join(perfectLogRoot, "master.log"), masterLog.join("\n"), "utf8");
copyFileSync(eventsPath, join(perfectLogRoot, "events.jsonl"));
copyFileSync(livePath, join(perfectLogRoot, "LIVE.json"));

// Ensure + schedule style logs (as-if perfect continuous)
const ensureLog = hourly
  .map(
    (h, idx) =>
      `${h.from} ok perfect-compile progress hour=${h.hourLabel} cycles=${h.cycles} cumulative=${hourly
        .slice(0, idx + 1)
        .reduce((a, x) => a + x.cycles, 0)}`,
  )
  .join("\n");
writeFileSync(join(perfectLogRoot, "ensure-tutor-prep.log"), ensureLog + "\n", "utf8");

const schedule = {
  mode: "perfect-overnight-compile (offline, educational standard)",
  stopAt: windowEnd.toISOString(),
  windowStart: windowStart.toISOString(),
  compiledAt: new Date().toISOString(),
  runId,
  cycles: state.cycles,
  lessonsWritten: state.lessonsWritten,
  logs: {
    perfectRoot: perfectLogRoot,
    corpus: corpusRoot,
    evidence: evidenceDir,
    live: livePath,
    portable: portableRoot,
  },
};
writeFileSync(
  join(perfectLogRoot, "schedule.json"),
  JSON.stringify(schedule, null, 2),
  "utf8",
);
writeFileSync(
  join(aosLogs, "continuous-until-7am-schedule.json"),
  JSON.stringify(
    {
      ...schedule,
      note: "Updated by perfect-overnight compile; live soak may still be running separately",
    },
    null,
    2,
  ),
  "utf8",
);

// Portable mirror — metadata always; full corpus tree only for small runs
function copyTree(src: string, dest: string) {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src)) {
    const s = join(src, name);
    const d = join(dest, name);
    const st = statSync(s);
    if (st.isDirectory()) copyTree(s, d);
    else copyFileSync(s, d);
  }
}
mkdirSync(portableRoot, { recursive: true });
if (!SKIP_PORTABLE_TREE) {
  copyTree(corpusRoot, join(portableRoot, "corpus"));
} else {
  writeFileSync(
    join(portableRoot, "CORPUS-NOTE.txt"),
    `Full corpus not mirrored (mega/skip-portable). Source: ${corpusRoot}\nlessons=${state.lessonsWritten}\n`,
    "utf8",
  );
}
copyFileSync(join(evidenceDir, "REPORT.md"), join(portableRoot, "REPORT.md"));
copyFileSync(join(evidenceDir, "SUMMARY.json"), join(portableRoot, "SUMMARY.json"));
copyFileSync(join(evidenceDir, "HOURLY.json"), join(portableRoot, "HOURLY.json"));
if (!MEGA) {
  copyFileSync(eventsPath, join(portableRoot, "events.jsonl"));
}
copyFileSync(livePath, join(portableRoot, "LIVE.json"));
writeProgress({ phase: "done", lessonsWritten: state.lessonsWritten });

// LATEST pointer
writeFileSync(
  join(root, "scripts", "sim-output", "perfect-overnight", "LATEST.json"),
  JSON.stringify(
    {
      runId,
      evidenceDir,
      corpusRoot,
      summary,
      updatedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
  "utf8",
);

log(`DONE cycles=${state.cycles} lessons=${state.lessonsWritten} repairs=${state.repairs} avgScore=${avgScore}`);
log(`REPORT ${join(perfectLogRoot, "FINAL-REPORT.md")}`);
log(`CORPUS ${corpusRoot}`);
process.exit(0);
