/**
 * Turn-based Truth Combat — Pepe & Apu vs Fedslop.
 */
import {
  HEROES,
  SKILLS,
  type HeroId,
  type HeroRuntime,
  type SkillId,
  applyLevelUps,
  normalizeParty,
  cloneParty,
} from "./heroes";
import { ENEMIES, type EnemyRuntime } from "./enemies";

export type CombatLogLine = {
  t: number;
  text: string;
  kind: "hero" | "enemy" | "system" | "crit" | "truth";
};

export type CombatState = {
  heroes: Record<HeroId, HeroRuntime>;
  enemy: EnemyRuntime;
  turn: number;
  activeHero: HeroId;
  log: CombatLogLine[];
  over: boolean;
  victory: boolean;
  /** Temporary party buffs */
  partyBased: number;
  partyShield: number;
  questId: number | null;
  chapterId: number | null;
};

export type CombatRewards = {
  xp: number;
  gold: number;
  truthScore: number;
  loot: string;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function pushLog(
  state: CombatState,
  text: string,
  kind: CombatLogLine["kind"] = "system",
): CombatState {
  return {
    ...state,
    log: [{ t: Date.now(), text, kind }, ...state.log].slice(0, 40),
  };
}

export function startCombat(opts: {
  pepe: HeroRuntime;
  apu: HeroRuntime;
  enemy: EnemyRuntime;
  questId?: number | null;
  chapterId?: number | null;
  opener?: string;
}): CombatState {
  // Always normalize — never enter combat with broken PEPE/APU
  const party = cloneParty(
    normalizeParty({ pepe: opts.pepe, apu: opts.apu }),
  );
  // If both somehow at 0 HP, full restore so combat is playable
  if (party.pepe.hp <= 0 && party.apu.hp <= 0) {
    party.pepe.hp = party.pepe.maxHp;
    party.apu.hp = party.apu.maxHp;
  } else {
    if (party.pepe.hp <= 0) party.pepe.hp = Math.max(1, Math.floor(party.pepe.maxHp * 0.25));
    if (party.apu.hp <= 0) party.apu.hp = Math.max(1, Math.floor(party.apu.maxHp * 0.25));
  }
  party.pepe.cds = {};
  party.apu.cds = {};
  party.pepe.status = [];
  party.apu.status = [];

  let s: CombatState = {
    heroes: party,
    enemy: { ...opts.enemy },
    turn: 1,
    activeHero: party.pepe.hp > 0 ? "pepe" : "apu",
    log: [],
    over: false,
    victory: false,
    partyBased: 0,
    partyShield: 0,
    questId: opts.questId ?? null,
    chapterId: opts.chapterId ?? null,
  };
  s = pushLog(
    s,
    opts.opener ??
      `⚔️ TRUTH COMBAT — ${HEROES.pepe.name} & ${HEROES.apu.name} vs ${opts.enemy.name}`,
    "system",
  );
  s = pushLog(s, `${opts.enemy.face} ${opts.enemy.name} spreads Fedslop...`, "enemy");
  return s;
}

function tickCooldowns(h: HeroRuntime): HeroRuntime {
  const cds: HeroRuntime["cds"] = {};
  for (const [k, v] of Object.entries(h.cds)) {
    if (v && v > 1) cds[k as SkillId] = v - 1;
  }
  return { ...h, cds };
}

function dmgRoll(power: number, truth: number, based: number, luck: number) {
  const base = power + truth * 1.1 + based * 0.55;
  const variance = 0.85 + Math.random() * 0.3;
  const crit = Math.random() < 0.08 + luck * 0.004;
  const raw = base * variance * (crit ? 1.65 : 1);
  return { dmg: Math.round(raw), crit };
}

export function useSkill(
  state: CombatState,
  heroId: HeroId,
  skillId: SkillId,
): CombatState {
  if (state.over) return state;
  const skill = SKILLS[skillId];
  if (!skill) return state;
  if (skill.hero !== "both" && skill.hero !== heroId) {
    return pushLog(state, "That skill belongs to the other truth teller.", "system");
  }

  const party = cloneParty(normalizeParty(state.heroes));
  let s: CombatState = { ...state, heroes: party };
  let hero = { ...party[heroId], cds: { ...party[heroId].cds } };
  if (!hero || typeof hero.hp !== "number") {
    return pushLog(s, "Truth teller data glitched — repaired. Try again.", "system");
  }
  if ((hero.cds[skillId] ?? 0) > 0) {
    return pushLog(s, `${skill.name} is on cooldown.`, "system");
  }
  if (hero.hp <= 0) {
    return pushLog(s, `${HEROES[heroId].name} is down!`, "system");
  }

  s = pushLog(s, skill.line, "hero");

  let enemy = { ...s.enemy };
  let pepe = { ...party.pepe, cds: { ...party.pepe.cds } };
  let apu = { ...party.apu, cds: { ...party.apu.cds } };
  if (heroId === "pepe") pepe = hero;
  else apu = hero;

  const powerBoost = s.partyBased;
  const { dmg, crit } = dmgRoll(
    skill.power + powerBoost,
    hero.truth,
    hero.based,
    hero.luck,
  );

  if (skill.kind === "attack" || skill.kind === "ultimate") {
    const mitigated = Math.max(1, dmg - Math.floor(enemy.armor * 0.5));
    const shred =
      skill.id === "narrative_shred" || skill.id === "dual_truth_bomb"
        ? Math.round(mitigated * 1.3)
        : mitigated;
    enemy.hp = clamp(enemy.hp - shred, 0, enemy.maxHp);
    s = pushLog(
      s,
      `${HEROES[heroId].face} ${skill.name} hits for ${shred}${crit ? " CRITICAL TRUTH" : ""}!`,
      crit ? "crit" : "truth",
    );
    enemy.cope = Math.max(0, enemy.cope - 1);
  }

  if (skill.kind === "heal" || skill.id === "feels_good_buff") {
    const heal = 12 + Math.round(hero.truth * 0.8);
    pepe = { ...pepe, hp: clamp(pepe.hp + heal, 0, pepe.maxHp) };
    apu = { ...apu, hp: clamp(apu.hp + heal, 0, apu.maxHp) };
    s = { ...s, partyBased: s.partyBased + 4 };
    s = pushLog(s, `Party healed ~${heal}. Based aura rising.`, "hero");
  }

  if (skill.kind === "buff" || skill.id === "apu_accent_dodge") {
    s = { ...s, partyShield: s.partyShield + 10 + hero.luck };
    s = pushLog(s, `Polite shield +${10 + hero.luck}. Slander slides off.`, "hero");
  }

  if (skill.kind === "debuff") {
    enemy.armor = Math.max(0, enemy.armor - 3);
    enemy.attack = Math.max(4, enemy.attack - 2);
    if (skill.id === "apu_shopkeeper_haggle") {
      s = pushLog(s, "Apu marked down the enemy's grant armor.", "truth");
    } else {
      s = pushLog(s, "Enemy cope stacks shredded.", "truth");
    }
  }

  hero = {
    ...(heroId === "pepe" ? pepe : apu),
    cds: {
      ...(heroId === "pepe" ? pepe.cds : apu.cds),
      [skillId]: skill.cooldown > 0 ? skill.cooldown + 1 : 0,
    },
  };

  s.heroes = {
    pepe: heroId === "pepe" ? hero : pepe,
    apu: heroId === "apu" ? hero : apu,
  };
  s.enemy = enemy;

  if (enemy.hp <= 0) {
    s.over = true;
    s.victory = true;
    s = pushLog(
      s,
      `🏆 ${enemy.name} destroyed! The Fedslop narrative cracks.`,
      "truth",
    );
    return s;
  }

  // Enemy turn
  return enemyTurn(s);
}

export function basicAttack(state: CombatState, heroId: HeroId): CombatState {
  if (state.over) return state;
  const skillId: SkillId =
    heroId === "pepe" ? "rare_pepe_stare" : "apu_receipts";
  return useSkill(state, heroId, skillId);
}

function enemyTurn(state: CombatState): CombatState {
  const party = cloneParty(normalizeParty(state.heroes));
  let s: CombatState = { ...state, heroes: party };
  const enemy = s.enemy;
  const def = ENEMIES[enemy.defId] ?? ENEMIES.slop_gremlin;
  const line = def.lines[Math.floor(Math.random() * def.lines.length)]!;
  s = pushLog(s, `${enemy.face} ${enemy.name}: “${line}”`, "enemy");

  // Target weaker hero — never pick a missing/undefined slot
  const pepe = s.heroes.pepe;
  const apu = s.heroes.apu;
  const targetId: HeroId =
    pepe.hp <= 0 ? "apu" : apu.hp <= 0 ? "pepe" : pepe.hp <= apu.hp ? "pepe" : "apu";
  let target = { ...s.heroes[targetId], cds: { ...s.heroes[targetId].cds } };
  if (target.hp <= 0) {
    s.over = true;
    s.victory = false;
    return pushLog(s, "Both truth tellers down. Fedslop spreads… for now.", "enemy");
  }

  let dmg = enemy.attack + Math.floor(Math.random() * 6) + enemy.cope;
  if (s.partyShield > 0) {
    const absorb = Math.min(s.partyShield, dmg);
    dmg -= absorb;
    s = { ...s, partyShield: s.partyShield - absorb };
    s = pushLog(s, `Shield absorbed ${absorb} slop damage.`, "system");
  }
  // Based reduces damage
  dmg = Math.max(1, dmg - Math.floor(target.based * 0.25));
  target.hp = clamp(target.hp - dmg, 0, target.maxHp);
  s.heroes[targetId] = target;
  s = pushLog(
    s,
    `${enemy.name} hits ${HEROES[targetId].name} for ${dmg} narrative damage!`,
    "enemy",
  );

  // Tick CDs end of round
  s.heroes = {
    pepe: tickCooldowns(s.heroes.pepe),
    apu: tickCooldowns(s.heroes.apu),
  };
  s.turn += 1;
  s.activeHero = s.activeHero === "pepe" ? "apu" : "pepe";
  if (s.heroes.pepe.hp <= 0 && s.heroes.apu.hp <= 0) {
    s.over = true;
    s.victory = false;
    s = pushLog(s, "Defeat. Rest at the Note Church and try again.", "system");
  } else if (s.heroes[s.activeHero].hp <= 0) {
    s.activeHero = s.activeHero === "pepe" ? "apu" : "pepe";
  }
  // Decay party based
  s.partyBased = Math.max(0, s.partyBased - 1);
  return s;
}

export function combatRewards(state: CombatState): CombatRewards | null {
  if (!state.over || !state.victory) return null;
  const def = ENEMIES[state.enemy.defId];
  return {
    xp: def.xp,
    gold: def.gold,
    truthScore: 10 + Math.floor(def.xp / 4),
    loot: state.enemy.isBoss
      ? "Shredded Arch-Slop Manifesto"
      : "Confiscated Talking Points",
  };
}

export function applyCombatXp(
  heroes: Record<HeroId, HeroRuntime>,
  xp: number,
): Record<HeroId, HeroRuntime> {
  const party = normalizeParty(heroes);
  const half = Math.ceil(xp / 2);
  return {
    pepe: applyLevelUps({
      ...party.pepe,
      cds: { ...party.pepe.cds },
      xp: party.pepe.xp + half + (party.pepe.hp > 0 ? 4 : 0),
    }),
    apu: applyLevelUps({
      ...party.apu,
      cds: { ...party.apu.cds },
      xp: party.apu.xp + half + (party.apu.hp > 0 ? 4 : 0),
    }),
  };
}

export function restParty(
  heroes: Record<HeroId, HeroRuntime>,
): Record<HeroId, HeroRuntime> {
  const party = normalizeParty(heroes);
  return {
    pepe: {
      ...party.pepe,
      hp: party.pepe.maxHp,
      status: [],
      cds: {},
    },
    apu: {
      ...party.apu,
      hp: party.apu.maxHp,
      status: [],
      cds: {},
    },
  };
}
