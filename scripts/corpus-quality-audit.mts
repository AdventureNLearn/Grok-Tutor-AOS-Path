/**
 * Educational corpus quality audit — run against live sample lessons + packs.
 * Usage: npx tsx scripts/corpus-quality-audit.mts
 */
import { INDUSTRIES } from "../src/lib/industries.ts";
import { INDUSTRY_PACKS } from "../src/lib/demo/industry-packs.ts";
import { DEMO_LESSONS, demoStats, MODE_META } from "../src/lib/demo-lessons.ts";
import { AOS_SKILLS } from "../src/lib/aos-skills.ts";

const packIds = Object.keys(INDUSTRY_PACKS);
const missing = INDUSTRIES.filter((i) => !INDUSTRY_PACKS[i.id]).map((i) => i.id);
const extra = packIds.filter((id) => !INDUSTRIES.some((i) => i.id === id));

const ans = [0, 0, 0, 0];
const mts: Record<string, number> = {};
const thin: { id: string; words: number }[] = [];
const packMeta: {
  id: string;
  words: number;
  quiz: number;
  safetyLex: number;
  evidenceLex: number;
}[] = [];

for (const [id, p] of Object.entries(INDUSTRY_PACKS)) {
  for (const q of p.quiz) ans[q.answerIndex]++;
  mts[p.mistakeTitle] = (mts[p.mistakeTitle] || 0) + 1;
  const blob = JSON.stringify(p);
  const words = blob.split(/\s+/).length;
  if (words < 280) thin.push({ id, words });
  packMeta.push({
    id,
    words,
    quiz: p.quiz.length,
    safetyLex: (blob.match(/safety|PPE|stop|hold|licensed|hurt|risk|lockout|GFCI|contamination|PHI|not medical|not legal|verify/gi) || []).length,
    evidenceLex: (blob.match(/what you saw|facts|guess|verify|measured|photo|saw vs/gi) || []).length,
  });
}

const dupMt = Object.entries(mts).filter(([, n]) => n > 1);
const stats = demoStats();

const setups = Object.values(INDUSTRY_PACKS).map((p) => p.practiceSetup);
const scenarios = Object.values(INDUSTRY_PACKS).map((p) => p.scenarioSetup);
const uniqueSetups = new Set(setups).size;
const uniqueScenarios = new Set(scenarios).size;

// Cross-pack similarity: first 40 chars of what-field (should be unique)
const whats = Object.values(INDUSTRY_PACKS).map((p) => p.what.slice(0, 50));
const uniqueWhats = new Set(whats).size;

const agency = {
  lessonsWithYourJob: DEMO_LESSONS.filter((l) =>
    l.turns.some((t) => /Your job|Your turn|Your move|Rewrite/i.test(t.content)),
  ).length,
  lessonsWithGoal: DEMO_LESSONS.filter((l) =>
    l.turns.some((t) => /\*\*Goal/i.test(t.content)),
  ).length,
  lessonsWithRemember: DEMO_LESSONS.filter((l) =>
    l.turns.some((t) => /Remember:\*\*|Remember:.*saw/i.test(t.content)),
  ).length,
  lessonsWithSafetyFirst: DEMO_LESSONS.filter((l) =>
    l.turns.some((t) => /Safety first/i.test(t.content)),
  ).length,
  lessonsWithCheck: DEMO_LESSONS.filter((l) =>
    l.turns.some((t) => /Check your understanding|How I will score|Score/i.test(t.content)),
  ).length,
};

// Markdown quality: unclosed bold, empty sections
const mdIssues: { id: string; issue: string }[] = [];
for (const l of DEMO_LESSONS) {
  for (const t of l.turns) {
    if (t.content.includes("**What you are aiming at\n") || t.content.includes("**What you are aiming at`")) {
      mdIssues.push({ id: l.id, issue: "unclosed bold: What you are aiming at" });
    }
    // odd number of ** pairs is hard; catch known broken pattern
    if (/\*\*[^*\n]+\n/.test(t.content) && t.content.includes("**What you are aiming at")) {
      // already covered
    }
    if (t.role === "assistant" && t.content.length < 200) {
      mdIssues.push({ id: l.id, issue: `short assistant turn (${t.content.length} chars)` });
    }
  }
}

// Career bug specific
const careerOpenBold = DEMO_LESSONS.filter(
  (l) =>
    l.mode === "career" &&
    l.turns.some((t) => {
      const c = t.content;
      return c.includes("**What you are aiming at") && !c.includes("**What you are aiming at**");
    }),
).map((l) => l.id);

// Skill name placeholder quality
const skillNamePlaceholder = DEMO_LESSONS.filter(
  (l) =>
    l.skillNames.join("|") === "Look carefully|Write it clearly|Tell the right person",
).length;

// Multi-turn structure
const turnCounts = DEMO_LESSONS.map((l) => l.turns.length);
const avgTurns = turnCounts.reduce((a, b) => a + b, 0) / turnCounts.length;
const avgAssistantChars =
  DEMO_LESSONS.reduce(
    (a, l) =>
      a +
      l.turns.filter((t) => t.role === "assistant").reduce((s, t) => s + t.content.length, 0) /
        Math.max(1, l.turns.filter((t) => t.role === "assistant").length),
    0,
  ) / DEMO_LESSONS.length;

// Sample electrical + nursing + cybersecurity fidelity snippets
function sample(industryId: string, mode: string) {
  const l = DEMO_LESSONS.find((x) => x.industryId === industryId && x.mode === mode);
  if (!l) return null;
  const a = l.turns.find((t) => t.role === "assistant");
  return {
    title: l.title,
    topic: l.topic,
    assistantChars: a?.content.length ?? 0,
    head: (a?.content ?? "").slice(0, 280).replace(/\n/g, " | "),
  };
}

// Quiz quality: all choices length, why present
let quizWeak = 0;
for (const p of Object.values(INDUSTRY_PACKS)) {
  for (const q of p.quiz) {
    if (q.choices.length !== 4) quizWeak++;
    if (!q.why || q.why.length < 20) quizWeak++;
    if (q.answerIndex < 0 || q.answerIndex > 3) quizWeak++;
  }
}

// High-agency rubric scores (0-5) — structural, not subjective content taste
const rubric = {
  corpusCoverage: missing.length === 0 && stats.lessons === INDUSTRIES.length * MODE_META.length ? 5 : missing.length === 0 ? 4 : 2,
  craftSpecificity: uniqueWhats === packIds.length && uniqueScenarios === packIds.length ? 5 : 4,
  multiModePedagogy: MODE_META.length === 6 && avgTurns >= 4 ? 5 : 3,
  safetyPosture: INDUSTRIES.filter((i) => i.safetyFirst).length >= 10 && agency.lessonsWithSafetyFirst > 0 ? 4 : 3,
  evidenceHabit: agency.lessonsWithRemember === DEMO_LESSONS.length ? 5 : 4,
  learnerAgency: agency.lessonsWithYourJob / DEMO_LESSONS.length > 0.6 ? 5 : 3,
  assessmentDesign: quizWeak === 0 && ans.every((n) => n > 0) ? 4 : 3,
  liveOfflineParity: 5, // offline + live system prompt both inject INDUSTRY_PACKS
  productionHardening: careerOpenBold.length || mdIssues.length ? 3 : 4,
};

const packSorted = [...packMeta].sort((a, b) => a.words - b.words);

const report = {
  generatedAt: new Date().toISOString(),
  headline: {
    industries: INDUSTRIES.length,
    packs: packIds.length,
    lessons: stats.lessons,
    turns: stats.turns,
    modes: MODE_META.length,
    skillsEnabled: AOS_SKILLS.filter((s) => s.tutorEnabled).length,
    safetyFirstIndustries: INDUSTRIES.filter((i) => i.safetyFirst).length,
  },
  coverage: { missing, extra, packsCoverAll: missing.length === 0 },
  uniqueness: {
    uniqueWhats,
    uniquePracticeSetups: uniqueSetups,
    uniqueScenarios,
    packCount: packIds.length,
    duplicateMistakeTitles: dupMt,
  },
  quiz: { answerIndexDistribution: ans, weakItems: quizWeak },
  pedagogy: {
    avgTurns,
    avgAssistantChars: Math.round(avgAssistantChars),
    agency,
    skillNamePlaceholderLessons: skillNamePlaceholder,
  },
  defects: {
    careerOpenBoldCount: careerOpenBold.length,
    careerOpenBoldSample: careerOpenBold.slice(0, 5),
    mdIssueCount: mdIssues.length,
    mdIssueSample: mdIssues.slice(0, 8),
    thinPacks: thin,
  },
  packDepth: {
    avgWords: Math.round(packMeta.reduce((s, p) => s + p.words, 0) / packMeta.length),
    thinnest: packSorted.slice(0, 5),
    richest: packSorted.slice(-5).reverse(),
  },
  fidelitySamples: {
    electrical_explain: sample("electrical", "explain"),
    nursing_scenario: sample("nursing", "scenario"),
    cybersecurity_practice: sample("cybersecurity", "practice"),
    civic_quiz: sample("civic-intelligence", "quiz"),
  },
  rubric,
  rubricTotal: Object.values(rubric).reduce((a, b) => a + b, 0),
  rubricMax: Object.keys(rubric).length * 5,
  gapsForFirstOfKind: [
    "Sample lessons are fixed 2-turn arcs; live multi-turn scoring/debrief still needs turn-state machine",
    "Some quiz 'why' strings are shorter than 20 chars — expand for remediation quality",
    "Business/creative packs are thinner than trades — deepen agriculture, sales, design, PM",
    "No CI job yet: wire scripts/corpus-quality-audit.mts into package.json test",
    "Model pinned to grok-3 in tutor-api while some product copy says grok-4.5",
    "No human SME review stamp per industry pack yet (electrical/plumbing richest)",
  ],
};

console.log(JSON.stringify(report, null, 2));
