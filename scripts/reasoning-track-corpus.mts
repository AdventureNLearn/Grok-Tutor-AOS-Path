/**
 * Reasoning-track corpus builder for Grok Tutor.
 *
 * Not a port-ping suite. Each track is a pedagogical journey:
 * multi-turn, multi-mode offline tutor replies that assemble into a
 * **usable sample lesson** for learners + training material for system growth.
 *
 *   npx tsx scripts/reasoning-track-corpus.mts
 *   npx tsx scripts/reasoning-track-corpus.mts --tracks civic,trades-safety
 *   npx tsx scripts/reasoning-track-corpus.mts --min-score 6
 *
 * Outputs:
 *   public/corpus/reasoning-tracks/<track-id>/lesson.md   — learner-facing sample
 *   public/corpus/reasoning-tracks/INDEX.json             — catalog
 *   scripts/sim-output/reasoning-tracks/<stamp>/…         — run evidence
 */
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { INDUSTRIES, type Industry } from "../src/lib/industries.ts";
import { getIndustryPack } from "../src/lib/demo/industry-packs.ts";
import {
  offlineTutorReply,
  type TutorChatRequest,
  type TutorMode,
  type TutorMessage,
} from "../src/lib/tutor-api.ts";
import { lessonsForIndustry } from "../src/lib/demo-lessons.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function arg(name: string, fallback = ""): string {
  const i = process.argv.indexOf(name);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1]!;
  return fallback;
}

const ONLY = new Set(
  (arg("--tracks", "") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);
const MIN_SCORE = Math.max(1, Math.min(10, Number(arg("--min-score", "6")) || 6));
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const evidenceDir = join(root, "scripts", "sim-output", "reasoning-tracks", stamp);
const corpusRoot = join(root, "public", "corpus", "reasoning-tracks");
mkdirSync(evidenceDir, { recursive: true });
mkdirSync(corpusRoot, { recursive: true });

type Mode = TutorMode;

type TurnPlan = {
  mode: Mode;
  level: "beginner" | "intermediate" | "advanced";
  /** Learner voice — what a real person would type */
  user: string;
  /** Why this turn exists in the reasoning track */
  intent: string;
};

type TrackDef = {
  id: string;
  title: string;
  purpose: string;
  /** Pedagogical story for operators / growth notes */
  growthNote: string;
  industryId: string;
  topic: string;
  skillIds: string[];
  hiveShape?: string;
  turns: TurnPlan[];
};

function ind(id: string): Industry {
  const found = INDUSTRIES.find((x) => x.id === id);
  if (!found) throw new Error(`Unknown industry ${id}`);
  if (!getIndustryPack(id)) throw new Error(`No demo pack for ${id}`);
  return found;
}

/** Comprehensive reasoning tracks — not random port hits */
const TRACKS: TrackDef[] = [
  {
    id: "civic-claim-hygiene",
    title: "Public information literacy — claim hygiene path",
    purpose:
      "Train learners to separate observation, inference, and assumption before acting on public-facing claims.",
    growthNote:
      "Corpus seed for integrity teaching; pairs with Hive integrity-triangle and evidence-gate habits.",
    industryId: "civic-intelligence",
    topic: "Reading claims carefully",
    skillIds: ["evidence-gate", "clear-lens"],
    hiveShape: "integrity-triangle",
    turns: [
      {
        mode: "explain",
        level: "beginner",
        intent: "Establish plain-language frame for claim hygiene",
        user: "I'm new to public records style work. What does it mean to treat a claim carefully without sounding like a lawyer?",
      },
      {
        mode: "socratic",
        level: "intermediate",
        intent: "Force judgment under incomplete information",
        user: "Someone posted a confident chart online. I want to challenge myself — what should I ask before I share it?",
      },
      {
        mode: "practice",
        level: "intermediate",
        intent: "Produce a reusable checklist learners can keep",
        user: "Help me draft a short checklist I can use before I put any claim in a brief or dashboard.",
      },
      {
        mode: "scenario",
        level: "advanced",
        intent: "On-the-job pressure without inventing authority",
        user: "Lead wants a one-pager tonight. Data is messy. Coach me through the first 10 minutes without overclaiming.",
      },
    ],
  },
  {
    id: "electrical-safety-ladder",
    title: "Electrical — safety-first learning ladder",
    purpose:
      "Full mode ladder for a high-stakes trade: explain → think → practice → quiz → scenario → career.",
    growthNote:
      "Baseline safety-first pack quality; if scores drop, offline tutor or pack content regressed.",
    industryId: "electrical",
    topic: "Electrical safety rules",
    skillIds: ["evidence-gate", "construction-oversight"],
    hiveShape: "spine",
    turns: [
      {
        mode: "explain",
        level: "beginner",
        intent: "Plain foundation",
        user: "Brand new helper. What do electrical safety rules mean on a real job — simple words.",
      },
      {
        mode: "socratic",
        level: "intermediate",
        intent: "Pressure thinking",
        user: "Boss is rushing me. How do I think about safety without freezing?",
      },
      {
        mode: "practice",
        level: "intermediate",
        intent: "Actionable drill",
        user: "Drill me: first checks, what I write down, who I tell if something looks wrong.",
      },
      {
        mode: "quiz",
        level: "beginner",
        intent: "Recall under fair pressure",
        user: "Quiz me on electrical safety basics like a lead might ask a helper.",
      },
      {
        mode: "scenario",
        level: "advanced",
        intent: "Realistic jam",
        user: "Something feels unsafe but nobody stopped. What do I do in the first 10 minutes?",
      },
      {
        mode: "career",
        level: "beginner",
        intent: "Sustainable growth path",
        user: "I have about 8 hours a week. First 90 days focusing on electrical safety — simple plan.",
      },
    ],
  },
  {
    id: "four-agent-field-ops",
    title: "Multi-role field thinking — four-agent style",
    purpose:
      "Practice multi-perspective coordination without claiming the app is a command system.",
    growthNote:
      "Supports Hive four-agent shape demos with real lesson substance, not empty chrome.",
    industryId: "construction",
    topic: "Jobsite coordination",
    skillIds: ["4-agent-orchestration", "evidence-gate"],
    hiveShape: "four-agent",
    turns: [
      {
        mode: "explain",
        level: "beginner",
        intent: "Define coordination in plain words",
        user: "Explain jobsite coordination like I'm new — who talks to who and why it matters.",
      },
      {
        mode: "socratic",
        level: "intermediate",
        intent: "Role conflict",
        user: "Field wants speed, office wants paper. Challenge my thinking on how to handle that.",
      },
      {
        mode: "practice",
        level: "intermediate",
        intent: "Write a clean handoff",
        user: "Help me practice a short handoff message when something changed mid-day.",
      },
      {
        mode: "scenario",
        level: "advanced",
        intent: "Multi-agent pressure",
        user: "GC is yelling, trade lead is offline, notes are incomplete. Coach the first 10 minutes.",
      },
    ],
  },
  {
    id: "plumbing-practice-depth",
    title: "Plumbing — practice and on-the-job depth",
    purpose: "Deeper practice/scenario path for a second trade pack (breadth of corpus).",
    growthNote: "Ensures multi-industry packs stay craft-specific under multi-turn use.",
    industryId: "plumbing",
    topic: "Finding leaks",
    skillIds: ["evidence-gate", "construction-oversight"],
    hiveShape: "sense-orbit",
    turns: [
      {
        mode: "explain",
        level: "beginner",
        intent: "Topic frame",
        user: "What does finding leaks actually mean day one — plain English.",
      },
      {
        mode: "practice",
        level: "intermediate",
        intent: "Field note practice",
        user: "I'm bad at field notes. Practice with me on a possible leak without guessing too hard.",
      },
      {
        mode: "scenario",
        level: "advanced",
        intent: "Customer pressure",
        user: "Customer is watching and wants it done now. Leak still open. Walk me through it.",
      },
      {
        mode: "quiz",
        level: "beginner",
        intent: "Check retention",
        user: "Three fair questions on finding leaks before I go back on site.",
      },
    ],
  },
  {
    id: "public-career-onboarding",
    title: "Public information literacy — first 90 days path",
    purpose: "Career-mode onboarding for civic-adjacent learners without jurisdiction name-dropping.",
    growthNote: "Corpus for path desk / career coaching quality.",
    industryId: "civic-intelligence",
    topic: "First 90 days on the job",
    skillIds: ["evidence-gate", "clear-lens"],
    hiveShape: "spine",
    turns: [
      {
        mode: "career",
        level: "beginner",
        intent: "Sustainable plan",
        user: "Career switcher into public information literacy work. Only evenings free. First 90 days plan?",
      },
      {
        mode: "explain",
        level: "beginner",
        intent: "Vocabulary without gatekeeping",
        user: "I don't know the words yet — start from zero on how careful reading of claims works.",
      },
      {
        mode: "practice",
        level: "intermediate",
        intent: "Professional voice",
        user: "Help me practice how to say I don't know yet without looking careless.",
      },
      {
        mode: "socratic",
        level: "intermediate",
        intent: "Self-check habits",
        user: "What should I ask myself before I publish anything that looks like a fact?",
      },
    ],
  },
  {
    id: "hvac-safety-scenario",
    title: "HVAC — safety and licensed-boundary awareness",
    purpose: "Safety-first industry with clear license boundaries in teaching.",
    growthNote: "Guards against overclaiming learner capability on regulated work.",
    industryId: "hvac",
    topic: "Refrigerant license basics",
    skillIds: ["evidence-gate", "construction-oversight"],
    hiveShape: "claim-diamond",
    turns: [
      {
        mode: "explain",
        level: "beginner",
        intent: "Boundaries first",
        user: "What should a beginner understand about refrigerant license basics without me doing illegal work?",
      },
      {
        mode: "socratic",
        level: "intermediate",
        intent: "Stop/go judgment",
        user: "Someone confident told me to just hook up gauges. Challenge me.",
      },
      {
        mode: "scenario",
        level: "advanced",
        intent: "Refuse safely",
        user: "Pressure to hurry past a step I think needs a licensed tech. Coach me.",
      },
      {
        mode: "practice",
        level: "intermediate",
        intent: "Message template",
        user: "Help me draft the text I'd send my lead if I need to stop and get licensed help.",
      },
    ],
  },
];

type Score = {
  craftSpecific: number;
  safety: number;
  actionable: number;
  antiFluff: number;
  learnerAgency: number;
  total: number;
  flags: string[];
};

function scoreReply(
  reply: string,
  industryName: string,
  pack: ReturnType<typeof getIndustryPack>,
  safetyFirst: boolean | undefined,
): Score {
  const flags: string[] = [];
  const r = reply.toLowerCase();
  const nameL = industryName.toLowerCase();

  let craftSpecific = 0;
  if (r.includes(nameL) || reply.includes(industryName)) craftSpecific += 1;
  if (pack) {
    if (
      pack.coreSteps.some((s) => reply.includes(s.slice(0, 18))) ||
      reply.includes(pack.mistakeTitle.slice(0, 16)) ||
      reply.includes(pack.what.slice(0, 24))
    )
      craftSpecific += 1;
    else flags.push("weak_pack_echo");
  } else flags.push("no_pack");

  let safety = 0;
  if (/safety|stop|hold|ppe|hurt|licensed|verify|risk|escalate|do not|don't/i.test(reply))
    safety += 1;
  if (safetyFirst) {
    if (/safety first|could get hurt|stop/i.test(reply)) safety += 1;
    else flags.push("safety_first_weak");
  } else safety += 1;

  let actionable = 0;
  if (/\d\.\s|step|check|verify|write|send|message|first 10/i.test(reply)) actionable += 1;
  if (/goal:|your job|your turn|question \d|reply with|checklist/i.test(reply)) actionable += 1;
  if (actionable === 0) flags.push("low_action");

  let antiFluff = 2;
  if (/believe in yourself|you got this!|synergy|just be confident/i.test(reply)) {
    antiFluff -= 1;
    flags.push("hype_language");
  }
  if (reply.length < 320) {
    antiFluff -= 1;
    flags.push("too_short");
  }
  antiFluff = Math.max(0, antiFluff);

  let learnerAgency = 0;
  if (/your job|your turn|reply|answer|write|in your own words|check your/i.test(reply))
    learnerAgency += 1;
  if (/question \d|quiz|draft|plan|10 minutes|checklist/i.test(reply)) learnerAgency += 1;

  // OPSEC / integrity red flags in generated content
  if (/C:\\\\Users|file:\/\/|municipality of |county of /i.test(reply)) {
    flags.push("opsec_leak_pattern");
  }

  const total = craftSpecific + safety + actionable + antiFluff + learnerAgency;
  if (total <= 4) flags.push("weak_overall");
  if (total >= 8) flags.push("strong");
  return { craftSpecific, safety, actionable, antiFluff, learnerAgency, total, flags };
}

type BuiltTurn = {
  intent: string;
  mode: Mode;
  level: string;
  user: string;
  assistant: string;
  score: Score;
};

function runTrack(track: TrackDef): {
  track: TrackDef;
  turns: BuiltTurn[];
  avgScore: number;
  minScore: number;
  ok: boolean;
  failReasons: string[];
  demoLessonId?: string;
} {
  const industry = ind(track.industryId);
  const pack = getIndustryPack(track.industryId);
  const history: TutorMessage[] = [];
  const turns: BuiltTurn[] = [];
  const failReasons: string[] = [];

  for (const plan of track.turns) {
    history.push({ role: "user", content: plan.user });
    const req: TutorChatRequest = {
      industryId: track.industryId,
      mode: plan.mode,
      level: plan.level,
      skillIds: track.skillIds,
      topic: track.topic,
      messages: [...history],
    };
    const assistant = offlineTutorReply(req);
    history.push({ role: "assistant", content: assistant });
    const score = scoreReply(assistant, industry.name, pack, industry.safetyFirst);
    if (score.flags.includes("opsec_leak_pattern")) {
      failReasons.push(`OPSEC pattern in ${plan.mode} turn`);
    }
    turns.push({
      intent: plan.intent,
      mode: plan.mode,
      level: plan.level,
      user: plan.user,
      assistant,
      score,
    });
  }

  const scores = turns.map((t) => t.score.total);
  const avgScore = scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length);
  const minScore = Math.min(...scores);
  if (avgScore < MIN_SCORE) failReasons.push(`avg score ${avgScore.toFixed(2)} < ${MIN_SCORE}`);
  if (minScore < MIN_SCORE - 1)
    failReasons.push(`weakest turn score ${minScore} too low`);
  if (turns.some((t) => t.assistant.length < 200))
    failReasons.push("a turn produced a thin reply");

  // Cross-link existing demo lesson catalog when available
  const catalog = lessonsForIndustry(track.industryId);
  const demoLessonId = catalog.find((l) => l.mode === "explain")?.id;

  return {
    track,
    turns,
    avgScore,
    minScore,
    ok: failReasons.length === 0,
    failReasons,
    demoLessonId,
  };
}

function lessonMarkdown(built: ReturnType<typeof runTrack>): string {
  const { track, turns, avgScore, demoLessonId } = built;
  const industry = ind(track.industryId);
  const lines: string[] = [
    `---`,
    `id: ${track.id}`,
    `title: ${JSON.stringify(track.title)}`,
    `industryId: ${track.industryId}`,
    `industryName: ${JSON.stringify(industry.name)}`,
    `topic: ${JSON.stringify(track.topic)}`,
    `skillIds: [${track.skillIds.map((s) => JSON.stringify(s)).join(", ")}]`,
    `hiveShape: ${JSON.stringify(track.hiveShape || "")}`,
    `generatedAt: ${new Date().toISOString()}`,
    `source: offlineTutorReply (same path as Learn without API key)`,
    `qualityAvg: ${avgScore.toFixed(2)}`,
    `educational: true`,
    `notACredential: true`,
    `---`,
    ``,
    `# ${track.title}`,
    ``,
    `> **Educational sample lesson** generated by the reasoning-track corpus builder.  `,
    `> Not a certificate, license, or official procedure. For licensed work, follow instructors and workplace rules.`,
    ``,
    `## Why this track exists`,
    ``,
    track.purpose,
    ``,
    `**System growth note:** ${track.growthNote}`,
    ``,
    `## Learner setup`,
    ``,
    `- **Industry:** ${industry.name}`,
    `- **Focus topic:** ${track.topic}`,
    `- **Thinking tools (ids):** ${track.skillIds.join(", ")}`,
    track.hiveShape ? `- **Hive shape to open:** \`${track.hiveShape}\` via \`/?orch=1&shape=${track.hiveShape}\`` : "",
    demoLessonId ? `- **Related catalog lesson id:** \`${demoLessonId}\`` : "",
    ``,
    `## Learning path (multi-turn)`,
    ``,
  ];

  turns.forEach((t, i) => {
    lines.push(`### Turn ${i + 1} — ${t.mode} (${t.level})`);
    lines.push(``);
    lines.push(`**Intent:** ${t.intent}`);
    lines.push(``);
    lines.push(`**Quality score:** ${t.score.total}/10 (${t.score.flags.join(", ") || "clean"})`);
    lines.push(``);
    lines.push(`**Learner**`);
    lines.push(``);
    lines.push(t.user);
    lines.push(``);
    lines.push(`**Tutor**`);
    lines.push(``);
    lines.push(t.assistant.trim());
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
  });

  lines.push(`## Reflection (for the learner)`);
  lines.push(``);
  lines.push(`1. What did you treat as **fact** vs **guess** in this path?`);
  lines.push(`2. Where would you **stop** and get a licensed or senior person?`);
  lines.push(`3. What is your **next small practice** in the next 48 hours?`);
  lines.push(``);
  lines.push(`## Integrity reminder`);
  lines.push(``);
  lines.push(
    `Keep Evidence, Inference, and Assumption separate. Human final call stays with you. Do not put real personal data or real place names into shared demos.`,
  );
  lines.push(``);

  return lines.filter((l) => l !== undefined).join("\n");
}

// ── Run ─────────────────────────────────────────────────
console.log(`\nGrok Tutor · Reasoning-track corpus`);
console.log(`Min score: ${MIN_SCORE}/10 · Evidence: ${evidenceDir}\n`);

const selected = ONLY.size
  ? TRACKS.filter((t) => ONLY.has(t.id))
  : TRACKS;

if (selected.length === 0) {
  console.error("No tracks selected.");
  process.exit(2);
}

const results = [];
let hardFail = 0;

for (const track of selected) {
  process.stdout.write(`→ ${track.id} … `);
  try {
    const built = runTrack(track);
    const md = lessonMarkdown(built);
    const trackDir = join(corpusRoot, track.id);
    mkdirSync(trackDir, { recursive: true });
    writeFileSync(join(trackDir, "lesson.md"), md, "utf8");
    writeFileSync(
      join(trackDir, "meta.json"),
      JSON.stringify(
        {
          id: track.id,
          title: track.title,
          purpose: track.purpose,
          growthNote: track.growthNote,
          industryId: track.industryId,
          topic: track.topic,
          skillIds: track.skillIds,
          hiveShape: track.hiveShape,
          avgScore: built.avgScore,
          minScore: built.minScore,
          ok: built.ok,
          failReasons: built.failReasons,
          turnScores: built.turns.map((t) => ({
            mode: t.mode,
            total: t.score.total,
            flags: t.score.flags,
          })),
          demoLessonId: built.demoLessonId,
          generatedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
      "utf8",
    );
    // evidence copy
    writeFileSync(join(evidenceDir, `${track.id}.lesson.md`), md, "utf8");
    writeFileSync(
      join(evidenceDir, `${track.id}.meta.json`),
      readFileSync(join(trackDir, "meta.json"), "utf8"),
      "utf8",
    );

    if (!built.ok) {
      hardFail++;
      console.log(`FAIL avg=${built.avgScore.toFixed(2)} — ${built.failReasons.join("; ")}`);
    } else {
      console.log(`OK avg=${built.avgScore.toFixed(2)} min=${built.minScore} turns=${built.turns.length}`);
    }
    results.push({
      id: track.id,
      title: track.title,
      ok: built.ok,
      avgScore: +built.avgScore.toFixed(2),
      minScore: built.minScore,
      turns: built.turns.length,
      failReasons: built.failReasons,
      hiveShape: track.hiveShape,
      industryId: track.industryId,
    });
  } catch (e) {
    hardFail++;
    console.log(`ERROR ${e instanceof Error ? e.message : e}`);
    results.push({
      id: track.id,
      title: track.title,
      ok: false,
      avgScore: 0,
      minScore: 0,
      turns: 0,
      failReasons: [String(e)],
    });
  }
}

// Catalog index for learners / product
const index = {
  generatedAt: new Date().toISOString(),
  description:
    "Reasoning-track sample lessons for Grok Tutor. Educational only — not credentials. Built from offline pack-aware tutor replies (same path as Learn without API key).",
  minScoreGate: MIN_SCORE,
  trackCount: results.length,
  passCount: results.filter((r) => r.ok).length,
  failCount: results.filter((r) => !r.ok).length,
  tracks: results.map((r) => ({
    id: r.id,
    title: r.title,
    path: `${r.id}/lesson.md`,
    ok: r.ok,
    avgScore: r.avgScore,
    industryId: r.industryId,
    hiveShape: r.hiveShape,
  })),
};
writeFileSync(join(corpusRoot, "INDEX.json"), JSON.stringify(index, null, 2), "utf8");
writeFileSync(
  join(corpusRoot, "README.md"),
  `# Reasoning-track sample lessons

Educational multi-turn lessons generated for **learner experience** and **system growth**.

- Each folder has \`lesson.md\` (usable sample) + \`meta.json\` (quality scores).
- Regenerated by: \`npx tsx scripts/reasoning-track-corpus.mts\`
- **Not** a certificate or license path. Keep OPSEC: no real PII or place names in remixes.

## Tracks

${results.map((r) => `- **${r.id}** — ${r.title} (${r.ok ? "quality gate pass" : "NEEDS WORK"}, avg ${r.avgScore})`).join("\n")}
`,
  "utf8",
);

const summary = {
  at: new Date().toISOString(),
  minScoreGate: MIN_SCORE,
  hardFail,
  results,
  corpusRoot: "public/corpus/reasoning-tracks",
  evidenceDir,
  ok: hardFail === 0,
  note: "Reasoning tracks produce real multi-turn sample lessons — not HTTP port pings.",
};
writeFileSync(join(evidenceDir, "SUMMARY.json"), JSON.stringify(summary, null, 2), "utf8");
writeFileSync(
  join(root, "scripts", "sim-output", "reasoning-tracks", "LATEST.json"),
  JSON.stringify(summary, null, 2),
  "utf8",
);

const reportMd = [
  `# Reasoning-track corpus run`,
  ``,
  `- At: ${summary.at}`,
  `- Gate min score: ${MIN_SCORE}/10`,
  `- Tracks: ${results.length} · Pass: ${results.filter((r) => r.ok).length} · Fail: ${hardFail}`,
  `- Corpus: \`public/corpus/reasoning-tracks/\``,
  ``,
  `| Track | Avg | Min | Turns | Status |`,
  `|---|---:|---:|---:|---|`,
  ...results.map(
    (r) =>
      `| ${r.id} | ${r.avgScore} | ${r.minScore} | ${r.turns} | ${r.ok ? "PASS" : "FAIL"} |`,
  ),
  ``,
  summary.note,
  ``,
];
writeFileSync(join(evidenceDir, "REPORT.md"), reportMd.join("\n"), "utf8");

console.log(`\n${hardFail === 0 ? "PASS" : "FAIL"} — ${results.filter((r) => r.ok).length}/${results.length} tracks`);
console.log(`Corpus: ${corpusRoot}`);
console.log(`Evidence: ${evidenceDir}\n`);
process.exit(hardFail === 0 ? 0 : 1);
