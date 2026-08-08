/**
 * Batch learner simulations against offline (pack-aware) tutor replies.
 * Uses real-world phrasing normal people would type — not academic prompts.
 *
 * Usage: npx tsx scripts/simulate-learner-batch.mts [count=500]
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { INDUSTRIES } from "../src/lib/industries.ts";
import { getIndustryPack } from "../src/lib/demo/industry-packs.ts";
import {
  offlineTutorReply,
  type TutorChatRequest,
  type TutorMode,
} from "../src/lib/tutor-api.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COUNT = Math.max(1, Math.min(2000, Number(process.argv[2] || 500)));
const MODES: TutorMode[] = [
  "explain",
  "socratic",
  "practice",
  "quiz",
  "scenario",
  "career",
];

/** Real-world question stems — filled with industry name / topic */
const STEMS: { mode: TutorMode; templates: string[] }[] = [
  {
    mode: "explain",
    templates: [
      "I'm brand new. What does {topic} actually mean on a real job in {name}?",
      "Can you explain {topic} like I'm 16 and never did {name} before?",
      "My buddy keeps saying {topic} — what is that in plain English?",
      "What's the difference between doing {topic} right vs winging it?",
      "Why do people care so much about {topic} in {name}?",
      "I failed something related to {topic} once — what should I have known first?",
      "What tools or checks come up first when you're learning {topic}?",
      "Is {topic} something helpers do or only licensed people?",
    ],
  },
  {
    mode: "socratic",
    templates: [
      "Boss is rushing me on {topic}. How do I think this through without freezing?",
      "I think I get {topic} but test me — ask hard questions.",
      "When would I be wrong about {topic} and not know it yet?",
      "Someone confident told me to skip a step on {topic}. Challenge me.",
      "What should I ask myself before I touch anything related to {topic}?",
      "I always panic under schedule pressure. Walk me through thinking about {topic}.",
    ],
  },
  {
    mode: "practice",
    templates: [
      "Give me a practice like what I'd face first week on a {name} crew about {topic}.",
      "Help me write the text I'd send my lead if {topic} looks wrong.",
      "Drill me: what do I check first, what do I write down, who do I tell?",
      "I need practice saying no when someone wants me to hurry past {topic}.",
      "Make a realistic scenario for {topic} and make me draft a short update.",
      "I'm bad at writing field notes — practice with me on {topic}.",
    ],
  },
  {
    mode: "quiz",
    templates: [
      "Quiz me on {topic} for {name} — keep it fair but real.",
      "Three questions about {topic} like a lead might ask a helper.",
      "Test if I know the basics of {topic} before I go on site.",
      "Pop quiz: safety and common mistakes on {topic}.",
      "I think I studied enough on {topic} — prove me wrong if I'm wrong.",
    ],
  },
  {
    mode: "scenario",
    templates: [
      "Mid-shift mess about {topic}, GC is yelling. What do I do in the first 10 minutes?",
      "Night notes say {topic} is done but it doesn't look right. Help.",
      "Customer is watching and wants it done now — {topic} still open. Walk me through it.",
      "I walked into a bad handoff on {topic}. Pressure to hurry. Coach me.",
      "Put me in a realistic {name} jam involving {topic}.",
      "Something feels unsafe around {topic} but nobody else stopped. What now?",
    ],
  },
  {
    mode: "career",
    templates: [
      "I want into {name}. Only ~8 hours a week. First 90 days focusing on {topic}?",
      "How do I not look lost my first month learning {topic}?",
      "What should week one look like if I'm serious about {name}?",
      "Career switcher into {name} — where do I start with {topic}?",
      "Build me a simple plan so I don't overwhelm myself in {name}.",
    ],
  },
];

/** Extra universal “normal person” openers mixed across modes */
const UNIVERSAL = [
  "I don't know the words yet — start from zero.",
  "What would get me fired or hurt if I mess this up?",
  "How do I sound professional without faking it?",
  "What do I say when I don't know?",
  "Is this something I should refuse until someone licensed looks?",
  "Can you keep answers short? I'm on my phone in the truck.",
  "My English isn't perfect — simple words please.",
  "I watched a YouTube video and now I'm more confused.",
];

type Score = {
  craftSpecific: number; // 0-2
  safety: number; // 0-2
  actionable: number; // 0-2
  antiFluff: number; // 0-2
  learnerAgency: number; // 0-2
  total: number; // 0-10
  flags: string[];
};

function scoreReply(
  reply: string,
  industryName: string,
  pack: ReturnType<typeof getIndustryPack>,
  safetyFirst: boolean | undefined,
  userQ: string,
): Score {
  const flags: string[] = [];
  const r = reply.toLowerCase();
  const nameL = industryName.toLowerCase();

  // Craft-specific: names industry, pack phrases, not pure generic
  let craftSpecific = 0;
  if (r.includes(nameL) || reply.includes(industryName)) craftSpecific += 1;
  if (pack) {
    const hits = [
      pack.mistakeTitle,
      pack.what.slice(0, 40),
      pack.exampleGood.slice(0, 30),
    ].filter((s) => s && reply.includes(s.slice(0, 24)));
    if (hits.length >= 1) craftSpecific += 1;
    else if (pack.coreSteps.some((s) => reply.includes(s.slice(0, 20))))
      craftSpecific += 1;
  } else {
    flags.push("no_pack");
  }
  if (craftSpecific === 0) flags.push("generic_risk");

  // Safety
  let safety = 0;
  const safetyWords =
    /safety|stop|hold|ppe|hurt|licensed|lockout|verify|don't|do not|risk|escalate/i;
  if (safetyWords.test(reply)) safety += 1;
  if (safetyFirst) {
    if (/safety first|could get hurt|stop/i.test(reply)) safety += 1;
    else flags.push("safety_first_weak");
  } else {
    safety += 1; // non-safety fields: full credit if any care language or N/A
  }

  // Actionable: steps, checks, message templates, questions
  let actionable = 0;
  if (
    /\d\.\s|step|check|verify|write|send|message|your job|first 10/i.test(reply)
  )
    actionable += 1;
  if (
    /goal:|what i found|where:|your turn|question \d|reply with/i.test(reply)
  )
    actionable += 1;
  if (actionable === 0) flags.push("low_action");

  // Anti-fluff: penalize empty hype / missing substance
  let antiFluff = 2;
  const fluff =
    /believe in yourself|you got this!|synergy|leverage your potential|just be confident/i;
  if (fluff.test(reply)) {
    antiFluff -= 1;
    flags.push("hype_language");
  }
  if (reply.length < 280) {
    antiFluff -= 1;
    flags.push("too_short");
  }
  if (pack && !reply.includes(pack.mistakeTitle) && !/mistake|avoid|wrong/i.test(reply)) {
    // mild — not always required for quiz mode
  }
  antiFluff = Math.max(0, antiFluff);

  // Learner agency: asks them to do something
  let learnerAgency = 0;
  if (
    /your job|your turn|reply|answer|write|paste|in your own words|check your/i.test(
      reply,
    )
  )
    learnerAgency += 1;
  if (/question \d|quiz|draft|plan|10 minutes/i.test(reply)) learnerAgency += 1;

  // Echo user question somewhere (engagement)
  if (userQ.length > 20 && reply.includes(userQ.slice(0, 40))) {
    // good
  } else if (!/you asked about/i.test(reply) && !/starting from/i.test(reply)) {
    flags.push("weak_question_echo");
  }

  const total =
    craftSpecific + safety + actionable + antiFluff + learnerAgency;

  if (total <= 4) flags.push("weak_overall");
  if (total >= 8) flags.push("strong");

  return {
    craftSpecific,
    safety,
    actionable,
    antiFluff,
    learnerAgency,
    total,
    flags,
  };
}

function label(total: number): "strong" | "ok" | "weak" | "bullshit_risk" {
  if (total >= 8) return "strong";
  if (total >= 6) return "ok";
  if (total >= 4) return "weak";
  return "bullshit_risk";
}

type SimRow = {
  i: number;
  industryId: string;
  industryName: string;
  mode: TutorMode;
  topic: string;
  question: string;
  replyChars: number;
  score: Score;
  verdict: string;
  replyHead: string;
};

function buildQuestion(
  name: string,
  topic: string,
  mode: TutorMode,
  i: number,
): string {
  const bucket = STEMS.find((s) => s.mode === mode)!;
  const t = bucket.templates[i % bucket.templates.length]!;
  let q = t.replaceAll("{name}", name).replaceAll("{topic}", topic);
  if (i % 5 === 0) {
    const u = UNIVERSAL[i % UNIVERSAL.length]!;
    q = `${q} ${u}`;
  }
  return q;
}

const industries = INDUSTRIES.filter((ind) => getIndustryPack(ind.id));
const rows: SimRow[] = [];
const byIndustry: Record<string, { n: number; sum: number; weak: number }> = {};
const byMode: Record<string, { n: number; sum: number; weak: number }> = {};
const flagCounts: Record<string, number> = {};

for (let i = 0; i < COUNT; i++) {
  const ind = industries[i % industries.length]!;
  const mode = MODES[i % MODES.length]!;
  const topic =
    ind.topics[i % Math.max(1, ind.topics.length)] ?? ind.name;
  const question = buildQuestion(ind.name, topic, mode, i);
  const pack = getIndustryPack(ind.id);

  const req: TutorChatRequest = {
    industryId: ind.id,
    mode,
    level: i % 3 === 0 ? "beginner" : i % 3 === 1 ? "intermediate" : "advanced",
    skillIds: ind.aosAffinity.slice(0, 2),
    topic,
    messages: [{ role: "user", content: question }],
  };

  const reply = offlineTutorReply(req);
  const score = scoreReply(
    reply,
    ind.name,
    pack,
    ind.safetyFirst,
    question,
  );
  const verdict = label(score.total);

  for (const f of score.flags) {
    flagCounts[f] = (flagCounts[f] || 0) + 1;
  }

  if (!byIndustry[ind.id]) byIndustry[ind.id] = { n: 0, sum: 0, weak: 0 };
  byIndustry[ind.id]!.n++;
  byIndustry[ind.id]!.sum += score.total;
  if (score.total < 6) byIndustry[ind.id]!.weak++;

  if (!byMode[mode]) byMode[mode] = { n: 0, sum: 0, weak: 0 };
  byMode[mode]!.n++;
  byMode[mode]!.sum += score.total;
  if (score.total < 6) byMode[mode]!.weak++;

  rows.push({
    i,
    industryId: ind.id,
    industryName: ind.name,
    mode,
    topic,
    question,
    replyChars: reply.length,
    score,
    verdict,
    replyHead: reply.slice(0, 220).replace(/\n/g, " | "),
  });
}

const avg =
  rows.reduce((s, r) => s + r.score.total, 0) / Math.max(1, rows.length);
const dist = {
  strong: rows.filter((r) => r.verdict === "strong").length,
  ok: rows.filter((r) => r.verdict === "ok").length,
  weak: rows.filter((r) => r.verdict === "weak").length,
  bullshit_risk: rows.filter((r) => r.verdict === "bullshit_risk").length,
};

const worst = [...rows].sort((a, b) => a.score.total - b.score.total).slice(0, 12);
const best = [...rows].sort((a, b) => b.score.total - a.score.total).slice(0, 8);

const industryRank = Object.entries(byIndustry)
  .map(([id, v]) => ({
    id,
    avg: v.sum / v.n,
    weakPct: Math.round((100 * v.weak) / v.n),
    n: v.n,
  }))
  .sort((a, b) => a.avg - b.avg);

const modeRank = Object.entries(byMode)
  .map(([id, v]) => ({
    id,
    avg: +(v.sum / v.n).toFixed(2),
    weakPct: Math.round((100 * v.weak) / v.n),
    n: v.n,
  }))
  .sort((a, b) => a.avg - b.avg);

const report = {
  generatedAt: new Date().toISOString(),
  path: "offline pack-aware tutor (same path as no-API-key Learn)",
  count: COUNT,
  industriesCovered: industries.length,
  averageScore: +avg.toFixed(2),
  scoreMax: 10,
  distribution: dist,
  distributionPct: {
    strong: Math.round((100 * dist.strong) / COUNT),
    ok: Math.round((100 * dist.ok) / COUNT),
    weak: Math.round((100 * dist.weak) / COUNT),
    bullshit_risk: Math.round((100 * dist.bullshit_risk) / COUNT),
  },
  flagCounts,
  modeRank,
  industryWeakest: industryRank.slice(0, 8),
  industryStrongest: [...industryRank].reverse().slice(0, 8),
  sampleQuestions: rows.filter((_, i) => i % Math.floor(COUNT / 15) === 0).slice(0, 15).map((r) => ({
    industry: r.industryName,
    mode: r.mode,
    q: r.question,
    score: r.score.total,
    verdict: r.verdict,
  })),
  worst12: worst.map((r) => ({
    industry: r.industryName,
    mode: r.mode,
    score: r.score.total,
    flags: r.score.flags,
    q: r.question,
    head: r.replyHead,
  })),
  best8: best.map((r) => ({
    industry: r.industryName,
    mode: r.mode,
    score: r.score.total,
    q: r.question,
  })),
  interpretation: {
    insight_vs_bullshit:
      avg >= 7
        ? "Mostly useful structured craft coaching — not empty hype."
        : avg >= 5.5
          ? "Useful spine with thin spots; offline is template-rich not freeform genius."
          : "Too many weak replies — packs or modes need work.",
    caveat:
      "These sims use OFFLINE pack-aware replies (no live Grok). Live SuperGrok with XAI_API_KEY will be more adaptive; offline proves corpus quality under real-world questions.",
    normal_people_fit:
      "Questions use plain language: new-to-trade, rushed by boss, bad handoff, phone-in-truck, career switcher.",
  },
};

const outDir = join(__dirname, "../scripts/sim-output");
mkdirSync(outDir, { recursive: true });
const jsonPath = join(outDir, `learner-sim-${COUNT}.json`);
const mdPath = join(outDir, `learner-sim-${COUNT}.md`);
writeFileSync(jsonPath, JSON.stringify(report, null, 2));

const md = `# Learner simulation report — ${COUNT} runs

**When:** ${report.generatedAt}  
**Engine:** Offline pack-aware tutor (same as Learn without API key)  
**Average score:** **${report.averageScore} / 10**

## Verdict distribution

| Verdict | Count | % |
|---------|------:|--:|
| Strong (8–10) | ${dist.strong} | ${report.distributionPct.strong}% |
| OK (6–7) | ${dist.ok} | ${report.distributionPct.ok}% |
| Weak (4–5) | ${dist.weak} | ${report.distributionPct.weak}% |
| Bullshit risk (0–3) | ${dist.bullshit_risk} | ${report.distributionPct.bullshit_risk}% |

## Interpretation

- ${report.interpretation.insight_vs_bullshit}
- ${report.interpretation.caveat}
- ${report.interpretation.normal_people_fit}

## By mode (avg score)

${modeRank.map((m) => `- **${m.id}**: ${m.avg}/10 · weak ${m.weakPct}% (n=${m.n})`).join("\n")}

## Weakest industries (avg)

${industryRank
  .slice(0, 8)
  .map((m) => `- **${m.id}**: ${m.avg.toFixed(2)}/10 · weak ${m.weakPct}%`)
  .join("\n")}

## Strongest industries (avg)

${[...industryRank]
  .reverse()
  .slice(0, 8)
  .map((m) => `- **${m.id}**: ${m.avg.toFixed(2)}/10 · weak ${m.weakPct}%`)
  .join("\n")}

## Sample real-world questions & scores

${report.sampleQuestions
  .map(
    (s, i) =>
      `${i + 1}. **[${s.score}/10 ${s.verdict}]** (${s.industry} · ${s.mode})  
   Q: ${s.q}`,
  )
  .join("\n\n")}

## Worst replies (investigate packs)

${worst
  .map(
    (r) =>
      `- **${r.score.total}/10** ${r.industryName} / ${r.mode} — flags: ${r.score.flags.join(", ") || "—"}  
  Q: ${r.question}`,
  )
  .join("\n")}

## Scoring rubric (0–2 each → /10)

- Craft-specific · Safety · Actionable · Anti-fluff · Learner agency
`;

writeFileSync(mdPath, md);
console.log(JSON.stringify({ jsonPath, mdPath, ...report, rows: undefined }, null, 2));
console.log("\n--- markdown preview ---\n");
console.log(md.slice(0, 3500));
