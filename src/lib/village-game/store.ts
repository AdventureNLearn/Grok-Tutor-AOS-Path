/**
 * Full RPG store — PEPE & APU truth-teller campaign vs Fedslop.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  TOTAL_QUESTS,
  KENNY_DEATH_RATE,
  getQuest,
  getAllQuests,
  resolveQuestOutcome,
  buildingToLocation,
  type Quest,
  type QuestOutcome,
  type QuestLocationId,
} from "./quests";
import type { MiniGameResult } from "./minigames";
import {
  makeHeroRuntime,
  normalizeParty,
  type HeroId,
  type HeroRuntime,
  type SkillId,
  HEROES,
} from "./heroes";
import {
  startCombat,
  useSkill,
  basicAttack,
  combatRewards,
  applyCombatXp,
  restParty,
  type CombatState,
} from "./combat";
import { enemyForDifficulty, spawnEnemy } from "./enemies";
import { CHAPTERS, chapterForProgress, type Chapter } from "./story";

export type GamePhase =
  | "title"
  | "idle"
  | "briefing"
  | "minigame"
  | "choosing"
  | "outcome"
  | "combat"
  | "chapter"
  | "victory";

export type UiTab = "quest" | "party" | "story" | "inventory";

type VillageGameState = {
  // Campaign
  currentQuestId: number;
  completedIds: number[];
  chapterId: number;
  clearedChapters: number[];
  truthScore: number;
  gold: number;
  chaos: number;
  respect: number;
  kennyDeaths: number;
  kennySurvivals: number;
  loot: string[];
  inventory: string[];

  // Party
  heroes: Record<HeroId, HeroRuntime>;
  activeHeroId: HeroId;

  // Flow
  phase: GamePhase;
  uiTab: UiTab;
  activeQuestId: number | null;
  lastOutcome: QuestOutcome | null;
  lastMiniResult: MiniGameResult | null;
  targetLocationId: QuestLocationId | null;
  combat: CombatState | null;
  pendingCombat: boolean;
  history: { questId: number; kennyDied: boolean; title: string }[];
  totalQuests: number;
  kennyDeathRate: number;
  storyIntroSeen: boolean;

  // Derived
  completionPct: () => number;
  kennyDeathPct: () => number;
  activeQuest: () => Quest | null;
  currentChapter: () => Chapter;
  partyLevel: () => number;

  // Actions
  beginAdventure: () => void;
  setUiTab: (t: UiTab) => void;
  setActiveHero: (id: HeroId) => void;
  startQuest: (id?: number) => void;
  startQuestAtBuilding: (buildingId: string) => boolean;
  /** After reading the cold open / story */
  startMiniGame: () => void;
  completeMiniGame: (result: MiniGameResult) => void;
  choose: (choiceId: "a" | "b") => void;
  dismissOutcome: () => void;
  enterCombatFromOutcome: () => void;
  skipCombat: () => void;
  combatSkill: (skillId: SkillId) => void;
  combatBasic: () => void;
  finishCombat: () => void;
  restAtChurch: () => void;
  claimChapter: (chapterId: number) => void;
  startChapterBoss: (chapterId: number) => void;
  skipQuest: () => void;
  pickRandomIncomplete: () => void;
  resetGame: () => void;
};

function firstIncomplete(completed: number[]): number {
  const set = new Set(completed);
  for (let i = 1; i <= TOTAL_QUESTS; i++) {
    if (!set.has(i)) return i;
  }
  return TOTAL_QUESTS;
}

function randomIncomplete(completed: number[]): number {
  const set = new Set(completed);
  const pool: number[] = [];
  for (let i = 1; i <= TOTAL_QUESTS; i++) {
    if (!set.has(i)) pool.push(i);
  }
  if (pool.length === 0) return TOTAL_QUESTS;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

function freshHeroes(): Record<HeroId, HeroRuntime> {
  return normalizeParty({
    pepe: makeHeroRuntime("pepe", 1),
    apu: makeHeroRuntime("apu", 1),
  });
}

export const useVillageGameStore = create<VillageGameState>()(
  persist(
    (set, get) => ({
      currentQuestId: 1,
      completedIds: [],
      chapterId: 1,
      clearedChapters: [],
      truthScore: 0,
      gold: 20,
      chaos: 0,
      respect: 0,
      kennyDeaths: 0,
      kennySurvivals: 0,
      loot: [],
      inventory: ["Starter Receipt Binder", "Smug Sticker Pack"],
      heroes: freshHeroes(),
      activeHeroId: "pepe",
      phase: "title",
      uiTab: "quest",
      activeQuestId: null,
      lastOutcome: null,
      lastMiniResult: null,
      targetLocationId: null,
      combat: null,
      pendingCombat: false,
      history: [],
      totalQuests: TOTAL_QUESTS,
      kennyDeathRate: KENNY_DEATH_RATE,
      storyIntroSeen: false,

      completionPct() {
        return Math.round((get().completedIds.length / TOTAL_QUESTS) * 100);
      },
      kennyDeathPct() {
        const { kennyDeaths, kennySurvivals } = get();
        const n = kennyDeaths + kennySurvivals;
        if (n === 0) return Math.round(KENNY_DEATH_RATE * 100);
        return Math.round((kennyDeaths / n) * 100);
      },
      activeQuest() {
        const id = get().activeQuestId;
        return id ? getQuest(id) ?? null : null;
      },
      currentChapter() {
        return chapterForProgress(get().completedIds.length);
      },
      partyLevel() {
        const { pepe, apu } = normalizeParty(get().heroes);
        return Math.round((pepe.level + apu.level) / 2);
      },

      beginAdventure() {
        set({
          storyIntroSeen: true,
          phase: "briefing",
          uiTab: "quest",
          heroes: normalizeParty(get().heroes),
          activeHeroId:
            get().activeHeroId === "apu" || get().activeHeroId === "pepe"
              ? get().activeHeroId
              : "pepe",
        });
        get().startQuest(1);
      },

      setUiTab(t) {
        set({ uiTab: t });
      },
      setActiveHero(id) {
        if (id !== "pepe" && id !== "apu") return;
        set({
          activeHeroId: id,
          heroes: normalizeParty(get().heroes),
        });
      },

      startQuest(id) {
        const state = get();
        if (state.completedIds.length >= TOTAL_QUESTS) {
          set({ phase: "victory", activeQuestId: null, targetLocationId: null });
          return;
        }
        const qid = id ?? state.currentQuestId;
        if (state.completedIds.includes(qid)) {
          const next = firstIncomplete(state.completedIds);
          const nq = getQuest(next);
          if (!nq) {
            set({ phase: "victory" });
            return;
          }
          set({
            activeQuestId: next,
            currentQuestId: next,
            phase: "briefing",
            targetLocationId: nq.locationId,
            lastOutcome: null,
            lastMiniResult: null,
            pendingCombat: false,
            uiTab: "quest",
          });
          return;
        }
        const quest = getQuest(qid);
        if (!quest) return;
        set({
          activeQuestId: qid,
          currentQuestId: qid,
          phase: "briefing",
          targetLocationId: quest.locationId,
          lastOutcome: null,
          lastMiniResult: null,
          pendingCombat: false,
          uiTab: "quest",
        });
      },

      startQuestAtBuilding(buildingId) {
        const loc = buildingToLocation(buildingId);
        if (!loc) return false;
        if (get().phase === "title") get().beginAdventure();
        if (get().phase === "combat") return false;
        const completed = new Set(get().completedIds);
        const atLoc = getAllQuests().filter(
          (q) => q.locationId === loc && !completed.has(q.id),
        );
        if (atLoc.length === 0) {
          get().startQuest();
          return true;
        }
        const pick = atLoc[Math.floor(Math.random() * Math.min(5, atLoc.length))]!;
        get().startQuest(pick.id);
        return true;
      },

      startMiniGame() {
        if (!get().activeQuest()) return;
        if (get().phase !== "briefing" && get().phase !== "choosing") return;
        set({ phase: "minigame", uiTab: "quest" });
      },

      completeMiniGame(result) {
        set({
          lastMiniResult: result,
          phase: "choosing",
        });
      },

      choose(choiceId) {
        const quest = get().activeQuest();
        if (!quest || get().phase !== "choosing") return;
        // Require mini-game first
        if (!get().lastMiniResult) {
          set({ phase: "minigame" });
          return;
        }
        const outcome = resolveQuestOutcome(
          quest,
          choiceId,
          get().lastMiniResult,
        );
        const completedIds = get().completedIds.includes(quest.id)
          ? get().completedIds
          : [...get().completedIds, quest.id];
        const nextId = firstIncomplete(completedIds);
        const loot = [...get().loot, outcome.loot].slice(-50);
        const inventory = [...get().inventory, outcome.loot].slice(-60);

        const heroes = applyCombatXp(
          normalizeParty(get().heroes),
          Math.ceil(outcome.xp / 2),
        );
        const ch = chapterForProgress(completedIds.length);

        set({
          lastOutcome: outcome,
          phase: "outcome",
          completedIds,
          currentQuestId: nextId,
          chapterId: ch.id,
          truthScore: get().truthScore + outcome.truthScore,
          gold: get().gold + outcome.gold,
          chaos: get().chaos + outcome.chaos,
          respect: get().respect + outcome.respect,
          kennyDeaths: get().kennyDeaths + (outcome.kennyDied ? 1 : 0),
          kennySurvivals: get().kennySurvivals + (outcome.kennyDied ? 0 : 1),
          loot,
          inventory,
          heroes,
          history: [
            {
              questId: quest.id,
              kennyDied: outcome.kennyDied,
              title: quest.title,
            },
            ...get().history,
          ].slice(0, 50),
          targetLocationId: null,
          pendingCombat: Math.random() < outcome.combatChance,
          lastMiniResult: null,
        });
      },

      dismissOutcome() {
        const { completedIds, pendingCombat, lastOutcome } = get();
        if (completedIds.length >= TOTAL_QUESTS && !pendingCombat) {
          set({
            phase: "victory",
            activeQuestId: null,
            lastOutcome: null,
            pendingCombat: false,
          });
          return;
        }
        if (pendingCombat && lastOutcome) {
          get().enterCombatFromOutcome();
          return;
        }
        // Highest chapter threshold reached but not yet claimed
        const claimable = [...CHAPTERS]
          .reverse()
          .find(
            (c) =>
              completedIds.length >= c.questsRequired &&
              !get().clearedChapters.includes(c.id),
          );
        if (claimable) {
          set({
            phase: "chapter",
            lastOutcome: null,
            pendingCombat: false,
            uiTab: "story",
            chapterId: claimable.id,
          });
          return;
        }
        const ch = chapterForProgress(completedIds.length);
        const next = firstIncomplete(completedIds);
        const quest = getQuest(next);
        set({
          phase: quest ? "briefing" : "victory",
          activeQuestId: quest?.id ?? null,
          currentQuestId: next,
          targetLocationId: quest?.locationId ?? null,
          lastOutcome: null,
          lastMiniResult: null,
          pendingCombat: false,
          chapterId: ch.id,
        });
      },

      enterCombatFromOutcome() {
        const quest = get().activeQuest() ?? getQuest(get().lastOutcome?.questId ?? 1);
        const difficulty = quest?.difficulty ?? 2;
        const chapter = get().currentChapter();
        const enemyId = enemyForDifficulty(difficulty, chapter.id, false);
        const scale = 1 + (chapter.id - 1) * 0.08 + (get().partyLevel() - 1) * 0.03;
        const heroes = normalizeParty(get().heroes);
        const combat = startCombat({
          pepe: heroes.pepe,
          apu: heroes.apu,
          enemy: spawnEnemy(enemyId, scale),
          questId: quest?.id ?? null,
          opener: `⚔️ Fedslop ambush! ${HEROES.pepe.name} & ${HEROES.apu.name} engage!`,
        });
        set({
          heroes,
          combat,
          phase: "combat",
          pendingCombat: false,
          lastOutcome: null,
          uiTab: "quest",
        });
      },

      skipCombat() {
        set({ pendingCombat: false });
        get().dismissOutcome();
      },

      combatSkill(skillId) {
        const c = get().combat;
        if (!c || c.over) return;
        const heroId =
          get().activeHeroId === "apu" || get().activeHeroId === "pepe"
            ? get().activeHeroId
            : "pepe";
        const next = useSkill(
          { ...c, heroes: normalizeParty(c.heroes) },
          heroId,
          skillId,
        );
        set({
          combat: next,
          heroes: normalizeParty(next.heroes),
          activeHeroId: heroId,
        });
      },

      combatBasic() {
        const c = get().combat;
        if (!c || c.over) return;
        const heroId =
          get().activeHeroId === "apu" || get().activeHeroId === "pepe"
            ? get().activeHeroId
            : "pepe";
        const next = basicAttack(
          { ...c, heroes: normalizeParty(c.heroes) },
          heroId,
        );
        set({
          combat: next,
          heroes: normalizeParty(next.heroes),
          activeHeroId: heroId,
        });
      },

      finishCombat() {
        const c = get().combat;
        if (!c || !c.over) return;
        if (c.victory) {
          const rewards = combatRewards(c);
          const heroes = applyCombatXp(
            normalizeParty(c.heroes),
            rewards?.xp ?? 20,
          );
          set({
            heroes,
            gold: get().gold + (rewards?.gold ?? 0),
            truthScore: get().truthScore + (rewards?.truthScore ?? 0),
            loot: rewards
              ? [...get().loot, rewards.loot].slice(-50)
              : get().loot,
            inventory: rewards
              ? [...get().inventory, rewards.loot].slice(-60)
              : get().inventory,
          });
        } else {
          set({ heroes: restParty(normalizeParty(get().heroes)) });
        }

        const completedIds = get().completedIds;
        if (completedIds.length >= TOTAL_QUESTS) {
          set({ phase: "victory", activeQuestId: null, combat: null });
          return;
        }
        const next = firstIncomplete(completedIds);
        const quest = getQuest(next);
        set({
          phase: quest ? "briefing" : "victory",
          activeQuestId: quest?.id ?? null,
          currentQuestId: next,
          targetLocationId: quest?.locationId ?? null,
          combat: null,
          lastMiniResult: null,
        });
      },

      restAtChurch() {
        if (get().gold < 5) return;
        set({
          gold: get().gold - 5,
          heroes: restParty(normalizeParty(get().heroes)),
        });
      },

      claimChapter(chapterId) {
        const ch = CHAPTERS.find((c) => c.id === chapterId);
        if (!ch) return;
        if (get().clearedChapters.includes(chapterId)) return;
        if (get().completedIds.length < ch.questsRequired) return;
        set({
          clearedChapters: [...get().clearedChapters, chapterId],
          gold: get().gold + ch.rewardGold,
          truthScore: get().truthScore + ch.rewardTruth,
          inventory: [
            ...get().inventory,
            `Chapter ${chapterId} Trophy: ${ch.title}`,
          ].slice(-60),
        });
        if (ch.bossId) {
          get().startChapterBoss(chapterId);
        } else {
          get().startQuest();
        }
      },

      startChapterBoss(chapterId) {
        const ch = CHAPTERS.find((c) => c.id === chapterId);
        if (!ch?.bossId) {
          get().startQuest();
          return;
        }
        const scale = 1 + chapterId * 0.12;
        const heroes = normalizeParty(get().heroes);
        const combat = startCombat({
          pepe: heroes.pepe,
          apu: heroes.apu,
          enemy: spawnEnemy(ch.bossId, scale),
          chapterId,
          opener: `🔥 CHAPTER BOSS — ${ch.title}: ${ch.bossId.toUpperCase()}`,
        });
        set({ heroes, combat, phase: "combat", uiTab: "quest" });
      },

      skipQuest() {
        const id = get().activeQuestId ?? get().currentQuestId;
        const completed = new Set(get().completedIds);
        let qid = id >= TOTAL_QUESTS ? 1 : id + 1;
        for (let i = 0; i < TOTAL_QUESTS; i++) {
          const tryId = ((qid - 1 + i) % TOTAL_QUESTS) + 1;
          if (!completed.has(tryId)) {
            qid = tryId;
            break;
          }
        }
        get().startQuest(qid);
      },

      pickRandomIncomplete() {
        get().startQuest(randomIncomplete(get().completedIds));
      },

      resetGame() {
        set({
          currentQuestId: 1,
          completedIds: [],
          chapterId: 1,
          clearedChapters: [],
          truthScore: 0,
          gold: 20,
          chaos: 0,
          respect: 0,
          kennyDeaths: 0,
          kennySurvivals: 0,
          loot: [],
          inventory: ["Starter Receipt Binder", "Smug Sticker Pack"],
          heroes: freshHeroes(),
          activeHeroId: "pepe",
          phase: "title",
          uiTab: "quest",
          activeQuestId: null,
          lastOutcome: null,
          lastMiniResult: null,
          targetLocationId: null,
          combat: null,
          pendingCombat: false,
          history: [],
          storyIntroSeen: false,
        });
      },
    }),
    {
      name: "sp-village-rpg-v3",
      version: 2,
      partialize: (s) => ({
        currentQuestId: s.currentQuestId,
        completedIds: s.completedIds,
        chapterId: s.chapterId,
        clearedChapters: s.clearedChapters,
        truthScore: s.truthScore,
        gold: s.gold,
        chaos: s.chaos,
        respect: s.respect,
        kennyDeaths: s.kennyDeaths,
        kennySurvivals: s.kennySurvivals,
        loot: s.loot,
        inventory: s.inventory,
        heroes: normalizeParty(s.heroes),
        activeHeroId:
          s.activeHeroId === "apu" || s.activeHeroId === "pepe"
            ? s.activeHeroId
            : "pepe",
        history: s.history,
        storyIntroSeen: s.storyIntroSeen,
      }),
      migrate: (persisted) => {
        const p = (persisted ?? {}) as Record<string, unknown>;
        const heroes = normalizeParty(
          p.heroes as Parameters<typeof normalizeParty>[0],
        );
        return {
          ...p,
          heroes,
          activeHeroId:
            p.activeHeroId === "apu" || p.activeHeroId === "pepe"
              ? p.activeHeroId
              : "pepe",
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.heroes = normalizeParty(state.heroes);
        if (state.activeHeroId !== "pepe" && state.activeHeroId !== "apu") {
          state.activeHeroId = "pepe";
        }
        if (state.storyIntroSeen && state.phase === "title") {
          state.phase = "briefing";
        }
        // Never resume stuck in broken combat without heroes
        if (state.phase === "combat" && !state.combat) {
          state.phase = "briefing";
        }
      },
    },
  ),
);
