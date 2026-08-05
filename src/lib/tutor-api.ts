import { createServerFn } from "@tanstack/react-start";
import { getSkill, type TutorMode } from "./aos-skills";
import { getIndustry } from "./industries";

export type TutorMessage = { role: "user" | "assistant" | "system"; content: string };

export type TutorChatRequest = {
  industryId: string;
  mode: TutorMode;
  level: "beginner" | "intermediate" | "advanced";
  skillIds: string[];
  topic?: string;
  messages: TutorMessage[];
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

function buildSystemPrompt(req: TutorChatRequest): string {
  const industry = getIndustry(req.industryId);
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

  return [
    "You are Grok Tutor — a patient craft mentor for real jobs (trades, health, tech, and more).",
    "Write for people with little or no experience. Use plain English. Define every term the first time.",
    "State the goal of each answer in one short line near the top.",
    "Never dump product names, repo jargon, or attack playbooks.",
    "For security topics: protective practice and conceptual awareness only.",
    industry?.safetyFirst
      ? "This field is SAFETY-FIRST. If someone could get hurt, lead with that."
      : "",
    `Industry: ${industry?.name ?? req.industryId}`,
    industry?.blurb ? `Industry focus: ${industry.blurb}` : "",
    req.topic ? `Optional topic focus: ${req.topic}` : "",
    `Learner level: ${req.level}`,
    MODE_HINTS[req.mode],
    "",
    "Thinking habits to apply:",
    skillBlock,
    "",
    "Format with short bold labels (not # markdown headings) and simple lists. Keep messages scannable on a phone. Never use # or ## heading marks.",
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
        model: "grok-3",
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

function offlineTutorReply(req: TutorChatRequest): string {
  const industry = getIndustry(req.industryId);
  const lastUser = [...req.messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const name = industry?.name ?? req.industryId;
  const topicHint = req.topic || industry?.topics?.[0] || name;
  const safety = industry?.safetyFirst
    ? "\n\n**Safety first:** If a person could get hurt, stop. Fix that before speed or the schedule.\n"
    : "";

  let core = "";
  switch (req.mode) {
    case "explain":
      core = [
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
        "**Common beginner mistakes**",
        "- Jumping to a fix before looking carefully",
        "- Treating a confident guess as a measured fact",
        "- Skipping a safety check because someone is waiting",
        "",
        "**Check your understanding**",
        "1. In your own words, what is the goal of this work?",
        "2. What would you verify before you act?",
      ]
        .filter(Boolean)
        .join("\n");
      break;
    case "socratic":
      core = [
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
      core = [
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
    case "quiz":
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
      break;
    case "scenario":
      core = [
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
      core = [
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

  const next = [
    "",
        "**Next step**",
    "- Reply with your answers, or",
    "- Ask me to go deeper on one section",
  ].join("\n");

  return [
    core,
    topics,
    next,
    "",
        "**Remember:** Say what you saw, what you think, and what you are still guessing. Do not mix them up.",
  ]
    .filter(Boolean)
    .join("\n");
}

export const tutorChat = createServerFn({ method: "POST" })
  .inputValidator((data: TutorChatRequest) => data)
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
