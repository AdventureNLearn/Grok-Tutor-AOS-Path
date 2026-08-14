/**
 * Contract: idle first-slice combs show industry + pairing, never SAF/PRD/BND.
 * Run: npx tsx scripts/assert-idle-comb-labels.mts
 */
import {
  buildFirstSliceIdleCombs,
  firstSliceTracks,
  learnerCombPairing,
} from "../src/lib/reasoning-tracks.ts";

const FORBIDDEN = /\b(SAF|PRD|BND)\b/;
const EXPECTED = [
  { industry: "Electrical", pairing: "Safety ladder" },
  { industry: "Plumbing", pairing: "Practice depth" },
  { industry: "HVAC", pairing: "Safety boundary" },
] as const;

const tracks = firstSliceTracks();
const combs = buildFirstSliceIdleCombs();

if (tracks.length !== 3 || combs.length !== 3) {
  throw new Error(`Expected exactly 3 first-slice idle combs, got tracks=${tracks.length} combs=${combs.length}`);
}

for (let i = 0; i < 3; i++) {
  const track = tracks[i]!;
  const comb = combs[i]!;
  const want = EXPECTED[i]!;
  const pairing = learnerCombPairing(track);
  const surface = [comb.acr, comb.title, comb.meta, pairing].join(" · ");
  if (FORBIDDEN.test(surface)) {
    throw new Error(`Operator code leaked on idle comb: ${surface}`);
  }
  if (comb.acr !== want.industry || comb.title !== want.pairing) {
    throw new Error(`Idle comb ${i} is "${comb.acr} / ${comb.title}", expected "${want.industry} / ${want.pairing}"`);
  }
  if (pairing !== `${want.industry} / ${want.pairing}`) {
    throw new Error(`Pairing "${pairing}" does not match ${want.industry} / ${want.pairing}`);
  }
}

const bannedIdle = /civic|nursing|construction/i;
for (const comb of combs) {
  const blob = `${comb.id} ${comb.acr} ${comb.title} ${comb.meta}`;
  if (bannedIdle.test(blob)) {
    throw new Error(`Idle field must not show civic/nursing/construction: ${blob}`);
  }
}

console.log(
  "idle comb labels ok:",
  combs.map((c) => `${c.acr} / ${c.title}`).join(" · "),
);
