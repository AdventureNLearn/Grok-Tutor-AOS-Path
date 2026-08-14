/**
 * Sample lesson catalog — multi-turn, craft-specific dialogues.
 * Every answer is built from industry packs (real content), not shared copy-paste.
 */

import { getSkill, type TutorMode } from "./aos-skills";
import { getIndustryPack, type IndustryDemoPack } from "./demo/industry-packs";
import { INDUSTRIES, type Industry } from "./industries";

export type DemoTurn = {
  role: "user" | "assistant";
  content: string;
};

export type DemoLesson = {
  id: string;
  industryId: string;
  industryName: string;
  mode: TutorMode;
  modeLabel: string;
  level: "beginner" | "intermediate" | "advanced";
  topic: string;
  skillIds: string[];
  skillNames: string[];
  title: string;
  summary: string;
  turns: DemoTurn[];
};

export const MODE_META: {
  id: TutorMode;
  label: string;
  level: DemoLesson["level"];
}[] = [
  { id: "explain", label: "Explain", level: "beginner" },
  { id: "socratic", label: "Socratic", level: "intermediate" },
  { id: "practice", label: "Practice", level: "intermediate" },
  { id: "quiz", label: "Quiz", level: "beginner" },
  { id: "scenario", label: "On-the-job", level: "advanced" },
  { id: "career", label: "Career path", level: "beginner" },
];

function isFieldTrade(ind: Industry): boolean {
  return (
    ind.sector === "trades" ||
    ind.sector === "logistics" ||
    ind.id === "energy" ||
    ind.id === "civic-intelligence"
  );
}

function topicFor(ind: Industry, mode: TutorMode): string {
  const t = ind.topics;
  switch (mode) {
    case "explain":
      return t[0] ?? ind.name;
    case "socratic":
      return t[1] ?? t[0] ?? ind.name;
    case "practice":
      return t[2] ?? t[0] ?? ind.name;
    case "quiz":
      return t[0] ?? ind.name;
    case "scenario":
      return t[3] ?? t[1] ?? ind.name;
    case "career":
      return "First 90 days on the job";
  }
}

function requirePack(ind: Industry): IndustryDemoPack {
  const pack = getIndustryPack(ind.id);
  if (!pack) {
    throw new Error(`Missing industry demo pack for ${ind.id}`);
  }
  return pack;
}

function safetyBlock(ind: Industry): string {
  if (!ind.safetyFirst) return "";
  return "\n\n**Safety first:** If a person could get hurt, stop and fix that before speed or schedule talk.\n";
}

function remember(): string {
  return [
    "",
    "**Remember:** Say what you saw, what you think, and what you are still guessing. Do not mix them up.",
  ].join("\n");
}

/* -------------------- EXPLAIN -------------------- */

function explainTurns(ind: Industry, topic: string, pack: IndustryDemoPack): DemoTurn[] {
  const field = isFieldTrade(ind);
  const steps = pack.coreSteps.map((s, i) => `${i + 1}. ${s}`).join("\n");

  const u1 = `I'm brand new to ${ind.name}. Please explain ${topic} in simple words — what it is, why it matters, and what good work looks like.`;
  const a1 = [
    `**${topic} — explained for a beginner**`,
    "",
    `**Goal of this lesson:** Leave knowing what *${topic}* means in ${ind.name}, the main steps, and one mistake to avoid.`,
    "",
    `**What ${ind.name} is**`,
    pack.what,
    "",
    `**What “${topic}” means here**`,
    pack.explainDetail,
    safetyBlock(ind),
    "**Steps good people follow**",
    steps,
    "",
    field
      ? [
          "**Who you talk to on a real job**",
          "| Person | Everyday meaning |",
          "| --- | --- |",
          "| **Site boss** | Runs the site; can stop work |",
          "| **Crew lead** | Your day-to-day lead |",
          "| **Crew** | Hands-on workers (including you) |",
          "| **Inspector** | Checks work against the rules |",
          "",
        ].join("\n")
      : "",
    "**Example of a clear message**",
    "",
    pack.exampleGood,
    "",
    "**Example of a weak message (avoid)**",
    "",
    pack.exampleBad,
    "",
    "**Check your understanding**",
    `In your own words: what is *${topic}* trying to accomplish, and what is the first thing you verify before you act?`,
    remember(),
  ]
    .filter(Boolean)
    .join("\n");

  const u2 = `Thanks. What mistake do new people make most often with ${topic}?`;
  const better = pack.mistakeBetter.map((b) => `- ${b}`).join("\n");
  const a2 = [
    `**Most common beginner mistake: ${pack.mistakeTitle}**`,
    "",
    `**Goal of this follow-up:** Name the real failure pattern for *${topic}* in ${ind.name} — not a generic pep talk — and practice the better habit.`,
    "",
    pack.mistakeBody,
    "",
    "**What careful people do instead**",
    better,
    "",
    "**How that sounds in real life**",
    "",
    pack.exampleGood,
    "",
    "Compare to the weak version:",
    "",
    pack.exampleBad,
    safetyBlock(ind),
    "**Your turn**",
    `Write 2–3 lines as if you caught this mistake on a ${ind.name} job involving *${topic}*. Include: where you are, what you noticed, and whether you stopped.`,
    remember(),
  ].join("\n");

  return [
    { role: "user", content: u1 },
    { role: "assistant", content: a1 },
    { role: "user", content: u2 },
    { role: "assistant", content: a2 },
  ];
}

/* -------------------- SOCRATIC -------------------- */

function socraticTurns(ind: Industry, topic: string, pack: IndustryDemoPack): DemoTurn[] {
  const u1 = `Ask me hard questions about ${topic} in ${ind.name}. Don't lecture first — test whether I really get it.`;
  const a1 = [
    `**Questions about ${topic}**`,
    "",
    `**Goal:** Push your judgment on *${topic}* with real ${ind.name} situations. Answer in plain words.`,
    safetyBlock(ind),
    "**Question 1**",
    pack.socraticQ1,
    "",
    "_Reply with your answer. I will push back, then ask more._",
    remember(),
  ].join("\n");

  const u2 = `Honest answer: when someone is loud about the schedule, I skip the slow check on ${topic}. Challenge that.`;
  const a2 = [
    "**Pushback on skipping the check**",
    "",
    `**Goal:** Separate schedule pressure from the right first move for *${topic}*.`,
    "",
    pack.socraticPush,
    "",
    `In ${ind.name}, skipping the check on *${topic}* is exactly how this happens:`,
    "",
    `> **${pack.mistakeTitle}**`,
    ">",
    `> ${pack.mistakeBody}`,
    "",
    "**Question 2**",
    pack.socraticQ2,
    "",
    "**Question 3** (after you answer question 2)",
    pack.socraticQ3,
    "",
    "Answer Question 2 next — one or two sentences is enough if they are specific.",
    remember(),
  ].join("\n");

  return [
    { role: "user", content: u1 },
    { role: "assistant", content: a1 },
    { role: "user", content: u2 },
    { role: "assistant", content: a2 },
  ];
}

/* -------------------- PRACTICE -------------------- */

function practiceTurns(ind: Industry, topic: string, pack: IndustryDemoPack): DemoTurn[] {
  const u1 = `Give me a practice drill on ${topic} for ${ind.name}. I want something I would actually face, not a school worksheet.`;
  const a1 = [
    `**Practice drill — ${topic}**`,
    "",
    `**Goal:** Produce a clear response to a real ${ind.name} problem about *${topic}*.`,
    safetyBlock(ind),
    "**The situation**",
    pack.practiceSetup,
    "",
    "**Your job**",
    "1. What do you check or refuse first?",
    "2. What facts would you write down?",
    "3. Write the short update you would send (3–6 lines).",
    "",
    "**Shape of a strong update**",
    "To: (your lead / supervisor)",
    "Where: …",
    "What I found: …",
    "What I am doing / holding: …",
    "What I need: …",
    "",
    "Paste your draft when ready.",
    remember(),
  ].join("\n");

  const u2 = `My try:\nWhere: the work area\nWhat I found: something looked off about ${topic}\nWhat I did: stopped and told my lead\nNeed: eyes on it\nPlease improve this for the real situation you gave me.`;
  const a2 = [
    "**Critique of your draft**",
    "",
    `**Goal:** Upgrade your note so it matches *this* ${ind.name} situation — not a generic hold.`,
    "",
    "**What you already got right**",
    "- You stopped instead of hoping.",
    "- You told a lead instead of staying silent.",
    "",
    "**What was too vague for this scenario**",
    `Your note could apply to any problem. For the situation above — ${pack.practiceSetup.slice(0, 120)}${pack.practiceSetup.length > 120 ? "…" : ""} — a lead needs **specific** facts.`,
    "",
    "**Stronger version for this exact case**",
    "",
    pack.practiceGoodUpdate,
    "",
    "**Why this version works**",
    ...pack.mistakeBetter.slice(0, 3).map((b) => `- ${b}`),
    "",
    "**Rewrite challenge**",
    "Send me your version in 4 lines or fewer, using at least one concrete detail from the situation (a measurement, name, room, part, or document).",
    remember(),
  ].join("\n");

  return [
    { role: "user", content: u1 },
    { role: "assistant", content: a1 },
    { role: "user", content: u2 },
    { role: "assistant", content: a2 },
  ];
}

/* -------------------- QUIZ -------------------- */

function practiceQuizTurns(ind: Industry, topic: string, pack: IndustryDemoPack): DemoTurn[] {
  const letters = ["A", "B", "C", "D"];
  const qBlock = pack.quiz
    .map((q, i) => {
      const choices = q.choices.map((c, j) => `${letters[j]}) ${c}`).join("  \n");
      return `**Question ${i + 1}.** ${q.prompt}\n${choices}`;
    })
    .join("\n\n");

  const u1 = `Quiz me on ${topic} for ${ind.name}. Three questions, then score me hard but fairly.`;
  const a1 = [
    `**Quick check — ${topic}**`,
    "",
    `**Goal:** Check judgment on *${topic}* in ${ind.name}. Wrong answers are useful — I will explain them.`,
    "",
    qBlock,
    "",
    "Reply like: `1-B, 2-A, 3-C` (or your own letters).",
    remember(),
  ].join("\n");

  // Simulate a mostly-correct learner answer using answer keys
  const learnerAns = pack.quiz.map((q, i) => `${i + 1}-${letters[q.answerIndex]}`).join(", ");
  const u2 = `My answers: ${learnerAns}`;

  const scoreRows = pack.quiz
    .map((q, i) => {
      const letter = letters[q.answerIndex];
      return `| ${i + 1} | ${letter} | Correct | ${q.why} |`;
    })
    .join("\n");

  const a2 = [
    "**Score and explanations**",
    "",
    `**Goal:** Lock in *why* the right answers win for ${ind.name}.`,
    "",
    "| No. | Answer | Result | Why it matters |",
    "| --- | --- | --- | --- |",
    scoreRows,
    "",
    `**Score: ${pack.quiz.length} / ${pack.quiz.length}**`,
    "",
    "**Tie-back to the craft**",
    pack.explainDetail,
    "",
    `**The mistake these questions are guarding against**`,
    `**${pack.mistakeTitle}** — ${pack.mistakeBody}`,
    safetyBlock(ind),
    "Want a harder round, or an on-the-job story next?",
    remember(),
  ].join("\n");

  return [
    { role: "user", content: u1 },
    { role: "assistant", content: a1 },
    { role: "user", content: u2 },
    { role: "assistant", content: a2 },
  ];
}

/* -------------------- SCENARIO -------------------- */

function scenarioTurns(ind: Industry, topic: string, pack: IndustryDemoPack): DemoTurn[] {
  const u1 = `Put me mid-shift in ${ind.name}. Something messy about ${topic}. Pressure to hurry. What should I do?`;
  const a1 = [
    `**On-the-job story — ${ind.name}**`,
    "",
    `**Goal:** Practice a real pressure moment about *${topic}* without freezing or panicking.`,
    "",
    "**What is happening**",
    pack.scenarioSetup,
    safetyBlock(ind),
    "**Write your first 10 minutes**",
    "1. What you **will not** do until you check",
    "2. What you **will check** (be specific)",
    "3. The **exact short message** you would send (3–6 lines)",
    "",
    "**How I will score you**",
    "- Specific to this situation (not generic slogans)",
    "- Right people told",
    "- Safety / truth over speed",
    "- Calm, usable language",
    "",
    "Your move.",
    remember(),
  ].join("\n");

  const u2 = `I would hold anything unsafe, check the critical items, and send a short factual update to my lead. How did I do for this scenario?`;
  const checks = pack.scenarioChecks.map((c) => `- ${c}`).join("\n");
  const a2 = [
    "**Debrief for this exact scenario**",
    "",
    `**Goal:** Leave with a message and checklist you could reuse tomorrow on a ${ind.name} job.`,
    "",
    "**Your instincts**",
    "Holding unsafe/unclear work and telling a lead is the right spine. Now make it specific.",
    "",
    "**What “hold” means here**",
    pack.scenarioHold,
    "",
    "**Checks that match this situation**",
    checks,
    "",
    "**A strong message for this story**",
    "",
    pack.scenarioMessage,
    "",
    "**Why this is better than a generic “I stopped” note**",
    `- It names the real problem behind *${topic}* in this moment.`,
    `- It tells the next person what decision is needed.`,
    `- It matches the craft mistake we guard against: **${pack.mistakeTitle}**.`,
    "",
    "**Optional next step**",
    "Rewrite the message in your own words in 4 lines. Keep the facts; change the voice to sound like you.",
    remember(),
  ].join("\n");

  return [
    { role: "user", content: u1 },
    { role: "assistant", content: a1 },
    { role: "user", content: u2 },
    { role: "assistant", content: a2 },
  ];
}

/* -------------------- CAREER -------------------- */

function careerTurns(ind: Industry, topic: string, pack: IndustryDemoPack): DemoTurn[] {
  const u1 = `I want into ${ind.name}. About 8 hours a week. Build a real first 90 days — especially around ${topic}.`;
  const t0 = ind.topics[0] ?? topic;
  const t1 = ind.topics[1] ?? t0;
  const t2 = ind.topics[2] ?? t1;

  const a1 = [
    `**First 90 days toward ${ind.name}**`,
    "",
    `**Goal:** A concrete plan you can follow without overwhelm, with early focus on *${t0}*.`,
    "",
    `**What you are aiming at**`,
    pack.what,
    "",
    "**Days 1–30 — foundations**",
    `- Learn the plain meaning of: ${t0}, ${t1}`,
    `- Master the mistake to avoid: **${pack.mistakeTitle}**`,
    "- Practice short status messages (where / found / hold or go / need)",
    "- One artifact: a one-page checklist or diagram you are proud of",
    "",
    "**Days 31–60 — supervised practice**",
    `- Two repeating tasks involving ${t2}`,
    "- Weekly feedback from a mentor, class, or skilled peer",
    "- Keep a dated notebook: what you saw vs what you guessed",
    "",
    "**Days 61–90 — proof**",
    "- One full story: problem → checks → who you told → result",
    "- Map licenses/courses that matter where you live",
    "- Be known as the person who does not ghost a real hold",
    "",
    "**Weekly rhythm (8 hours)**",
    "| Block | Time | Do this |",
    "| --- | --- | --- |",
    "| Learn | 3h | Concepts + examples for this craft |",
    "| Practice | 3h | Drills, messages, scenarios |",
    "| Reflect | 1h | Notes: fact vs guess |",
    "| Review | 1h | Self-quiz |",
    "",
    "Tell me your city/region or target role if you want week one customized further.",
    remember(),
  ].join("\n");

  const u2 = `Make week one concrete. What do I actually do Monday through Saturday?`;
  const weekRows = pack.careerWeek1
    .map((d) => `| ${d.day} | ${d.focus} | ${d.output} |`)
    .join("\n");
  const a2 = [
    `**Week one — ${ind.name}**`,
    "",
    `**Goal:** Finish Saturday with proof you understand *${t0}* and the main beginner trap.`,
    "",
    "| Day | Focus | Output someone skilled could skim |",
    "| --- | --- | --- |",
    weekRows,
    "",
    "**Pass bar for day 30**",
    `- You can explain *${t0}* in five minutes without jargon walls`,
    `- You can describe **${pack.mistakeTitle}** and how you avoid it`,
    "- Your notes have dates and who you would tell on a real problem",
    "",
    "**Start now**",
    `Reply with Monday’s output (“${pack.careerWeek1[0]?.output ?? "your first notes"}”) and I will mark it like a mentor — specific, not generic.`,
    remember(),
  ].join("\n");

  return [
    { role: "user", content: u1 },
    { role: "assistant", content: a1 },
    { role: "user", content: u2 },
    { role: "assistant", content: a2 },
  ];
}

function buildTurns(ind: Industry, mode: TutorMode, topic: string): DemoTurn[] {
  const pack = requirePack(ind);
  switch (mode) {
    case "explain":
      return explainTurns(ind, topic, pack);
    case "socratic":
      return socraticTurns(ind, topic, pack);
    case "practice":
      return practiceTurns(ind, topic, pack);
    case "quiz":
      return practiceQuizTurns(ind, topic, pack);
    case "scenario":
      return scenarioTurns(ind, topic, pack);
    case "career":
      return careerTurns(ind, topic, pack);
  }
}

function skillNamesFor(ind: Industry): { skillIds: string[]; skillNames: string[] } {
  const skillIds = ind.aosAffinity.slice(0, 3);
  const skillNames = skillIds.map((id) => getSkill(id)?.name ?? id);
  return { skillIds, skillNames };
}

function buildLesson(ind: Industry, modeMeta: (typeof MODE_META)[number]): DemoLesson {
  const topic = topicFor(ind, modeMeta.id);
  const pack = requirePack(ind);
  const { skillIds, skillNames } = skillNamesFor(ind);
  return {
    id: `${ind.id}--${modeMeta.id}`,
    industryId: ind.id,
    industryName: ind.name,
    mode: modeMeta.id,
    modeLabel: modeMeta.label,
    level: modeMeta.level,
    topic,
    skillIds,
    skillNames,
    title: `${ind.name} · ${modeMeta.label} · ${topic}`,
    summary: `${modeMeta.label}: real ${ind.name} content on “${topic}” — ${pack.mistakeTitle.slice(0, 80)}${pack.mistakeTitle.length > 80 ? "…" : ""}`,
    turns: buildTurns(ind, modeMeta.id, topic),
  };
}

export const DEMO_LESSONS: DemoLesson[] = INDUSTRIES.flatMap((ind) => {
  if (!getIndustryPack(ind.id)) {
    console.warn(`No demo pack for industry ${ind.id}`);
    return [];
  }
  return MODE_META.map((m) => buildLesson(ind, m));
});

export function lessonsForIndustry(industryId: string): DemoLesson[] {
  return DEMO_LESSONS.filter((l) => l.industryId === industryId);
}

export function getDemoLesson(id: string): DemoLesson | undefined {
  return DEMO_LESSONS.find((l) => l.id === id);
}

export function demoStats() {
  return {
    industries: new Set(DEMO_LESSONS.map((l) => l.industryId)).size,
    modes: MODE_META.length,
    lessons: DEMO_LESSONS.length,
    turns: DEMO_LESSONS.reduce((a, l) => a + l.turns.length, 0),
    skillsUsed: 3,
  };
}

export function industryDemoIndex() {
  return INDUSTRIES.filter((i) => getIndustryPack(i.id)).map((ind) => ({
    industry: ind,
    lessons: lessonsForIndustry(ind.id),
  }));
}
