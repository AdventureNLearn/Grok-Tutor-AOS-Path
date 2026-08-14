/**
 * Full-spectrum internal reasoning pipeline for Grok Tutor.
 *
 * - Every industry with a demo pack (full craft coverage)
 * - Full mode ladder (explain → socratic → practice → quiz → scenario → career)
 * - Tools mapped from industry aosAffinity + why peers are weaker fits
 * - Multi-turn sample lessons written to public/corpus
 * - REPAIR weak turns (re-prompt / strengthen) — does NOT abort the suite
 * - Exit 0 even with repairs logged (operator inspects REPORT); use --strict to fail
 *
 *   npm.cmd exec -- tsx scripts/full-spectrum-reasoning-pipeline.mts
 *   npm.cmd exec -- tsx scripts/full-spectrum-reasoning-pipeline.mts --pass deepen
 *   npm.cmd exec -- tsx scripts/full-spectrum-reasoning-pipeline.mts --strict
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
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

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const STRICT = process.argv.includes("--strict");
const PASS = (() => {
  const i = process.argv.indexOf("--pass");
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1]! : "full";
})(); // full | deepen | repair-only

const MODES: TutorMode[] = [
  "explain",
  "socratic",
  "practice",
  "quiz",
  "scenario",
  "career",
];

const MODE_INTENT: Record<TutorMode, string> = {
  explain: "Build plain-language foundation and shared vocabulary",
  socratic: "Force judgment under incomplete information",
  practice: "Produce reusable actions, notes, or checklists",
  quiz: "Check retention with fair, craft-real questions",
  scenario: "On-the-job pressure without inventing false authority",
  career: "Sustainable growth plan without hype",
};

const STEMS: Record<TutorMode, string[]> = {
  explain: [
    "I'm brand new. What does {topic} actually mean on a real job in {name}?",
    "Explain {topic} like I never did {name} before — simple words.",
    "What is {topic} trying to accomplish, and what do careful people check first?",
  ],
  socratic: [
    "Boss is rushing me on {topic}. How do I think this through without freezing?",
    "Someone confident told me to skip a step on {topic}. Challenge me.",
    "When would I be wrong about {topic} and not know it yet?",
  ],
  practice: [
    "Drill me: first checks, what I write down, who I tell about {topic}.",
    "Help me practice a short professional message about {topic}.",
    "I need a checklist for {topic} I can keep on my phone.",
  ],
  quiz: [
    "Quiz me on {topic} for {name} — fair but real.",
    "Three questions a lead might ask a helper about {topic}.",
    "Test my basics on {topic} before I go on site.",
  ],
  scenario: [
    "Mid-shift mess about {topic}. Pressure to hurry. First 10 minutes — coach me.",
    "Notes say {topic} is done but it doesn't look right. Help.",
    "Something feels unsafe around {topic} but nobody stopped. What now?",
  ],
  career: [
    "First 90 days in {name} focusing on {topic} — I only have evenings free.",
    "How do I not look lost month one while learning {topic}?",
    "Simple plan so I don't overwhelm myself learning {topic} in {name}.",
  ],
};

type Score = {
  total: number;
  flags: string[];
  craftSpecific: number;
  safety: number;
  actionable: number;
  antiFluff: number;
  learnerAgency: number;
};

function scoreReply(
  reply: string,
  industry: Industry,
  pack: NonNullable<ReturnType<typeof getIndustryPack>>,
): Score {
  const flags: string[] = [];
  const r = reply.toLowerCase();
  const nameL = industry.name.toLowerCase();
  let craftSpecific = 0;
  if (r.includes(nameL) || reply.includes(industry.name)) craftSpecific += 1;
  if (
    pack.coreSteps.some((s) => reply.includes(s.slice(0, 16))) ||
    reply.includes(pack.mistakeTitle.slice(0, 14)) ||
    reply.includes(pack.what.slice(0, 20))
  )
    craftSpecific += 1;
  else flags.push("weak_pack_echo");

  let safety = 0;
  if (/safety|stop|hold|ppe|hurt|licensed|verify|risk|escalate|do not|don't/i.test(reply))
    safety += 1;
  if (industry.safetyFirst) {
    if (/safety first|could get hurt|stop/i.test(reply)) safety += 1;
    else flags.push("safety_first_weak");
  } else safety += 1;

  let actionable = 0;
  if (/\d\.\s|step|check|verify|write|send|message|first 10|checklist/i.test(reply))
    actionable += 1;
  if (/goal:|your job|your turn|question \d|reply with|plan/i.test(reply)) actionable += 1;
  if (actionable === 0) flags.push("low_action");

  let antiFluff = 2;
  if (/believe in yourself|you got this!|synergy|just be confident/i.test(reply)) {
    antiFluff -= 1;
    flags.push("hype");
  }
  if (reply.length < 300) {
    antiFluff -= 1;
    flags.push("too_short");
  }
  antiFluff = Math.max(0, antiFluff);

  let learnerAgency = 0;
  if (/your job|your turn|reply|answer|write|in your own words|check your/i.test(reply))
    learnerAgency += 1;
  if (/question \d|quiz|draft|plan|10 minutes|checklist/i.test(reply)) learnerAgency += 1;

  if (/C:\\\\Users|file:\/\/|\bCity of |\bCounty of /i.test(reply)) flags.push("opsec_leak");

  const total = craftSpecific + safety + actionable + antiFluff + learnerAgency;
  if (total >= 8) flags.push("strong");
  if (total <= 4) flags.push("weak_overall");
  return { total, flags, craftSpecific, safety, actionable, antiFluff, learnerAgency };
}

function toolMap(industry: Industry): {
  primary: { id: string; name: string; why: string }[];
  alternativesWeaker: { id: string; name: string; whyNot: string }[];
} {
  const primaryIds = industry.aosAffinity.slice(0, 4);
  const primary = primaryIds.map((id) => {
    const sk = getSkill(id);
    return {
      id,
      name: sk?.name ?? id,
      why:
        sk?.tutorRole ||
        sk?.purpose ||
        `Mapped affinity for ${industry.name} — use when the problem matches this habit.`,
    };
  });

  // Peers that are enabled but not primary — explain weaker fit
  const weaker = AOS_SKILLS.filter(
    (s) => s.tutorEnabled && !primaryIds.includes(s.id),
  )
    .slice(0, 6)
    .map((s) => ({
      id: s.id,
      name: s.name,
      whyNot: `Useful in other contexts (${s.tierLabel}: ${s.category}), but not the first lever for ${industry.name} / ${industry.topics[0] ?? "this craft"}. Reach for ${primary[0]?.name ?? "primary tools"} first when the job is craft-specific.`,
    }));

  return { primary, alternativesWeaker: weaker };
}

function topicFor(ind: Industry, mode: TutorMode, salt: number): string {
  const t = ind.topics;
  if (mode === "career") return "First 90 days on the job";
  return t[salt % Math.max(1, t.length)] ?? ind.name;
}

function userPrompt(ind: Industry, mode: TutorMode, topic: string, salt: number): string {
  const stems = STEMS[mode];
  const stem = stems[salt % stems.length]!;
  return stem.replaceAll("{name}", ind.name).replaceAll("{topic}", topic);
}

type TurnOut = {
  mode: TutorMode;
  intent: string;
  topic: string;
  user: string;
  assistant: string;
  score: Score;
  repaired: boolean;
  repairNote?: string;
};

function generateTurn(
  ind: Industry,
  pack: NonNullable<ReturnType<typeof getIndustryPack>>,
  mode: TutorMode,
  history: TutorMessage[],
  salt: number,
  minScore: number,
): TurnOut {
  const topic = topicFor(ind, mode, salt);
  let user = userPrompt(ind, mode, topic, salt);
  history.push({ role: "user", content: user });

  const req = (messages: TutorMessage[]): TutorChatRequest => ({
    industryId: ind.id,
    mode,
    level: mode === "scenario" ? "advanced" : mode === "explain" || mode === "career" ? "beginner" : "intermediate",
    skillIds: ind.aosAffinity.slice(0, 2),
    topic,
    messages,
  });

  let assistant = offlineTutorReply(req([...history]));
  let score = scoreReply(assistant, ind, pack);
  let repaired = false;
  let repairNote: string | undefined;

  // Repair loop — strengthen without failing the pipeline
  if (score.total < minScore || score.flags.includes("opsec_leak") || score.flags.includes("too_short")) {
    repaired = true;
    const boost = [
      user,
      "",
      "(Repair pass: be craft-specific to the pack, keep safety first if relevant,",
      "give numbered steps, end with a check-your-understanding prompt,",
      "no hype, no real place names, no host paths.)",
    ].join(" ");
    // replace last user message with boosted version for repair
    history[history.length - 1] = { role: "user", content: boost };
    assistant = offlineTutorReply(req([...history]));
    score = scoreReply(assistant, ind, pack);
    repairNote =
      score.total >= minScore
        ? `repaired to ${score.total}/10`
        : `still soft after repair (${score.total}/10) — kept for corpus review`;
    // keep the cleaner user line in the lesson (without repair meta)
    history[history.length - 1] = { role: "user", content: user };
  }

  history.push({ role: "assistant", content: assistant });
  return {
    mode,
    intent: MODE_INTENT[mode],
    topic,
    user,
    assistant,
    score,
    repaired,
    repairNote,
  };
}

function lessonMd(
  ind: Industry,
  tools: ReturnType<typeof toolMap>,
  turns: TurnOut[],
  avg: number,
  passLabel: string,
): string {
  const lines: string[] = [
    `---`,
    `id: spectrum-${ind.id}`,
    `title: ${JSON.stringify(`${ind.name} — full-spectrum reasoning path`)}`,
    `industryId: ${ind.id}`,
    `sector: ${ind.sector}`,
    `qualityAvg: ${avg.toFixed(2)}`,
    `pass: ${passLabel}`,
    `generatedAt: ${new Date().toISOString()}`,
    `source: full-spectrum-reasoning-pipeline (offlineTutorReply)`,
    `educational: true`,
    `notACredential: true`,
    `---`,
    ``,
    `# ${ind.name} — full-spectrum reasoning path`,
    ``,
    `> **Educational sample lesson** for learners. Not a certificate, license, or official procedure.`,
    ``,
    `## Craft frame`,
    ``,
    ind.blurb,
    ``,
    `**Sector:** ${ind.sector}  `,
    `**Safety-first craft:** ${ind.safetyFirst ? "yes" : "no"}`,
    ``,
    `## Tools that fit (and why others wait)`,
    ``,
    `### Reach for these first`,
    ``,
    ...tools.primary.flatMap((t) => [
      `- **${t.name}** (\`${t.id}\`) — ${t.why}`,
    ]),
    ``,
    `### Why not jump to these instead`,
    ``,
    ...tools.alternativesWeaker.slice(0, 5).flatMap((t) => [
      `- **${t.name}** (\`${t.id}\`) — ${t.whyNot}`,
    ]),
    ``,
    `## Multi-mode learning path`,
    ``,
  ];

  turns.forEach((t, i) => {
    lines.push(`### ${i + 1}. ${t.mode} — ${t.intent}`);
    lines.push(``);
    lines.push(`**Topic focus:** ${t.topic}  `);
    lines.push(
      `**Quality:** ${t.score.total}/10${t.repaired ? ` · ${t.repairNote}` : ""}`,
    );
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

  lines.push(`## Why some “easy answers” fail`);
  lines.push(``);
  lines.push(
    `In ${ind.name}, skipping verification, mixing guesses with facts, or rushing past safety/process usually fails even if it looks faster. The scenario and socratic turns above are designed to surface those failure modes without teaching you to overclaim.`,
  );
  lines.push(``);
  lines.push(`## Reflection`);
  lines.push(``);
  lines.push(`1. What was **evidence** vs **inference** in this path?`);
  lines.push(`2. Where would you stop and get a **licensed/senior** person?`);
  lines.push(`3. Which **tool habit** will you practice next (from the list above)?`);
  lines.push(``);
  return lines.join("\n");
}

// ── Pipeline ────────────────────────────────────────────
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const evidenceDir = join(root, "scripts", "sim-output", "full-spectrum", stamp);
const corpusRoot = join(root, "public", "corpus", "full-spectrum");
mkdirSync(evidenceDir, { recursive: true });
mkdirSync(corpusRoot, { recursive: true });

const industries = INDUSTRIES.filter((i) => getIndustryPack(i.id));
const MIN = 6;
const results: {
  id: string;
  name: string;
  sector: string;
  avg: number;
  min: number;
  repairs: number;
  soft: boolean;
  turns: number;
}[] = [];

console.log(`\nFull-spectrum reasoning pipeline`);
console.log(`Industries: ${industries.length} · pass=${PASS} · minScore=${MIN} · strict=${STRICT}\n`);

let index = 0;
for (const industry of industries) {
  index++;
  const pack = getIndustryPack(industry.id)!;
  const tools = toolMap(industry);
  const history: TutorMessage[] = [];
  const turns: TurnOut[] = [];
  let repairs = 0;

  const modeList =
    PASS === "deepen"
      ? ([...MODES, ...MODES] as TutorMode[]) // second pass variation
      : MODES;

  for (let m = 0; m < modeList.length; m++) {
    const mode = modeList[m]!;
    const salt = PASS === "deepen" ? m + 3 : m + index;
    const turn = generateTurn(industry, pack, mode, history, salt, MIN);
    if (turn.repaired) repairs++;
    turns.push(turn);
  }

  const scores = turns.map((t) => t.score.total);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const minS = Math.min(...scores);
  const soft = avg < MIN || minS < MIN - 1 || turns.some((t) => t.score.flags.includes("opsec_leak"));
  const passLabel = soft ? "soft-review" : "pass";

  const dir = join(corpusRoot, industry.id);
  mkdirSync(dir, { recursive: true });
  const md = lessonMd(industry, tools, turns, avg, passLabel);
  writeFileSync(join(dir, "lesson.md"), md, "utf8");
  writeFileSync(
    join(dir, "meta.json"),
    JSON.stringify(
      {
        industryId: industry.id,
        name: industry.name,
        sector: industry.sector,
        avg,
        min: minS,
        repairs,
        soft,
        tools,
        turnScores: turns.map((t) => ({
          mode: t.mode,
          total: t.score.total,
          repaired: t.repaired,
          flags: t.score.flags,
        })),
        generatedAt: new Date().toISOString(),
        pass: PASS,
      },
      null,
      2,
    ),
    "utf8",
  );
  writeFileSync(join(evidenceDir, `${industry.id}.lesson.md`), md, "utf8");

  results.push({
    id: industry.id,
    name: industry.name,
    sector: industry.sector,
    avg: +avg.toFixed(2),
    min: minS,
    repairs,
    soft,
    turns: turns.length,
  });

  const mark = soft ? "SOFT" : "OK";
  console.log(
    `[${String(index).padStart(2, "0")}/${industries.length}] ${mark} ${industry.id} avg=${avg.toFixed(2)} repairs=${repairs}`,
  );
}

const softCount = results.filter((r) => r.soft).length;
const repairTotal = results.reduce((s, r) => s + r.repairs, 0);
const avgAll =
  results.reduce((s, r) => s + r.avg, 0) / Math.max(1, results.length);

const indexDoc = {
  generatedAt: new Date().toISOString(),
  description:
    "Full-spectrum reasoning corpus: every craft/industry with multi-mode sample lessons, tool maps, and repair notes. Educational only.",
  pass: PASS,
  industryCount: results.length,
  softReviewCount: softCount,
  repairTotal,
  averageScore: +avgAll.toFixed(2),
  minScoreGate: MIN,
  tracks: results.map((r) => ({
    id: r.id,
    name: r.name,
    sector: r.sector,
    path: `${r.id}/lesson.md`,
    avg: r.avg,
    soft: r.soft,
    repairs: r.repairs,
  })),
};

writeFileSync(join(corpusRoot, "INDEX.json"), JSON.stringify(indexDoc, null, 2), "utf8");
writeFileSync(
  join(corpusRoot, "README.md"),
  `# Full-spectrum reasoning corpus

Every industry pack generates a **multi-mode sample lesson** (explain → career) with:

- Mapped thinking tools (why these fit)
- Why alternate tools wait
- Multi-turn learner/tutor dialogue from offline pack-aware tutor
- Repair notes when a turn was weak (pipeline keeps going)

Regenerate: \`npm run corpus:spectrum\`

**Not credentials.** Educational development material for learners and system growth.
`,
  "utf8",
);

const summary = {
  at: new Date().toISOString(),
  pass: PASS,
  ok: !STRICT || softCount === 0,
  softCount,
  repairTotal,
  averageScore: +avgAll.toFixed(2),
  industryCount: results.length,
  results,
  corpusRoot: "public/corpus/full-spectrum",
  evidenceDir,
  policy: "Repair weak turns; do not abort suite. Soft items logged for human review.",
};

writeFileSync(join(evidenceDir, "SUMMARY.json"), JSON.stringify(summary, null, 2), "utf8");
writeFileSync(
  join(root, "scripts", "sim-output", "full-spectrum", "LATEST.json"),
  JSON.stringify(summary, null, 2),
  "utf8",
);
writeFileSync(
  join(evidenceDir, "REPORT.md"),
  [
    `# Full-spectrum pipeline`,
    ``,
    `- At: ${summary.at}`,
    `- Industries: ${results.length}`,
    `- Avg score: ${summary.averageScore}`,
    `- Repairs: ${repairTotal}`,
    `- Soft review: ${softCount}`,
    `- Policy: ${summary.policy}`,
    ``,
    `| Industry | Avg | Min | Repairs | Soft |`,
    `|---|---:|---:|---:|:---:|`,
    ...results.map(
      (r) =>
        `| ${r.id} | ${r.avg} | ${r.min} | ${r.repairs} | ${r.soft ? "yes" : ""} |`,
    ),
    ``,
  ].join("\n"),
  "utf8",
);

console.log(
  `\nDONE industries=${results.length} avg=${summary.averageScore} repairs=${repairTotal} soft=${softCount}`,
);
console.log(`Corpus: ${corpusRoot}`);
console.log(`Evidence: ${evidenceDir}\n`);

// Non-strict: always 0 so overnight loop continues
process.exit(STRICT && softCount > 0 ? 1 : 0);
