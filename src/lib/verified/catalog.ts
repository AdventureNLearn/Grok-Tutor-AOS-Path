/**
 * Verified teaching notes (dated facts with limits).
 * Learner-facing format is soft prose via formatVerifiedBlock — no audit markers.
 * Rebuild from private pack if needed: npx tsx scripts/build-itshabbening.mts
 */
import type { VerifiedNote } from "./types";
import payload from "./data/verified-notes.json";

type Payload = {
  name: string;
  notes: VerifiedNote[];
};

const data = payload as Payload;

export const ITSHABBENING_NAME = data.name || "ITSHABBENING";

export const VERIFIED_NOTES: VerifiedNote[] = Array.isArray(data.notes)
  ? data.notes
  : [];
