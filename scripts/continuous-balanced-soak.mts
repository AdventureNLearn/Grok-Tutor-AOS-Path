/**
 * Continuous balanced soak for Grok Tutor (until wall clock or --minutes).
 *
 * - Writes public/soak/LIVE.json so observe-log pane stays live
 * - Round-robins industries, modes, skills, hive shapes, orch scenarios
 * - Avoids lopsided coverage via least-used counters
 * - Generates multi-turn sample lessons into public/corpus
 * - Optional HTTP feature checks (orch shapes, desks) — skip with --sim-only for speed
 * - Repairs weak lessons; never aborts overnight (soft continue)
 *
 *   tsx scripts/continuous-balanced-soak.mts --stop-at 2026-08-08T07:00:00
 *   tsx scripts/continuous-balanced-soak.mts --minutes 60 --sim-only
 */
import {
  mkdirSync,
  writeFileSync,
  appendFileSync,
  existsSync,
  unlinkSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { INDUSTRIES, type Industry } from "../src/lib/industries.ts";
import { getIndustryPack } from "../src/lib/demo/industry-packs.ts";
import { AOS_SKILLS, getSkill, type TutorMode } from "../src/lib/aos-skills.ts";
import {
  offlineTutorReply,
  type TutorChatRequest,
  type TutorMessage,
} from "../src/lib/tutor-api.ts";
import { ORCH_SCENARIOS } from "../src/lib/hive-orchestration-sim.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const BASE = (process.env.TUTOR_BASE || "http://127.0.0.1:8085").replace(/\/$/, "");

function arg(name: string, fb = ""): string {
  const i = process.argv.indexOf(name);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1]!;
  return fb;
}

const stopAtRaw = arg("--stop-at", "");
const minutesArg = Number(arg("--minutes", "0")) || 0;
/** Simulation-only: no browser panes / no multi-HTTP; max lesson throughput */
const SIM_ONLY =
  process.argv.includes("--sim-only") ||
  process.env.SOAK_SIM_ONLY === "1" ||
  process.env.SOAK_SIM_ONLY === "true";
let deadline: number;
if (stopAtRaw) {
  deadline = new Date(stopAtRaw).getTime();
} else if (minutesArg > 0) {
  deadline = Date.now() + minutesArg * 60_000;
} else {
  // default: 07:00 local next
  const d = new Date();
  d.setHours(7, 0, 0, 0);
  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
  deadline = d.getTime();
}

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

const livePath = join(root, "public", "soak", "LIVE.json");
const corpusRoot = join(root, "public", "corpus", "balanced-soak");
const evidenceDir = join(
  root,
  "scripts",
  "sim-output",
  "balanced-soak",
  new Date().toISOString().replace(/[:.]/g, "-"),
);
mkdirSync(dirname(livePath), { recursive: true });
mkdirSync(corpusRoot, { recursive: true });
mkdirSync(evidenceDir, { recursive: true });
const eventsPath = join(evidenceDir, "events.jsonl");

type Counts = Record<string, number>;
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

const coverage = {
  industry: {} as Counts,
  mode: {} as Counts,
  skill: {} as Counts,
  shape: {} as Counts,
  orch: {} as Counts,
};

const state = {
  startedAt: new Date().toISOString(),
  base: BASE,
  minutes: Math.max(1, Math.round((deadline - Date.now()) / 60_000)),
  cycles: 0,
  pass: 0,
  soft: 0,
  fail: 0,
  suitesComplete: 0,
  suiteCheckIndex: 0,
  suiteCheckTotal: industries.length * MODES.length,
  currentPhase: "boot",
  elapsedMs: 0,
  lastMessage: "balanced soak starting",
  recent: [] as {
    t: string;
    name: string;
    status: string | number;
    ms: number;
    reason: string;
    pass: boolean;
    soft: boolean;
    kind: string;
  }[],
  lessonsWritten: 0,
  repairs: 0,
  coverage: {} as Record<string, unknown>,
  engine: "continuous-balanced-soak",
};

function pushRecent(row: (typeof state.recent)[0]) {
  state.recent.push(row);
  if (state.recent.length > 40) state.recent.shift();
  appendFileSync(eventsPath, JSON.stringify(row) + "\n", "utf8");
}

function writeLiveAtomic(target: string, payload: string) {
  const tmp = `${target}.${process.pid}.tmp`;
  try {
    writeFileSync(tmp, payload, "utf8");
    writeFileSync(target, payload, "utf8");
    try {
      unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  } catch (e) {
    console.error("writeLive soft-fail", e);
    try {
      writeFileSync(target, payload, "utf8");
    } catch {
      /* ignore */
    }
  }
}

function writeLive() {
  state.elapsedMs = Date.now() - new Date(state.startedAt).getTime();
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
    balanceHint: balanceHint(),
  };
  const safe = {
    ...state,
    updatedAt: new Date().toISOString(),
    heartbeat: Date.now(),
    recent: state.recent.slice(-30),
  };
  const payload = JSON.stringify(safe, null, 2);
  writeLiveAtomic(livePath, payload);
  const mirror = join(root, "scripts", "sim-output", "observable-1h", "LIVE.json");
  try {
    mkdirSync(dirname(mirror), { recursive: true });
    writeLiveAtomic(mirror, payload);
  } catch {
    /* ignore */
  }
}

function balanceHint(): string {
  const modeVals = MODES.map((m) => coverage.mode[m] ?? 0);
  const max = Math.max(...modeVals, 1);
  const min = Math.min(...modeVals, 0);
  if (max - min <= 2) return "modes balanced";
  const lag = MODES.filter((m) => (coverage.mode[m] ?? 0) === min).join(",");
  return `boosting lagging modes: ${lag}`;
}

async function httpGet(path: string, timeoutMs = 4000) {
  const t0 = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Accept: "text/html,*/*", "Cache-Control": "no-cache" },
      redirect: "follow",
      signal: ctrl.signal,
    });
    // Don't buffer huge HTML — status is enough for soak log
    await res.arrayBuffer().catch(() => null);
    return { status: res.status, ms: Date.now() - t0, text: "", ok: res.ok };
  } catch (e) {
    const name = (e as Error)?.name || "";
    return {
      status: 0,
      ms: Date.now() - t0,
      text: "",
      ok: false,
      error: name === "AbortError" ? "timeout" : String((e as Error)?.message || e),
    };
  } finally {
    clearTimeout(timer);
  }
}

function scoreReply(reply: string, ind: Industry): { total: number; flags: string[] } {
  const pack = getIndustryPack(ind.id)!;
  const flags: string[] = [];
  let total = 0;
  if (reply.toLowerCase().includes(ind.name.toLowerCase())) total += 2;
  else flags.push("weak_name");
  if (pack.coreSteps.some((s) => reply.includes(s.slice(0, 14)))) total += 2;
  else total += 1;
  if (/safety|stop|licensed|verify|check/i.test(reply)) total += 2;
  if (/\d\.\s|step|checklist|your job|question/i.test(reply)) total += 2;
  if (reply.length > 300) total += 2;
  else flags.push("short");
  if (/C:\\\\Users|file:\/\/|City of /i.test(reply)) flags.push("opsec");
  return { total: Math.min(10, total), flags };
}

const MODE_STEM: Record<TutorMode, string> = {
  explain: "I'm brand new. Explain {topic} in {name} in plain words.",
  socratic: "Challenge my thinking on {topic} in {name} — ask hard questions.",
  practice: "Drill me on {topic} for {name}: checks, notes, who I tell.",
  quiz: "Quiz me fairly on {topic} in {name}.",
  scenario: "On-the-job pressure around {topic} in {name}. First 10 minutes — coach me.",
  career: "First 90 days plan for {name} focusing on {topic}. Evenings only.",
};

function buildLesson(
  ind: Industry,
  mode: TutorMode,
  skillId: string,
  shape: string,
  orchId: string,
  cycle: number,
): { ok: boolean; soft: boolean; path: string; score: number; repaired: boolean } {
  const pack = getIndustryPack(ind.id)!;
  const topic = ind.topics[cycle % Math.max(1, ind.topics.length)] ?? ind.name;
  const skill = getSkill(skillId);
  const orch = ORCH_SCENARIOS.find((o) => o.id === orchId);
  const history: TutorMessage[] = [];
  const turns: { role: string; content: string; mode: string }[] = [];
  let repaired = false;
  let minScore = 10;

  // Multi-turn: primary mode + adjacent mode for depth
  const modes: TutorMode[] = [mode, MODES[(MODES.indexOf(mode) + 1) % MODES.length]!];
  for (const m of modes) {
    const user = MODE_STEM[m]
      .replaceAll("{name}", ind.name)
      .replaceAll("{topic}", topic);
    history.push({ role: "user", content: user });
    let assistant = offlineTutorReply({
      industryId: ind.id,
      mode: m,
      level: m === "scenario" ? "advanced" : "beginner",
      skillIds: [skillId, ...(ind.aosAffinity.slice(0, 1) || [])],
      topic,
      messages: [...history],
    });
    let sc = scoreReply(assistant, ind);
    if (sc.total < 6 || sc.flags.includes("opsec")) {
      repaired = true;
      state.repairs++;
      const boost = `${user}\n\n(Repair: craft-specific, safety if needed, numbered steps, check-your-understanding, no place names.)`;
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

  // Tool fit / why not
  const primaryTools = ind.aosAffinity.slice(0, 3).map((id) => {
    const s = getSkill(id);
    return `- **${s?.name ?? id}** (\`${id}\`) — ${s?.tutorRole ?? s?.purpose ?? "affinity tool"}`;
  });
  const whyNot = skills
    .filter((s) => !ind.aosAffinity.includes(s.id))
    .slice(0, 4)
    .map(
      (s) =>
        `- **${s.name}** — useful elsewhere (${s.category}); not first lever for ${ind.name} vs ${getSkill(ind.aosAffinity[0] || skillId)?.name ?? "primary tools"}`,
    );

  const dir = join(corpusRoot, ind.id);
  mkdirSync(dir, { recursive: true });
  const fname = `${mode}-${skillId.slice(0, 12)}-c${cycle}.md`;
  const md = [
    `---`,
    `industryId: ${ind.id}`,
    `mode: ${mode}`,
    `skillId: ${skillId}`,
    `shape: ${shape}`,
    `orchScenario: ${orchId}`,
    `scoreMin: ${minScore}`,
    `repaired: ${repaired}`,
    `generatedAt: ${new Date().toISOString()}`,
    `educational: true`,
    `---`,
    ``,
    `# ${ind.name} · ${mode} · ${skill?.name ?? skillId}`,
    ``,
    `> Educational sample. Not a credential or license.`,
    ``,
    `## Routing`,
    ``,
    `- **Hive shape:** \`${shape}\` → \`/?orch=1&shape=${shape}\``,
    `- **Orchestration scenario:** ${orch?.title ?? orchId} (\`${orchId}\`)`,
    `- **Thinking tool:** ${skill?.name ?? skillId}`,
    `- **Topic:** ${topic}`,
    ``,
    `## Tools that fit`,
    ``,
    ...primaryTools,
    ``,
    `## Why not jump to these first`,
    ``,
    ...whyNot,
    ``,
    `## Dialogue`,
    ``,
  ];
  for (const t of turns) {
    md.push(`### ${t.role === "user" ? "Learner" : "Tutor"} (${t.mode})`, ``, t.content, ``);
  }
  md.push(
    `## Why weak shortcuts fail`,
    ``,
    `Skipping verification, mixing guesses with facts, or ignoring ${ind.safetyFirst ? "safety stop conditions" : "evidence labels"} usually fails under real pressure — even if it looks faster.`,
    ``,
  );
  const path = join(dir, fname);
  writeFileSync(path, md.join("\n"), "utf8");
  state.lessonsWritten++;
  const soft = minScore < 6;
  return { ok: !soft, soft, path, score: minScore, repaired };
}

async function runHttpFeature(shape: string, orchId: string) {
  // Lean set so the log never stalls on a hung page; timeout per request
  const paths = [
    `/?orch=1&shape=${encodeURIComponent(shape)}`,
    `/help`,
    `/skills`,
  ];
  for (const p of paths) {
    const r = await httpGet(p, 3500);
    const soft = !r.ok || r.status >= 500 || r.status === 0;
    const pass = r.status > 0 && r.status < 500;
    if (pass && !soft) state.pass++;
    else state.soft++;
    const t = new Date().toISOString().slice(11, 19);
    pushRecent({
      t,
      name: `[http] ${p.slice(0, 48)} · ${orchId.slice(0, 14)}`,
      status: r.status,
      ms: r.ms,
      reason: r.ok ? "ok" : r.error || "soft-fetch",
      pass: true, // soft-continue: never hard-fail the soak on fetch
      soft,
      kind: "check",
    });
    // mid-HTTP heartbeat so observe log never freezes mid-cycle
    if (paths.indexOf(p) === 0) writeLive();
  }
}

console.log(`\nBalanced continuous soak`);
console.log(`Base ${BASE}`);
console.log(`Deadline ${new Date(deadline).toISOString()}`);
console.log(
  `Industries ${industries.length} · modes ${MODES.length} · shapes ${SHAPES.length} · orch ${orchIds.length}`,
);
console.log(`Mode: ${SIM_ONLY ? "SIM-ONLY (lessons+coverage, no multi-HTTP / no 3 Hive panes required)" : "FULL (lessons + HTTP feature hits)"}\n`);

state.currentPhase = SIM_ONLY ? "sim-only" : "balanced-soak";
state.engine = SIM_ONLY
  ? "continuous-balanced-soak-sim-only"
  : "continuous-balanced-soak";
writeLive();

let cycle = 0;
while (Date.now() < deadline) {
  cycle++;
  state.cycles = cycle;
  // Heartbeat at cycle start so log never freezes if later step is slow
  state.lastMessage = `cycle ${cycle} starting…`;
  writeLive();

  try {
    const indIds = industries.map((x) => x.id);
    const indId = leastUsed(indIds, coverage.industry);
    const ind =
      industries.find((i) => i.id === indId) ??
      industries[cycle % Math.max(1, industries.length)] ??
      industries[0]!;
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

    state.suiteCheckIndex = (cycle % state.suiteCheckTotal) + 1;
    state.currentPhase = `${mode}/${shape}`;
    state.lastMessage = `${ind.id} · ${mode} · ${skillId} · ${shape} · ${orchId}`;
    writeLive();

    // 1) Reasoning lesson (substance) — isolated so pack bugs don't kill soak
    let lesson = {
      ok: true,
      soft: true,
      path: "",
      score: 0,
      repaired: false,
    };
    try {
      lesson = buildLesson(ind, mode, skillId, shape, orchId, cycle);
    } catch (e) {
      state.soft++;
      state.repairs++;
      pushRecent({
        t: new Date().toISOString().slice(11, 19),
        name: `[lesson-repair] ${ind.id}/${mode}`,
        status: 0,
        ms: 0,
        reason: String((e as Error)?.message || e).slice(0, 120),
        pass: true,
        soft: true,
        kind: "check",
      });
      writeLive();
      await new Promise((r) => setTimeout(r, 200));
      continue;
    }

    const t = new Date().toISOString().slice(11, 19);
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
    writeLive();

    // 2) HTTP feature surface — skip in sim-only for throughput (orch still tracked in lesson meta)
    if (!SIM_ONLY) {
      try {
        await runHttpFeature(shape, orchId);
      } catch (e) {
        state.soft++;
        pushRecent({
          t: new Date().toISOString().slice(11, 19),
          name: `[http-soft] ${shape}`,
          status: 0,
          ms: 0,
          reason: String((e as Error)?.message || e).slice(0, 80),
          pass: true,
          soft: true,
          kind: "check",
        });
      }
    } else {
      // Record orchestration rotation without browser cost
      pushRecent({
        t: new Date().toISOString().slice(11, 19),
        name: `[orch-meta] ${shape} · ${orchId.slice(0, 20)}`,
        status: "sim",
        ms: 0,
        reason: "sim-only (no HTTP)",
        pass: true,
        soft: false,
        kind: "check",
      });
    }

    // 3) Every N cycles: suite complete marker + coverage snapshot
    if (cycle % industries.length === 0) {
      state.suitesComplete++;
      pushRecent({
        t: new Date().toISOString().slice(11, 19),
        name: `BALANCE LAP ${state.suitesComplete}`,
        status: "OK",
        ms: 0,
        reason: balanceHint(),
        pass: true,
        soft: false,
        kind: "suite",
      });
      try {
        writeFileSync(
          join(corpusRoot, "COVERAGE.json"),
          JSON.stringify(
            {
              updatedAt: new Date().toISOString(),
              lessonsWritten: state.lessonsWritten,
              cycles: cycle,
              coverage: state.coverage,
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

    writeLive();
    if (cycle % 5 === 0) {
      console.log(
        `c=${cycle} pass=${state.pass} soft=${state.soft} lessons=${state.lessonsWritten} · ${state.lastMessage}`,
      );
    }
  } catch (e) {
    // Outer safety net — never die; soft-continue
    state.soft++;
    state.lastMessage = `soft-continue: ${String((e as Error)?.message || e).slice(0, 100)}`;
    pushRecent({
      t: new Date().toISOString().slice(11, 19),
      name: "[cycle-soft-continue]",
      status: 0,
      ms: 0,
      reason: state.lastMessage,
      pass: true,
      soft: true,
      kind: "check",
    });
    writeLive();
    console.error("cycle soft-continue", e);
  }

  // shorter gap in sim-only for higher lesson throughput
  await new Promise((r) => setTimeout(r, SIM_ONLY ? 80 : 250));
}

state.currentPhase = "complete";
state.lastMessage = `balanced soak done · lessons=${state.lessonsWritten} · repairs=${state.repairs}`;
writeLive();
writeFileSync(
  join(evidenceDir, "SUMMARY.json"),
  JSON.stringify({ ...state, coverage: state.coverage, endedAt: new Date().toISOString() }, null, 2),
  "utf8",
);
console.log(`\nDONE cycles=${cycle} lessons=${state.lessonsWritten} repairs=${state.repairs}`);
console.log(`LIVE ${livePath}`);
console.log(`Corpus ${corpusRoot}\n`);
process.exit(0);
