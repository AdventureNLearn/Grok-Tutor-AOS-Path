/** Bundled flagship lesson bodies — not fetched from the giant public/corpus tree. */
import civic from "./reasoning-lessons/civic-claim-hygiene.md?raw";
import electrical from "./reasoning-lessons/electrical-safety-ladder.md?raw";
import fourAgent from "./reasoning-lessons/four-agent-field-ops.md?raw";
import plumbing from "./reasoning-lessons/plumbing-practice-depth.md?raw";
import career from "./reasoning-lessons/public-career-onboarding.md?raw";
import hvac from "./reasoning-lessons/hvac-safety-scenario.md?raw";

const RAW: Record<string, string> = {
  "civic-claim-hygiene": civic,
  "electrical-safety-ladder": electrical,
  "four-agent-field-ops": fourAgent,
  "plumbing-practice-depth": plumbing,
  "public-career-onboarding": career,
  "hvac-safety-scenario": hvac,
};

function stripFrontmatter(raw: string): string {
  const text = String(raw || "");
  if (!text.startsWith("---")) return text.trim();
  const end = text.indexOf("\n---", 3);
  if (end < 0) return text.trim();
  return text.slice(end + 4).trim();
}

export function reasoningLessonBody(id: string): string | null {
  const raw = RAW[id];
  if (!raw) return null;
  return stripFrontmatter(raw);
}
