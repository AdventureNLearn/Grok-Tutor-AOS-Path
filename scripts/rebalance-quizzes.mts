/**
 * Rebalance quiz answer keys so correct choice is not always B.
 * Preserves correct text; only reorders choices + answerIndex.
 * Usage: npx tsx scripts/rebalance-quizzes.mts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { INDUSTRY_PACKS, type DemoQuizItem } from "../src/lib/demo/industry-packs.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packsPath = path.join(__dirname, "../src/lib/demo/industry-packs.ts");

function rebalanceQuiz(quiz: DemoQuizItem[], seed: number): DemoQuizItem[] {
  return quiz.map((q, i) => {
    const target = (seed + i) % 4;
    if (q.answerIndex === target) return { ...q, choices: [...q.choices] };
    const choices = [...q.choices];
    const correct = choices[q.answerIndex];
    choices.splice(q.answerIndex, 1);
    choices.splice(target, 0, correct);
    return { ...q, choices, answerIndex: target };
  });
}

function esc(s: string): string {
  return JSON.stringify(s);
}

function emitQuiz(quiz: DemoQuizItem[]): string {
  const items = quiz
    .map((q) => {
      const choices = q.choices.map((c) => esc(c)).join(", ");
      return `      {
        prompt: ${esc(q.prompt)},
        choices: [${choices}],
        answerIndex: ${q.answerIndex},
        why: ${esc(q.why)},
      },`;
    })
    .join("\n");
  return `quiz: [
${items}
    ]`;
}

let src = fs.readFileSync(packsPath, "utf8");
// Normalize for matching
const packIds = Object.keys(INDUSTRY_PACKS);
let changed = 0;

for (let pi = 0; pi < packIds.length; pi++) {
  const id = packIds[pi]!;
  const pack = INDUSTRY_PACKS[id]!;
  const balanced = rebalanceQuiz(pack.quiz, pi);

  // Match: "id": { ... quiz: [ ... ],
  const packRe = new RegExp(
    `(\\n  "${id}": \\{[\\s\\S]*?)(quiz: \\[[\\s\\S]*?\\n    \\])(,\\s*\\n    scenarioSetup:)`,
  );
  const m = src.match(packRe);
  if (!m) {
    console.warn("pack quiz block not found:", id);
    continue;
  }
  const before = pack.quiz.map((q) => q.answerIndex).join(",");
  const after = balanced.map((q) => q.answerIndex).join(",");
  src = src.replace(packRe, `$1${emitQuiz(balanced)}$3`);
  changed++;
  console.log(`${id}: ${before} -> ${after}`);
}

fs.writeFileSync(packsPath, src);
console.log(`\nUpdated ${changed} packs in ${packsPath}`);
