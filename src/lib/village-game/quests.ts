/**
 * Mission engine — 500 unique South Park–energy ops for PEPE & APU.
 * Built from handcrafted cores + non-repeating complications (never verb+noun spam).
 */
import {
  MISSION_CORES,
  COMPLICATIONS,
  NPCS,
  TWISTS,
  type MissionCore,
} from "./mission-bank";
import {
  type MiniGameKind,
  gradeScore,
  resultFlavor,
  scoreToMultipliers,
  type MiniGameResult,
} from "./minigames";

export const TOTAL_QUESTS = 500;
export const KENNY_DEATH_RATE = 0.65;

export type QuestLocationId =
  | "ws:learn"
  | "ws:samples"
  | "ws:industries"
  | "ws:skills"
  | "ws:itshabbening"
  | "ws:progress"
  | "ws:path"
  | "street"
  | "mountains"
  | "bus_stop";

export type QuestChoice = {
  id: "a" | "b";
  label: string;
  vibe: "chaotic" | "smart" | "greedy" | "kind" | "stupid";
};

export type Quest = {
  id: number;
  title: string;
  /** @deprecated use story — kept for any old UI refs */
  blurb: string;
  coldOpen: string;
  story: string;
  pepeLine: string;
  apuLine: string;
  complication: string;
  locationId: QuestLocationId;
  locationLabel: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  miniGame: MiniGameKind;
  choices: [QuestChoice, QuestChoice];
  /** Private outcome templates */
  _winA: string;
  _winB: string;
  _failA: string;
  _failB: string;
  _npc: string;
  _twist: string;
};

export type QuestOutcome = {
  questId: number;
  choiceId: "a" | "b";
  headline: string;
  body: string;
  punchline: string;
  kennyDied: boolean;
  kennyDeathFlavor: string | null;
  xp: number;
  chaos: number;
  respect: number;
  truthScore: number;
  gold: number;
  loot: string;
  combatChance: number;
  pepeLine: string;
  apuLine: string;
  miniGameGrade: MiniGameResult["grade"];
  miniGameScore: number;
  miniGameFlavor: string;
};

const LOC: Record<QuestLocationId, string> = {
  "ws:learn": "South Park Elementary",
  "ws:samples": "The Big Yellow Bus",
  "ws:industries": "Town Hall",
  "ws:skills": "Public Library",
  "ws:itshabbening": "The Note Church",
  "ws:progress": "Community Center",
  "ws:path": "Trailhead",
  street: "Main Street",
  mountains: "The Mountains",
  bus_stop: "Bus Stop",
};

const KENNY_FLAVORS = [
  "Crushed by a falling binder of primary sources — ironic, iconic.",
  "Ate the mystery paste and left this plane of existence.",
  "Tripped into a portal under the gym mats mid-op.",
  "Hit by the bus during a 'peaceful' blockade.",
  "Stamped MISLEADING so hard he dematerialized.",
  "Died in a snowbank of confiscated pamphlets.",
  "Choked on a sticky note that said DON'T.",
  "Lost a stare-off to a mountain. Fair.",
  "Spontaneously combusted during a groupchat coup.",
  "The 65% tax on existing near plot-critical frogs.",
  "Trampled by NFT goats asserting digital rights.",
  "Yeeted by a PowerPoint transition flashbang.",
  "Froze after Cartman stole his hoodie mid-mission.",
  "Died heroically retrieving a USB from a storm drain.",
  "Became one with the cope treadmill.",
];

const LOOT = [
  "Bloodstained primary source (still valid)",
  "Apu's emergency orange chicken",
  "Rare Pepe stare sunglasses",
  "Laminated topo map of reality",
  "Confiscated slogan poster (blank side useful)",
  "Note Church sticky: DON'T TRUST THE PASTE",
  "Cartman's dropped authoritah badge",
  "USB of Tuesday (do not edit)",
  "Snowball with a USB inside",
  "Therapist pamphlet, redacted into art",
  "Yearbook negative (unfaked)",
  "Grant Goblin's empty champagne flute",
  "Butters' juice box of courage",
  "Chalk stick of chronology",
  "AM radio crystal of breath",
  "HOA fine, unpaid, framed",
  "Orange chicken coupon (based)",
  "Dual Truth Bomb spent casing",
  "Kenny's hoodie (warm, cursed)",
  "Mayor's cancelled Message calendar page",
];

const HEADLINES_WIN = [
  "TRUTH LANDS. FEDSLOP FOLDS.",
  "PEPE & APU DON'T MISS.",
  "THE TOWN REMEMBERS HOW TO THINK.",
  "RECEIPTS > SERMONS.",
  "MISSION COMPLETE. NARRATIVE BLEEDING.",
  "FEELS GOOD MAN — EARNED.",
  "PRIMARY SOURCES ENTER THE CHAT.",
  "SOUTH PARK GLITCHES TOWARD REALITY.",
];

const HEADLINES_LOSE = [
  "MESSY WIN CONDITIONS. STILL STANDING.",
  "YOU GOT BLOODIED. THE LIE GOT WORSE.",
  "PARTIAL TRUTH. FULL CHAOS.",
  "FEDSLOP SCORED A ROUND. REMATCH IMMINENT.",
  "NOT CLEAN. NOT OVER.",
];

const HEADLINES_KENNY = [
  "OH MY GOD THEY KILLED KENNY — OP CONTINUES",
  "65% TAX COLLECTED. TRUTH STILL SHIPPED.",
  "KENNY DOWN. BINDER UP.",
  "YOU BASTARDS. ALSO: MISSION RESULTS.",
  "KENNY DIED ON THE JOB. ICONIC. TRAGIC. ON BRAND.",
];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickUnique<T>(pool: readonly T[], id: number, lane: number): T {
  // Different lanes use different permutations so the same id doesn't always pair the same npc+twist
  const rand = mulberry32(id * 10007 + lane * 9176 + 13);
  const idx = Math.floor(rand() * pool.length) % pool.length;
  // offset by id so adjacent missions diverge hard
  const final = (idx + id * (lane + 3) + lane * 17) % pool.length;
  return pool[final]!;
}

function fill(template: string, npc: string, twist: string, complication: string) {
  return template
    .replace(/\{npc\}/g, npc)
    .replace(/\{twist\}/g, twist)
    .replace(/\{complication\}/g, complication);
}

function choiceVibe(label: string, id: "a" | "b"): QuestChoice["vibe"] {
  if (label.includes("🐸")) return id === "a" ? "chaotic" : "smart";
  if (label.includes("🧾")) return "smart";
  if (/haggle|underbid|price/i.test(label)) return "greedy";
  if (/gently|protect|juice/i.test(label)) return "kind";
  if (/smash|snowball|force|hijack/i.test(label)) return "chaotic";
  return "smart";
}

function uniqueTitle(core: MissionCore, id: number, complication: string): string {
  // Episode-number + short complication hook so no two titles collide
  const hook = complication
    .replace(/Cartman|Kenny|Butters|Wendy|Stan|Kyle/g, (m) => m)
    .split(/[.!?]/)[0]
    ?.trim()
    .slice(0, 42);
  return `${core.title} · Op #${id}${hook ? ` (${hook}…)` : ""}`;
}

let _cache: Quest[] | null = null;
const _titleSet = new Set<string>();

export function getAllQuests(): Quest[] {
  if (_cache) return _cache;
  const cores = MISSION_CORES;
  const quests: Quest[] = [];
  _titleSet.clear();

  for (let id = 1; id <= TOTAL_QUESTS; id++) {
    const core = cores[(id - 1) % cores.length]!;
    const cycle = Math.floor((id - 1) / cores.length); // 0..n variants of same core
    const complication = pickUnique(COMPLICATIONS, id, 1 + cycle);
    const npc = pickUnique(NPCS, id, 2 + cycle);
    const twist = pickUnique(TWISTS, id, 3 + cycle);

    let title = uniqueTitle(core, id, complication);
    // Guarantee absolute uniqueness
    if (_titleSet.has(title)) {
      title = `${core.title} · Op #${id} · Cut ${cycle + 1}`;
    }
    _titleSet.add(title);

    // Rotate mini-game slightly per cycle so same core isn't always same game
    const games: MiniGameKind[] = [
      core.miniGame,
      "stare_off",
      "receipt_match",
      "haggle",
      "fact_blitz",
      "snowball_fight",
      "memory_hole",
    ];
    const miniGame = games[(id + cycle) % games.length]!;

    const difficulty = Math.min(
      5,
      Math.max(1, core.difficulty + (cycle % 3 === 2 ? 1 : 0)),
    ) as 1 | 2 | 3 | 4 | 5;

    const coldOpen = core.coldOpen;
    const story = `${core.story}\n\nCOMPLICATION: ${complication}`;
    const blurb = story; // full story for anything still reading blurb

    quests.push({
      id,
      title,
      blurb,
      coldOpen,
      story,
      pepeLine: core.pepe,
      apuLine: core.apu,
      complication,
      locationId: core.locationId,
      locationLabel: LOC[core.locationId],
      difficulty,
      tags: [core.slug, miniGame, difficulty >= 4 ? "deadly" : "street"],
      miniGame,
      choices: [
        {
          id: "a",
          label: core.choiceA,
          vibe: choiceVibe(core.choiceA, "a"),
        },
        {
          id: "b",
          label: core.choiceB,
          vibe: choiceVibe(core.choiceB, "b"),
        },
      ],
      _winA: fill(core.winA, npc, twist, complication),
      _winB: fill(core.winB, npc, twist, complication),
      _failA: fill(core.failA, npc, twist, complication),
      _failB: fill(core.failB, npc, twist, complication),
      _npc: npc,
      _twist: twist,
    });
  }

  _cache = quests;
  return quests;
}

export function getQuest(id: number): Quest | undefined {
  if (id < 1 || id > TOTAL_QUESTS) return undefined;
  return getAllQuests()[id - 1];
}

export function buildingToLocation(buildingId: string): QuestLocationId | null {
  if (buildingId.startsWith("ws:")) return buildingId as QuestLocationId;
  if (buildingId.startsWith("ind:")) return "ws:industries";
  return null;
}

export function questsAtLocation(locationId: QuestLocationId): Quest[] {
  return getAllQuests().filter((q) => q.locationId === locationId);
}

export function resolveQuestOutcome(
  quest: Quest,
  choiceId: "a" | "b",
  mini?: MiniGameResult | null,
  rng: () => number = Math.random,
): QuestOutcome {
  const score = mini?.score ?? 50;
  const grade = mini?.grade ?? gradeScore(score);
  const mult = scoreToMultipliers(score);
  const kennyDied = rng() < KENNY_DEATH_RATE;
  const strong = score >= 55;
  const bodyCore =
    choiceId === "a"
      ? strong
        ? quest._winA
        : quest._failA
      : strong
        ? quest._winB
        : quest._failB;

  const flavorRand = mulberry32(quest.id * 131 + (choiceId === "a" ? 7 : 13) + score);
  const pick = <T,>(arr: readonly T[]) =>
    arr[Math.floor(flavorRand() * arr.length) % arr.length]!;

  let headline: string;
  if (kennyDied) headline = pick(HEADLINES_KENNY);
  else if (strong) headline = pick(HEADLINES_WIN);
  else headline = pick(HEADLINES_LOSE);

  const miniFlavor =
    mini?.flavor ?? resultFlavor(quest.miniGame, grade);

  const body = [
    bodyCore,
    ``,
    `MINI-GAME (${quest.miniGame.replace(/_/g, " ")}): ${grade} — ${Math.round(score)}/100`,
    miniFlavor,
    ``,
    `You committed to: “${quest.choices.find((c) => c.id === choiceId)?.label ?? choiceId}”`,
  ].join("\n");

  const baseXp = 14 + quest.difficulty * 12;
  const xp = Math.round(baseXp * mult.xp) + (kennyDied ? 6 : 0);
  const truthScore = Math.round((10 + quest.difficulty * 5) * mult.truth) + (strong ? 8 : 0);
  const gold = Math.round((6 + quest.difficulty * 5) * mult.gold);
  const chaos = Math.round(
    (choiceId === "a" ? 10 : 8) + quest.difficulty * 3 + (kennyDied ? 12 : 0) * mult.chaos,
  );
  const respect = strong ? 10 + quest.difficulty : kennyDied ? -1 : 3;

  return {
    questId: quest.id,
    choiceId,
    headline,
    body,
    punchline: quest._twist,
    kennyDied,
    kennyDeathFlavor: kennyDied ? pick(KENNY_FLAVORS) : null,
    xp,
    chaos,
    respect,
    truthScore,
    gold,
    loot: pick(LOOT),
    combatChance: Math.max(0.12, Math.min(0.75, mult.combatChance + quest.difficulty * 0.04)),
    pepeLine: quest.pepeLine || "Pepe: the job is the job.",
    apuLine: quest.apuLine || "Apu: receipts filed. next.",
    miniGameGrade: grade,
    miniGameScore: score,
    miniGameFlavor: miniFlavor,
  };
}

export function difficultyStars(d: number): string {
  return "★".repeat(d) + "☆".repeat(Math.max(0, 5 - d));
}

export function locationLabel(id: QuestLocationId): string {
  return LOC[id] ?? id;
}

/** How many handcrafted cores drive the 500 */
export function missionCoreCount(): number {
  return MISSION_CORES.length;
}
