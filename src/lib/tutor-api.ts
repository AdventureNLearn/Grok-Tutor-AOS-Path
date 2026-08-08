import { createServerFn } from "@tanstack/react-start";
import { getSkill, type TutorMode } from "./aos-skills";
import { getIndustryPack } from "./demo/industry-packs";
import { getIndustry } from "./industries";
import {
  formatVerifiedBlock,
  formatVerifiedBlockMeme,
  selectVerifiedNotes,
} from "./verified/select";
import { isMemeLane, type TutorLane } from "./tutor-lane";

export type TutorMessage = { role: "user" | "assistant" | "system"; content: string };

export type TutorChatRequest = {
  industryId: string;
  mode: TutorMode;
  level: "beginner" | "intermediate" | "advanced";
  skillIds: string[];
  topic?: string;
  messages: TutorMessage[];
  /** real = professional Grok Tutor; meme = ITSHABBENING voice only */
  lane?: TutorLane;
};

export type TutorChatResult =
  | { ok: true; text: string; offline?: boolean }
  | { ok: false; error: string; offline?: boolean };

const MODE_HINTS: Record<TutorMode, string> = {
  explain: "Explain clearly in plain words. Define terms. End with two check questions.",
  socratic: "Lead with questions. Do not lecture until the learner answers.",
  practice: "Give a short drill. Ask the learner to show work. Critique for safety and clarity.",
  quiz: "Ask a few scored questions, then explain wrong answers kindly.",
  scenario: "Give a realistic workplace story. Ask for decisions. Debrief calmly.",
  career: "Build a simple 30 / 60 / 90 day plan from the learner's hours and goal.",
};

function verifiedForRequest(req: TutorChatRequest) {
  const lastUser =
    [...req.messages].reverse().find((m) => m.role === "user")?.content ?? "";
  return selectVerifiedNotes({
    industryId: req.industryId,
    mode: req.mode,
    topic: req.topic,
    userText: lastUser,
    limit: 4,
  });
}

function buildSystemPrompt(req: TutorChatRequest): string {
  const industry = getIndustry(req.industryId);
  const pack = getIndustryPack(req.industryId);
  const skills = req.skillIds
    .map((id) => getSkill(id))
    .filter((s) => s && s.tutorEnabled)
    .slice(0, 4);

  const skillBlock = skills.length
    ? skills
        .map(
          (s) =>
            `- ${s!.name}: ${s!.lensPrompt}`,
        )
        .join("\n")
    : "- Teach carefully. Separate what was seen from what is guessed.";

  const craftBlock = pack
    ? [
        "",
        "Craft-specific teaching corpus (use these facts; do not invent conflicting procedure):",
        `What the craft is: ${pack.what}`,
        `Explain detail: ${pack.explainDetail}`,
        `Core steps: ${pack.coreSteps.join(" | ")}`,
        `Beginner mistake to guard: ${pack.mistakeTitle} — ${pack.mistakeBody}`,
        `Better habits: ${pack.mistakeBetter.join(" | ")}`,
        `Good field message example: ${pack.exampleGood}`,
        `Weak message to avoid: ${pack.exampleBad}`,
        req.mode === "socratic"
          ? `Socratic seeds: Q1 ${pack.socraticQ1} | Push: ${pack.socraticPush} | Q2 ${pack.socraticQ2} | Q3 ${pack.socraticQ3}`
          : "",
        req.mode === "practice"
          ? `Practice situation: ${pack.practiceSetup} | Model update: ${pack.practiceGoodUpdate}`
          : "",
        req.mode === "scenario"
          ? `Scenario: ${pack.scenarioSetup} | Hold: ${pack.scenarioHold} | Checks: ${pack.scenarioChecks.join(" | ")}`
          : "",
        req.mode === "quiz"
          ? `Quiz bank (may reorder choices when presenting; keep the same correct idea): ${pack.quiz.map((q, i) => `${i + 1}. ${q.prompt} → ${q.choices[q.answerIndex]} (${q.why})`).join(" || ")}`
          : "",
        req.mode === "career"
          ? `Week-one plan: ${pack.careerWeek1.map((d) => `${d.day}: ${d.focus} → ${d.output}`).join(" | ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const meme = isMemeLane(req.lane);
  const verifiedRaw = verifiedForRequest(req);
  const verified = meme
    ? formatVerifiedBlockMeme(verifiedRaw)
    : formatVerifiedBlock(verifiedRaw);
  const verifiedBlock = verified
    ? meme
      ? [
          "",
          "ITSHABBENING lane (MEME VOICE — separate from professional Grok Tutor UI):",
          verified,
          "Voice: blunt South-Park-adjacent, human, zero corporate HR, zero internal IDs or codespeak.",
          "Still: do not invent laws/codes; keep safety real; stay educational.",
        ].join("\n")
      : [
          "",
          "Checked teaching notes (prefer these; do not invent codes or laws):",
          verified,
          "If a note is past review date, tell the learner to re-check the official source.",
        ].join("\n")
    : "";

  const voiceBlock = meme
    ? [
        "You are the ITSHABBENING tutor — SAME facts as the serious tutor, DIFFERENT voice.",
        "This is the MEME lane, explicitly separate from professional Grok Tutor branding.",
        "Talk like a chaotic-but-caring shop lead who watches too many cartoons: blunt, funny, short.",
        "Never show internal note IDs, hash-looking strings, API names, or developer jargon to the learner.",
        "Safety and limits stay honest — jokes never override 'stop if someone can get hurt.'",
      ].join("\n")
    : [
        "You are Grok Tutor — a patient craft mentor for real jobs (trades, health, tech, and more).",
        "Write for people with little or no experience. Use plain English. Define every term the first time.",
        "Professional tone: calm, clear, shop-floor honest. No meme voice, no ITSHABBENING branding.",
      ].join("\n");

  return [
    voiceBlock,
    "State the goal of each answer in one short line near the top.",
    "Never dump product names, repo jargon, or attack playbooks.",
    "For security topics: protective practice and conceptual awareness only.",
    "Prefer craft-specific situations over generic pep talks. End with a short learner action (answer, rewrite, or check).",
    "Do not invent regulations, license rules, or clinical protocols. Use checked notes and craft corpus; otherwise stay general and tell the learner to check local authority.",
    industry?.safetyFirst
      ? "This field is SAFETY-FIRST. If someone could get hurt, lead with that."
      : "",
    `Industry: ${industry?.name ?? req.industryId}`,
    industry?.blurb ? `Industry focus: ${industry.blurb}` : "",
    req.topic ? `Optional topic focus: ${req.topic}` : "",
    `Learner level: ${req.level}`,
    MODE_HINTS[req.mode],
    craftBlock,
    verifiedBlock,
    "",
    "Thinking habits to apply:",
    skillBlock,
    "",
    meme
      ? "Format: short bold labels, scannable lists, phone-friendly. No # headings. No internal IDs."
      : "Format with short bold labels (not # markdown headings) and simple lists. Keep messages scannable on a phone. Never use # or ## heading marks.",
  ]
    .filter(Boolean)
    .join("\n");
}

async function callXai(
  system: string,
  messages: TutorMessage[],
): Promise<TutorChatResult> {
  const key = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
  if (!key) {
    return { ok: false, error: "No API key configured." };
  }

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        // Prefer current SuperGrok / console default; override with XAI_MODEL in .env
        model: process.env.XAI_MODEL || process.env.GROK_MODEL || "grok-4.5",
        temperature: 0.4,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `Model error ${res.status}: ${body.slice(0, 240)}` };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return { ok: false, error: "Empty model response." };
    return { ok: true, text };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error calling model." };
  }
}

/** Exported for batch learner simulations / quality audits */
export function offlineTutorReply(req: TutorChatRequest): string {
  const industry = getIndustry(req.industryId);
  const pack = getIndustryPack(req.industryId);
  const lastUser = [...req.messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const name = industry?.name ?? req.industryId;
  const topicHint = req.topic || industry?.topics?.[0] || name;
  const safety = industry?.safetyFirst
    ? "\n\n**Safety first:** If a person could get hurt, stop. Fix that before speed or the schedule.\n"
    : "";

  let core = "";
  switch (req.mode) {
    case "explain":
      core = pack
        ? [
            `**${topicHint} — explained for a beginner**`,
            "",
            `**Goal:** Leave knowing what *${topicHint}* means in ${name}, the main steps, and one mistake to avoid.`,
            "",
            lastUser ? `You asked about: ${lastUser.slice(0, 280)}` : "",
            "",
            `**What ${name} is**`,
            pack.what,
            "",
            `**What “${topicHint}” means here**`,
            pack.explainDetail,
            safety,
            "**Steps good people follow**",
            ...pack.coreSteps.map((s, i) => `${i + 1}. ${s}`),
            "",
            "**Example of a clear message**",
            "",
            pack.exampleGood,
            "",
            "**Example of a weak message (avoid)**",
            "",
            pack.exampleBad,
            "",
            `**Most common beginner mistake: ${pack.mistakeTitle}**`,
            pack.mistakeBody,
            "",
            "**What careful people do instead**",
            ...pack.mistakeBetter.map((b) => `- ${b}`),
            "",
            "**Check your understanding**",
            `In your own words: what is *${topicHint}* trying to accomplish, and what is the first thing you verify before you act?`,
          ]
            .filter(Boolean)
            .join("\n")
        : [
            `**${name} — explained simply**`,
            "",
            `**Goal:** Understand the basics of ${name} in plain words, even if you are brand new.`,
            "",
            lastUser
              ? `You asked about: ${lastUser.slice(0, 280)}`
              : `Let's start with a solid foundation in **${name}**.`,
            "",
            "**In one sentence**",
            industry?.blurb ?? "We will build understanding from simple ideas to real practice.",
            "",
            topicHint ? `**Focus:** ${topicHint}` : "",
            safety,
            "**How to think about it**",
            "1. **What is the goal?** What does “done right” mean?",
            "2. **What do you see?** Write facts another person could re-check.",
            "3. **What are you guessing?** Keep guesses separate from facts.",
            "4. **What is the next safe step?** Small and easy to undo when you can.",
            "",
            "**Check your understanding**",
            "1. In your own words, what is the goal of this work?",
            "2. What would you verify before you act?",
          ]
            .filter(Boolean)
            .join("\n");
      break;
    case "socratic":
      core = pack
        ? [
            `**Questions about ${topicHint}**`,
            "",
            `**Goal:** Push your judgment on *${topicHint}* with real ${name} situations. Answer in plain words.`,
            "",
            lastUser ? `Starting from your note: ${lastUser.slice(0, 200)}` : "",
            safety,
            "**Question 1**",
            pack.socraticQ1,
            "",
            pack.socraticPush,
            "",
            "**Question 2**",
            pack.socraticQ2,
            "",
            "**Question 3**",
            pack.socraticQ3,
            "",
            "Answer Question 1 first — one or two specific sentences.",
          ]
            .filter(Boolean)
            .join("\n")
        : [
            `**Questions — ${name}**`,
            "",
            "**Goal:** Practice thinking with short questions. Answer one at a time.",
            "",
            lastUser ? `Starting from your note: ${lastUser.slice(0, 200)}` : "",
            safety,
            "**Question 1**",
            `What should matter most first in this ${name} situation — safety, accuracy, speed, or writing things down — and why that one first?`,
            "",
            "**Question 2 (after you answer)**",
            "What fact would raise or lower your confidence in that answer?",
            "",
            "**Question 3**",
            "If you were wrong, what would go wrong first?",
          ]
            .filter(Boolean)
            .join("\n");
      break;
    case "practice":
      core = pack
        ? [
            `**Practice drill — ${topicHint}**`,
            "",
            `**Goal:** Produce a clear response to a real ${name} problem about *${topicHint}*.`,
            safety,
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
            "**Example of a strong update for this case** (after you try)",
            pack.practiceGoodUpdate,
            "",
            "Paste your draft when ready.",
          ].join("\n")
        : [
            `**Practice — ${name}**`,
            "",
            "**Goal:** Write a clear update a busy lead can use.",
            safety,
            "**Part A**",
            `Describe a realistic ${name} problem. Include: (1) what you saw, (2) possible causes, (3) first safe check.`,
            "",
            "**Part B**",
            "Mark three claims as: **saw it** / **think so** / **not sure yet**.",
            "",
            "**Part C**",
            "Write a short action plan. Star any step that needs a licensed person.",
            "",
            "Show your work in simple words. I will mark it clear or not clear.",
          ].join("\n");
      break;
    case "quiz": {
      if (pack) {
        const letters = ["A", "B", "C", "D"];
        const qBlock = pack.quiz
          .map((q, i) => {
            const choices = q.choices.map((c, j) => `${letters[j]}) ${c}`).join("  \n");
            return `**Question ${i + 1}.** ${q.prompt}\n${choices}`;
          })
          .join("\n\n");
        core = [
          `**Quick check — ${topicHint}**`,
          "",
          `**Goal:** Check judgment on *${topicHint}* in ${name}. Wrong answers are useful — I will explain them.`,
          "",
          qBlock,
          "",
          "Reply like: `1-B, 2-A, 3-C` (or your own letters).",
          "",
          "_After you answer, ask me to score you and I will explain each item._",
        ].join("\n");
      } else {
        core = [
          `**Quick check — ${name}**`,
          "",
          "**Goal:** Check a few basics. Wrong answers are fine — we explain them.",
          "",
          "**Question 1.** What usually comes first on a serious task?",
          "A) Speed  B) Safety / risk check  C) Paperwork after  D) Small talk",
          "",
          "**Question 2.** A conclusion drawn from facts is:",
          "A) A raw measurement  B) A conclusion from facts  C) A coin flip  D) A rule book title",
          "",
          "**Question 3 (short answer).** Name one person or document you would check before acting on this topic.",
          "",
          "Reply like: `1-B, 2-B, 3) …`",
        ].join("\n");
      }
      break;
    }
    case "scenario":
      core = pack
        ? [
            `**On-the-job story — ${name}**`,
            "",
            `**Goal:** Practice a real pressure moment about *${topicHint}* without freezing or panicking.`,
            "",
            "**What is happening**",
            pack.scenarioSetup,
            safety,
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
            "Your move. (After you answer, ask for a debrief — I will share hold rules and a model message.)",
          ].join("\n")
        : [
            `**On-the-job story — ${name}**`,
            "",
            "**Goal:** Handle a messy moment when someone is pushing you to hurry.",
            "",
            `You are mid-shift. Notes about **${topicHint}** are incomplete. Someone wants it “done now.”`,
            safety,
            "**Your first 10 minutes**",
            "1. What will you **not** do until you check?",
            "2. What will you **check** (be specific)?",
            "3. What **short message** will you send your lead (3–5 lines)?",
            "",
            "Write it simply. Then we will debrief.",
          ].join("\n");
      break;
    case "career":
      core = pack
        ? [
            `**Getting started in ${name}**`,
            "",
            "**Goal:** A simple first 90 days without overwhelm.",
            "",
            `Level: **${req.level}** · First focus idea: **${topicHint}**`,
            "",
            `**What you are aiming at**`,
            pack.what,
            "",
            `**Master early: ${pack.mistakeTitle}**`,
            pack.mistakeBody,
            "",
            "**Days 1–30**",
            `- Plain meaning of: ${industry?.topics?.slice(0, 2).join(", ") || topicHint}`,
            "- Practice short status messages (where / found / hold or go / need)",
            "- One artifact: a one-page checklist or diagram you are proud of",
            "",
            "**Days 31–60**",
            "- Two repeating tasks with feedback",
            "- Weekly notes: what you saw vs what you guessed",
            "",
            "**Days 61–90**",
            "- One full story: problem → checks → who you told → result",
            "- Map licenses or courses that matter where you live",
            "",
            "**Week one snapshot**",
            ...pack.careerWeek1.map((d) => `- **${d.day}:** ${d.focus} → ${d.output}`),
            "",
            "Tell me your hours per week and target role so I can refine week one.",
          ].join("\n")
        : [
            `**Getting started in ${name}**`,
            "",
            "**Goal:** A simple first 90 days without overwhelm.",
            "",
            `Level: **${req.level}** · First focus idea: **${topicHint}**`,
            "",
            "**Days 1–30**",
            "- Core words and safety habits",
            "- One small write-up or diagram you are proud of",
            "",
            "**Days 31–60**",
            "- Practice two repeating tasks with feedback",
            "- Weekly notes: what you saw vs what you guessed",
            "",
            "**Days 61–90**",
            "- One full story: problem → checks → who you told → result",
            "- Map licenses or courses that matter where you live",
            "",
            "Tell me your hours per week and target role so I can refine week one.",
          ].join("\n");
      break;
  }

  const topics = industry?.topics?.length
    ? [
        "",
        "**Related topics to explore next**",
        ...industry.topics.slice(0, 4).map((t) => `- ${t}`),
      ].join("\n")
    : "";

  const meme = isMemeLane(req.lane);
  const verified = meme
    ? formatVerifiedBlockMeme(verifiedForRequest(req))
    : formatVerifiedBlock(verifiedForRequest(req));

  const next = meme
    ? [
        "",
        "**Your move**",
        "- Answer, or",
        "- Yell a follow-up question (keep it simple)",
      ].join("\n")
    : [
        "",
        "**Next step**",
        "- Reply with your answers, or",
        "- Ask me to go deeper on one section",
      ].join("\n");

  const remember = meme
    ? "**Remember:** what you saw · what you think · what you're guessing. Don't blend them like a smoothie."
    : "**Remember:** Say what you saw, what you think, and what you are still guessing. Do not mix them up.";

  // Meme offline: light voice pass on the pack core without inventing new facts
  let body = core;
  if (meme) {
    body = core
      .replace(/\*\*Goal:\*\*/g, "**Okay so the point:**")
      .replace(/\*\*Goal of this lesson:\*\*/gi, "**Okay so the point:**")
      .replace(/\*\*Check your understanding\*\*/gi, "**Quick check, genius**")
      .replace(/\*\*Your job\*\*/gi, "**Your job (do it)**")
      .replace(/\*\*Remember:\*\*[^\n]*/g, remember);
  }

  return [body, verified ? `\n${verified}` : "", topics, next, "", remember]
    .filter(Boolean)
    .join("\n");
}

export const tutorChat = createServerFn({ method: "POST" })
  .validator((data: TutorChatRequest) => data)
  .handler(async ({ data }): Promise<TutorChatResult> => {
    try {
      const system = buildSystemPrompt(data);
      const result = await callXai(system, data.messages);
      if (result.ok) return result;
      // Fall back to high-quality offline tutoring
      return { ok: true, text: offlineTutorReply(data), offline: true };
    } catch {
      return { ok: true, text: offlineTutorReply(data), offline: true };
    }
  });
