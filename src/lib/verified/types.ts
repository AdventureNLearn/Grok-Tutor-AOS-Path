/**
 * Verified currency layer — structured, dated, source-backed facts.
 * Not generative. Operators add/update rows; tutor surfaces them when relevant.
 */

export type VerifiedTier =
  /** Always show when industry matches (safety / legal-adjacent / must-not-miss) */
  | "must"
  /** Show when topic or mode touches this area */
  | "when_relevant"
  /** Optional deeper note; catalog / reference only */
  | "reference";

export type VerifiedScope = {
  /** Industry ids; empty = all industries */
  industries?: string[];
  /** Substring match against topic / user message (lowercase) */
  topicHints?: string[];
  /** Tutor modes that should surface this note */
  modes?: Array<
    "explain" | "socratic" | "practice" | "quiz" | "scenario" | "career"
  >;
};

export type VerifiedNote = {
  id: string;
  /** Short stable title for operators */
  title: string;
  /** Learner-facing plain language (what we teach) */
  statement: string;
  /** What this is NOT / limits of the claim */
  limits: string;
  /** Public source labels (code name, org, doc title — not private URLs required) */
  sources: string[];
  /** ISO date YYYY-MM-DD — last human verification */
  verifiedOn: string;
  /** ISO date — after this, treat as stale in UI / audits */
  reviewBy: string;
  tier: VerifiedTier;
  scope: VerifiedScope;
  /** Safety-critical: always lead with this when selected */
  safetyCritical?: boolean;
};

export type VerifiedSelection = {
  notes: VerifiedNote[];
  stale: VerifiedNote[];
};
