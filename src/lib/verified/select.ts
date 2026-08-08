import { VERIFIED_NOTES } from "./catalog";
import type { VerifiedNote, VerifiedSelection } from "./types";
import type { TutorMode } from "../aos-skills";

export type SelectVerifiedInput = {
  industryId: string;
  mode: TutorMode;
  topic?: string;
  userText?: string;
  /** Max notes to inject into a single tutor turn */
  limit?: number;
};

function isStale(note: VerifiedNote, today = new Date()): boolean {
  const rev = Date.parse(note.reviewBy);
  if (Number.isNaN(rev)) return true;
  return rev < today.getTime();
}

function matchesScope(
  note: VerifiedNote,
  industryId: string,
  mode: TutorMode,
  haystack: string,
): boolean {
  const inds = note.scope.industries ?? [];
  if (inds.length > 0 && !inds.includes(industryId)) return false;

  const modes = note.scope.modes;
  if (modes && modes.length > 0 && !modes.includes(mode)) return false;

  const hints = note.scope.topicHints ?? [];
  if (hints.length === 0) return true;
  // must tier with empty hints already returned true; with hints require match
  if (note.tier === "must" && hints.length === 0) return true;
  return hints.some((h) => haystack.includes(h.toLowerCase()));
}

/**
 * Pick verified notes for this turn — deterministic, not generative.
 * Priority: safetyCritical must → must → when_relevant → reference.
 */
export function selectVerifiedNotes(input: SelectVerifiedInput): VerifiedSelection {
  const limit = input.limit ?? 4;
  const haystack = `${input.topic ?? ""} ${input.userText ?? ""}`.toLowerCase();

  const matched = VERIFIED_NOTES.filter((n) =>
    matchesScope(n, input.industryId, input.mode, haystack),
  );

  // For must notes with topicHints: also include industry-wide musts that have no hints
  // (already handled). For must with hints that don't match, still include if safetyCritical
  // and industry matches — operator chose must for a reason when any mode.
  const mustSafety = VERIFIED_NOTES.filter((n) => {
    if (!n.safetyCritical || n.tier !== "must") return false;
    const inds = n.scope.industries ?? [];
    if (inds.length > 0 && !inds.includes(input.industryId)) return false;
    if (inds.length === 0) return true; // global
    // industry-scoped safety: include even if topic hint miss (still must know)
    return true;
  });

  const byId = new Map<string, VerifiedNote>();
  for (const n of [...mustSafety, ...matched]) byId.set(n.id, n);

  const ordered = [...byId.values()].sort((a, b) => {
    const rank = (n: VerifiedNote) => {
      if (n.safetyCritical) return 0;
      if (n.tier === "must") return 1;
      if (n.tier === "when_relevant") return 2;
      return 3;
    };
    return rank(a) - rank(b);
  });

  const notes = ordered.slice(0, limit);
  const stale = notes.filter((n) => isStale(n));
  return { notes, stale };
}

/** Operator audit: notes past reviewBy */
export function listStaleVerifiedNotes(today = new Date()): VerifiedNote[] {
  return VERIFIED_NOTES.filter((n) => isStale(n, today));
}

/**
 * Professional inject for the REAL tutor.
 * Learner-facing: clean prose only — no _Limits:_ / _Sources:_ markers, no audit dates.
 */
export function formatVerifiedBlock(sel: VerifiedSelection): string {
  if (!sel.notes.length) return "";
  const lines = ["**Teaching notes**", ""];
  for (const n of sel.notes) {
    const stale = sel.stale.some((s) => s.id === n.id);
    lines.push(`- **${n.title}**${stale ? " — worth re-checking with your site materials" : ""}`);
    lines.push(`  ${n.statement}`);
    if (n.limits?.trim()) {
      lines.push(`  Keep in mind: ${softenLimits(n.limits)}`);
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

/**
 * MEME / ITSHABBENING inject only — same facts, casual tone.
 * Do not use this for the professional tutor surface.
 */
export function formatVerifiedBlockMeme(sel: VerifiedSelection): string {
  if (!sel.notes.length) return "";
  const lines = ["**Quick teaching notes**", ""];
  for (const n of sel.notes) {
    const stale = sel.stale.some((s) => s.id === n.id);
    lines.push(`- **${n.title}**${stale ? " — double-check this one" : ""}`);
    lines.push(`  ${n.statement}`);
    if (n.limits?.trim()) {
      lines.push(`  Keep in mind: ${softenLimits(n.limits)}`);
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

/** Soften stiff “local code / GC / jurisdiction” phrasing for learners. */
function softenLimits(limits: string): string {
  return limits
    .replace(/\blocal code and GC process\b/gi, "your site process and the people who sign off")
    .replace(/\blocal code\b/gi, "your site rules")
    .replace(/\bjurisdiction[-\s]?specific\b/gi, "site-specific")
    .replace(/\bemployer- and site-specific\b/gi, "specific to your workplace")
    .replace(/\bVerify requirements where you live and work\b/gi, "Check what your workplace and instructors expect")
    .trim();
}

function humanizeSources(sources: string[]): string {
  return sources
    .map((s) =>
      s
        .replace(/\s*\(educational[^)]*\)/gi, "")
        .replace(/\s*\(educational\)/gi, "")
        .trim(),
    )
    .filter(Boolean)
    .join(" · ");
}
