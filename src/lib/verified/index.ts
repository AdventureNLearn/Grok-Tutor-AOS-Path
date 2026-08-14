export type { VerifiedNote, VerifiedTier, VerifiedScope } from "./types";
export { VERIFIED_NOTES, ITSHABBENING_NAME } from "./catalog";
export {
  selectVerifiedNotes,
  formatVerifiedBlock,
  formatVerifiedBlockMeme,
  listStaleVerifiedNotes,
} from "./select";

import { VERIFIED_NOTES, ITSHABBENING_NAME } from "./catalog";
import { listStaleVerifiedNotes } from "./select";

export function itshabbeningStats() {
  const notes = VERIFIED_NOTES;
  const must = notes.filter((n) => n.tier === "must").length;
  const when = notes.filter((n) => n.tier === "when_relevant").length;
  const ref = notes.filter((n) => n.tier === "reference").length;
  const safety = notes.filter((n) => n.safetyCritical).length;
  const global = notes.filter(
    (n) => !n.scope.industries || n.scope.industries.length === 0,
  ).length;
  const stale = listStaleVerifiedNotes().length;
  const industries = new Set<string>();
  for (const n of notes) {
    for (const id of n.scope.industries ?? []) industries.add(id);
  }
  return {
    name: ITSHABBENING_NAME,
    total: notes.length,
    must,
    whenRelevant: when,
    reference: ref,
    safetyCritical: safety,
    global,
    industriesCovered: industries.size,
    stale,
  };
}
