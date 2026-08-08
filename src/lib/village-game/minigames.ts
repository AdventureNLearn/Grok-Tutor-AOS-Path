/**
 * Mini-game definitions for truth ops.
 */

export type MiniGameKind =
  | "stare_off"
  | "receipt_match"
  | "haggle"
  | "fact_blitz"
  | "snowball_fight"
  | "memory_hole";

export const MINI_GAME_META: Record<
  MiniGameKind,
  { name: string; blurb: string; hero: "pepe" | "apu" | "both" }
> = {
  stare_off: {
    name: "RARE PEPE STARE-OFF",
    blurb: "Hold the stare. Release in the green zone. Break their soul, not the timer.",
    hero: "pepe",
  },
  receipt_match: {
    name: "APU'S RECEIPT MATCH",
    blurb: "Three real sources. Three fakes. Tap only the real ones. Wrong tap = cope.",
    hero: "apu",
  },
  haggle: {
    name: "SHOPKEEPER HAGGLE",
    blurb: "Stop the price slider on the based zone. Mark their grant funding down.",
    hero: "apu",
  },
  fact_blitz: {
    name: "FACT BLITZ",
    blurb: "TRUE or FEDSLOP — as fast as you can. Hesitation is a narrative win.",
    hero: "both",
  },
  snowball_fight: {
    name: "SNOWBALL SUPPRESSION",
    blurb: "Mash snowballs into the midwit before the Message meter fills.",
    hero: "pepe",
  },
  memory_hole: {
    name: "MEMORY-HOLE DEFENSE",
    blurb: "Remember the truth sequence. The Timeline Editor is rewriting live.",
    hero: "both",
  },
};

export type MiniGameResult = {
  kind: MiniGameKind;
  score: number; // 0..100
  grade: "S" | "A" | "B" | "C" | "F";
  flavor: string;
};

export function gradeScore(score: number): MiniGameResult["grade"] {
  if (score >= 90) return "S";
  if (score >= 75) return "A";
  if (score >= 55) return "B";
  if (score >= 35) return "C";
  return "F";
}

export function resultFlavor(kind: MiniGameKind, grade: MiniGameResult["grade"]): string {
  const table: Record<MiniGameKind, Record<MiniGameResult["grade"], string>> = {
    stare_off: {
      S: "Pepe's pupils become event horizons. The midwit confesses in iambic pentameter.",
      A: "Solid rare stare. Someone's PowerPoint starts sweating.",
      B: "They blinked first… mostly. Good enough for Colorado.",
      C: "Pepe sneezed. Still unsettling. Barely.",
      F: "You looked at your phone. Feels bad man. For you.",
    },
    receipt_match: {
      S: "Apu files the perfect binder. The court of public opinion stands and applauds.",
      A: "Two real sources, zero fakes. Grant Goblin cries in nonprofit.",
      B: "You got the receipts. One was a coupon. Close enough.",
      C: "You submitted a Subway stamp card. Apu is disappointed professionally.",
      F: "You highlighted a meme and called it peer review. Disaster.",
    },
    haggle: {
      S: "Final price: their dignity. Apu accepts cash, check, or public apology.",
      A: "Funding slashed. Impact metrics go silently into the night.",
      B: "You got 30% off the lie. Not free, but on sale.",
      C: "You paid full narrative price. Embarrassing.",
      F: "You tipped the Fedslop. Apu leaves the chat.",
    },
    fact_blitz: {
      S: "Perfect blitz. The Message buffer underruns and blue-screens into honesty.",
      A: "Fast hands, clean calls. Talking-point bot smokes.",
      B: "A few fumbles. Still more accurate than cable news.",
      C: "You called a weather report Fedslop. Chill.",
      F: "You fact-checked your own pulse and failed.",
    },
    snowball_fight: {
      S: "Midwit becomes a snowman of shame. Children cheer. Cartman is furious he wasn't invited.",
      A: "Direct hits. Message meter never stood a chance.",
      B: "Decent arm. One snowball hit Kenny. Classic.",
      C: "You mostly hit the bus. The bus deserved it.",
      F: "You slipped, ate snow, and invented a new cope flavor.",
    },
    memory_hole: {
      S: "Timeline Editor rage-quits. Yesterday stays yesterday.",
      A: "Sequence locked. History refuses to be paste.",
      B: "You remembered the important bits. The rest is folklore.",
      C: "You remembered lunch. Not the plot. Problematic.",
      F: "You forgot why you walked into the room. Fedslop wins the round.",
    },
  };
  return table[kind][grade];
}

export function scoreToMultipliers(score: number) {
  const t = score / 100;
  return {
    xp: 0.55 + t * 0.9,
    truth: 0.5 + t * 1.1,
    gold: 0.6 + t * 0.8,
    chaos: 1.1 - t * 0.4,
    combatChance: 0.55 - t * 0.25,
  };
}
