/**
 * PEPE & APU — Truth-teller heroes of the Village RPG.
 * Homage meme archetypes. Original stats/skills. No official IP assets.
 */

export type HeroId = "pepe" | "apu";

export type StatKey = "truth" | "based" | "chaos" | "luck" | "hp";

export type SkillId =
  | "rare_pepe_stare"
  | "feels_bad_counter"
  | "feels_good_buff"
  | "smug_refute"
  | "apu_receipts"
  | "apu_accent_dodge"
  | "apu_shopkeeper_haggle"
  | "dual_truth_bomb"
  | "copium_purge"
  | "narrative_shred";

export type Skill = {
  id: SkillId;
  name: string;
  hero: HeroId | "both";
  description: string;
  /** Combat power vs Fedslop */
  power: number;
  /** Truth damage multiplier flavor */
  truthCost: number;
  cooldown: number;
  kind: "attack" | "buff" | "debuff" | "heal" | "ultimate";
  line: string;
};

export type HeroDef = {
  id: HeroId;
  name: string;
  title: string;
  tagline: string;
  role: "striker" | "support";
  color: string;
  accent: string;
  /** Base stats at level 1 */
  base: {
    maxHp: number;
    truth: number;
    based: number;
    chaos: number;
    luck: number;
  };
  skills: SkillId[];
  quotes: string[];
  /** Portrait emoji (no external assets) */
  face: string;
};

export const SKILLS: Record<SkillId, Skill> = {
  rare_pepe_stare: {
    id: "rare_pepe_stare",
    name: "Rare Pepe Stare",
    hero: "pepe",
    description: "Unsettling truth stare. Shreds Fedslop armor.",
    power: 22,
    truthCost: 8,
    cooldown: 0,
    kind: "attack",
    line: "Pepe: *stares into the narrative until it blinks.*",
  },
  feels_bad_counter: {
    id: "feels_bad_counter",
    name: "Feels Bad Man Counter",
    hero: "pepe",
    description: "Turns enemy cope into reflected truth damage.",
    power: 16,
    truthCost: 6,
    cooldown: 1,
    kind: "debuff",
    line: "Pepe: feels bad man… for your talking points.",
  },
  feels_good_buff: {
    id: "feels_good_buff",
    name: "Feels Good Man",
    hero: "pepe",
    description: "Party heal + based buff. Victory lap energy.",
    power: 14,
    truthCost: 10,
    cooldown: 2,
    kind: "heal",
    line: "Pepe: feels good man. The receipts are warm.",
  },
  smug_refute: {
    id: "smug_refute",
    name: "Smug Refute",
    hero: "pepe",
    description: "One-liner that deletes a midwit paragraph.",
    power: 28,
    truthCost: 12,
    cooldown: 2,
    kind: "attack",
    line: "Pepe: nice narrative. Shame if someone… sourced it.",
  },
  apu_receipts: {
    id: "apu_receipts",
    name: "Apu's Receipts",
    hero: "apu",
    description: "Pulls primary sources. Massive truth damage.",
    power: 24,
    truthCost: 9,
    cooldown: 0,
    kind: "attack",
    line: "Apu: thank you, come again — with citations.",
  },
  apu_accent_dodge: {
    id: "apu_accent_dodge",
    name: "Polite Dodge",
    hero: "apu",
    description: "Sidesteps slander with impeccable manners.",
    power: 10,
    truthCost: 5,
    cooldown: 1,
    kind: "buff",
    line: "Apu: I am not angry. I am simply correct.",
  },
  apu_shopkeeper_haggle: {
    id: "apu_shopkeeper_haggle",
    name: "Shopkeeper Haggle",
    hero: "apu",
    description: "Steals gold from Fedslop budget lines. Debuffs enemy.",
    power: 12,
    truthCost: 7,
    cooldown: 1,
    kind: "debuff",
    line: "Apu: your grant funding is… aggressively marked down.",
  },
  dual_truth_bomb: {
    id: "dual_truth_bomb",
    name: "Dual Truth Bomb",
    hero: "both",
    description: "Pepe + Apu combo. Nukes the narrative boss bar.",
    power: 45,
    truthCost: 18,
    cooldown: 3,
    kind: "ultimate",
    line: "PEPE & APU: THE NARRATIVE IS FEDSLOP. HERE IS THE PRIMARY SOURCE.",
  },
  copium_purge: {
    id: "copium_purge",
    name: "Copium Purge",
    hero: "both",
    description: "Clears party debuffs. Burns enemy cope stacks.",
    power: 18,
    truthCost: 11,
    cooldown: 2,
    kind: "debuff",
    line: "Truth tellers: copium expired. Reality re-enabled.",
  },
  narrative_shred: {
    id: "narrative_shred",
    name: "Narrative Shredder",
    hero: "both",
    description: "Document dump. Ignores 30% of Fedslop armor.",
    power: 32,
    truthCost: 14,
    cooldown: 2,
    kind: "attack",
    line: "They printed the story. You printed the footnotes.",
  },
};

export const HEROES: Record<HeroId, HeroDef> = {
  pepe: {
    id: "pepe",
    name: "PEPE",
    title: "The Rare Truth Frog",
    tagline: "Feels good man when the primary source hits.",
    role: "striker",
    color: "#4ade80",
    accent: "#166534",
    face: "🐸",
    base: { maxHp: 100, truth: 14, based: 16, chaos: 12, luck: 10 },
    skills: [
      "rare_pepe_stare",
      "feels_bad_counter",
      "feels_good_buff",
      "smug_refute",
      "dual_truth_bomb",
      "narrative_shred",
    ],
    quotes: [
      "The narrative is mid. The receipts are eternal.",
      "Feels bad man… for Fedslop.",
      "I didn't leave the timeline. The timeline left evidence.",
      "Smug is a side effect of being right.",
    ],
  },
  apu: {
    id: "apu",
    name: "APU",
    title: "Keeper of Receipts",
    tagline: "Thank you, come again — with sources.",
    role: "support",
    color: "#60a5fa",
    accent: "#1e3a8a",
    /** Distinct from Pepe — shopkeeper / receipt energy */
    face: "🏪",
    base: { maxHp: 90, truth: 18, based: 12, chaos: 8, luck: 14 },
    skills: [
      "apu_receipts",
      "apu_accent_dodge",
      "apu_shopkeeper_haggle",
      "copium_purge",
      "dual_truth_bomb",
      "narrative_shred",
    ],
    quotes: [
      "I have the timestamps. Do you have the courage?",
      "Fedslop is not a food group. It is a coping strategy.",
      "In my shop, lies cost extra. Truth is free.",
      "Please do not confuse politeness with permission to gaslight.",
    ],
  },
};

export type HeroRuntime = {
  id: HeroId;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  truth: number;
  based: number;
  chaos: number;
  luck: number;
  /** Skill cooldowns remaining (turns) */
  cds: Partial<Record<SkillId, number>>;
  status: string[];
};

export function makeHeroRuntime(id: HeroId, level = 1): HeroRuntime {
  const def = HEROES[id];
  const safeLevel = Number.isFinite(level) && level >= 1 ? Math.min(50, Math.floor(level)) : 1;
  const scale = 1 + (safeLevel - 1) * 0.12;
  const maxHp = Math.round(def.base.maxHp * scale);
  return {
    id,
    level: safeLevel,
    xp: 0,
    hp: maxHp,
    maxHp,
    truth: Math.round(def.base.truth * scale),
    based: Math.round(def.base.based * scale),
    chaos: Math.round(def.base.chaos * scale),
    luck: Math.round(def.base.luck * scale),
    cds: {},
    status: [],
  };
}

/** Repair partial / corrupted save data so PEPE & APU never crash the UI */
export function normalizeHero(
  id: HeroId,
  raw: Partial<HeroRuntime> | null | undefined,
): HeroRuntime {
  const base = makeHeroRuntime(id, raw?.level ?? 1);
  if (!raw || typeof raw !== "object") return base;

  const level =
    typeof raw.level === "number" && raw.level >= 1
      ? Math.min(50, Math.floor(raw.level))
      : base.level;
  const scaled = makeHeroRuntime(id, level);

  const maxHp =
    typeof raw.maxHp === "number" && raw.maxHp > 0
      ? Math.floor(raw.maxHp)
      : scaled.maxHp;
  let hp =
    typeof raw.hp === "number" && Number.isFinite(raw.hp)
      ? Math.floor(raw.hp)
      : maxHp;
  hp = Math.max(0, Math.min(maxHp, hp));

  return {
    id,
    level,
    xp: typeof raw.xp === "number" && raw.xp >= 0 ? Math.floor(raw.xp) : 0,
    hp,
    maxHp,
    truth:
      typeof raw.truth === "number" && raw.truth > 0
        ? Math.floor(raw.truth)
        : scaled.truth,
    based:
      typeof raw.based === "number" && raw.based > 0
        ? Math.floor(raw.based)
        : scaled.based,
    chaos:
      typeof raw.chaos === "number" && raw.chaos >= 0
        ? Math.floor(raw.chaos)
        : scaled.chaos,
    luck:
      typeof raw.luck === "number" && raw.luck > 0
        ? Math.floor(raw.luck)
        : scaled.luck,
    cds:
      raw.cds && typeof raw.cds === "object" && !Array.isArray(raw.cds)
        ? { ...raw.cds }
        : {},
    status: Array.isArray(raw.status)
      ? raw.status.filter((s) => typeof s === "string")
      : [],
  };
}

export function normalizeParty(
  raw: Partial<Record<HeroId, Partial<HeroRuntime>>> | null | undefined,
): Record<HeroId, HeroRuntime> {
  return {
    pepe: normalizeHero("pepe", raw?.pepe),
    apu: normalizeHero("apu", raw?.apu),
  };
}

export function cloneParty(
  party: Record<HeroId, HeroRuntime>,
): Record<HeroId, HeroRuntime> {
  const n = normalizeParty(party);
  return {
    pepe: { ...n.pepe, cds: { ...n.pepe.cds }, status: [...n.pepe.status] },
    apu: { ...n.apu, cds: { ...n.apu.cds }, status: [...n.apu.status] },
  };
}

export function xpToNextLevel(level: number): number {
  return 40 + level * 35;
}

export function applyLevelUps(hero: HeroRuntime): HeroRuntime {
  const id: HeroId = hero?.id === "apu" ? "apu" : "pepe";
  let h = normalizeHero(id, hero);
  let need = xpToNextLevel(h.level);
  while (h.xp >= need && h.level < 50) {
    h.xp -= need;
    h.level += 1;
    const def = HEROES[id];
    h.maxHp = Math.round(def.base.maxHp * (1 + (h.level - 1) * 0.12));
    h.hp = h.maxHp;
    h.truth = Math.round(def.base.truth * (1 + (h.level - 1) * 0.12));
    h.based = Math.round(def.base.based * (1 + (h.level - 1) * 0.12));
    h.chaos = Math.round(def.base.chaos * (1 + (h.level - 1) * 0.12));
    h.luck = Math.round(def.base.luck * (1 + (h.level - 1) * 0.12));
    need = xpToNextLevel(h.level);
  }
  return { ...h, id, cds: { ...h.cds }, status: [...h.status] };
}

export function heroSkills(id: HeroId): Skill[] {
  const hid = id === "apu" ? "apu" : "pepe";
  return HEROES[hid].skills
    .map((sid) => SKILLS[sid])
    .filter(Boolean);
}
