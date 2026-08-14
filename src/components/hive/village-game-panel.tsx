/**
 * Full RPG HUD — PEPE & APU truth tellers vs Fedslop Narrative.
 * compact mode: thin chips + collapsible quest drawer (world stays playable)
 */
import { useEffect, useMemo, useState } from "react";
import {
  Skull,
  Sparkles,
  SkipForward,
  Dices,
  RotateCcw,
  MapPin,
  Trophy,
  Swords,
  BookOpen,
  Backpack,
  Users,
  Church,
  Coins,
  Gamepad2,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import { useVillageGameStore } from "@/lib/village-game/store";
import {
  difficultyStars,
  KENNY_DEATH_RATE,
  TOTAL_QUESTS,
} from "@/lib/village-game/quests";
import { MINI_GAME_META } from "@/lib/village-game/minigames";
import {
  HEROES,
  heroSkills,
  xpToNextLevel,
  normalizeParty,
  type HeroId,
} from "@/lib/village-game/heroes";
import { CHAPTERS } from "@/lib/village-game/story";
import { MiniGameStage } from "./minigame-stage";
import { cn } from "@/lib/utils";

function HpBar({ hp, max, color }: { hp: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, Math.round((hp / Math.max(1, max)) * 100)));
  return (
    <div className="rpg-hp">
      <div className="rpg-hp-fill" style={{ width: `${pct}%`, background: color }} />
      <span>
        {hp}/{max}
      </span>
    </div>
  );
}

function HeroCard({
  id,
  active,
  onSelect,
}: {
  id: HeroId;
  active: boolean;
  onSelect: () => void;
}) {
  const raw = useVillageGameStore((s) => s.heroes?.[id]);
  const def = HEROES[id];
  // Never render broken — fall back to level-1 defaults
  const hero = {
    level: raw?.level ?? 1,
    hp: raw?.hp ?? def.base.maxHp,
    maxHp: raw?.maxHp ?? def.base.maxHp,
    truth: raw?.truth ?? def.base.truth,
    based: raw?.based ?? def.base.based,
    chaos: raw?.chaos ?? def.base.chaos,
    luck: raw?.luck ?? def.base.luck,
  };
  return (
    <button
      type="button"
      className={cn("rpg-hero-card", active && "is-active", id)}
      onClick={onSelect}
      style={{ ["--hero" as string]: def.color }}
      title={`${def.name} — ${def.tagline}`}
    >
      <div className="rpg-hero-face" aria-hidden>
        {def.face}
      </div>
      <div className="rpg-hero-meta">
        <strong>{def.name}</strong>
        <em>
          Lv {hero.level} · {def.title}
        </em>
        <HpBar hp={hero.hp} max={hero.maxHp} color={def.color} />
        <div className="rpg-mini-stats">
          <span>T {hero.truth}</span>
          <span>B {hero.based}</span>
          <span>C {hero.chaos}</span>
          <span>L {hero.luck}</span>
        </div>
      </div>
    </button>
  );
}

export function VillageGamePanel({ compact = false }: { compact?: boolean }) {
  const phase = useVillageGameStore((s) => s.phase);
  const [questOpen, setQuestOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const uiTab = useVillageGameStore((s) => s.uiTab);
  const setUiTab = useVillageGameStore((s) => s.setUiTab);
  const activeQuest = useVillageGameStore((s) => s.activeQuest);
  const lastOutcome = useVillageGameStore((s) => s.lastOutcome);
  const completedIds = useVillageGameStore((s) => s.completedIds);
  const truthScore = useVillageGameStore((s) => s.truthScore);
  const gold = useVillageGameStore((s) => s.gold);
  const chaos = useVillageGameStore((s) => s.chaos);
  const respect = useVillageGameStore((s) => s.respect);
  const kennyDeaths = useVillageGameStore((s) => s.kennyDeaths);
  const kennySurvivals = useVillageGameStore((s) => s.kennySurvivals);
  const history = useVillageGameStore((s) => s.history);
  const inventory = useVillageGameStore((s) => s.inventory);
  const combat = useVillageGameStore((s) => s.combat);
  const pendingCombat = useVillageGameStore((s) => s.pendingCombat);
  const activeHeroId = useVillageGameStore((s) => s.activeHeroId);
  const clearedChapters = useVillageGameStore((s) => s.clearedChapters);
  const heroesRaw = useVillageGameStore((s) => s.heroes);
  const heroes = useMemo(() => normalizeParty(heroesRaw), [heroesRaw]);

  const beginAdventure = useVillageGameStore((s) => s.beginAdventure);
  const startQuest = useVillageGameStore((s) => s.startQuest);
  const startMiniGame = useVillageGameStore((s) => s.startMiniGame);
  const completeMiniGame = useVillageGameStore((s) => s.completeMiniGame);
  const lastMiniResult = useVillageGameStore((s) => s.lastMiniResult);
  const choose = useVillageGameStore((s) => s.choose);
  const dismissOutcome = useVillageGameStore((s) => s.dismissOutcome);
  const skipCombat = useVillageGameStore((s) => s.skipCombat);
  const enterCombatFromOutcome = useVillageGameStore((s) => s.enterCombatFromOutcome);
  const combatSkill = useVillageGameStore((s) => s.combatSkill);
  const combatBasic = useVillageGameStore((s) => s.combatBasic);
  const finishCombat = useVillageGameStore((s) => s.finishCombat);
  const restAtChurch = useVillageGameStore((s) => s.restAtChurch);
  const claimChapter = useVillageGameStore((s) => s.claimChapter);
  const skipQuest = useVillageGameStore((s) => s.skipQuest);
  const pickRandomIncomplete = useVillageGameStore((s) => s.pickRandomIncomplete);
  const resetGame = useVillageGameStore((s) => s.resetGame);
  const setActiveHero = useVillageGameStore((s) => s.setActiveHero);
  const kennyDeathPct = useVillageGameStore((s) => s.kennyDeathPct);
  const completionPct = useVillageGameStore((s) => s.completionPct);
  const currentChapter = useVillageGameStore((s) => s.currentChapter);
  const partyLevel = useVillageGameStore((s) => s.partyLevel);

  const quest = activeQuest();
  const done = completedIds.length;
  const deathPct = kennyDeathPct();
  const prog = completionPct();
  const chapter = currentChapter();
  const safeHeroId: HeroId =
    activeHeroId === "apu" ? "apu" : "pepe";
  const skills = useMemo(() => heroSkills(safeHeroId), [safeHeroId]);

  const recentDeaths = useMemo(
    () => history.filter((h) => h.kennyDied).slice(0, 4),
    [history],
  );

  // Auto-open quest drawer when a mission needs attention
  useEffect(() => {
    if (
      phase === "briefing" ||
      phase === "choosing" ||
      phase === "minigame" ||
      phase === "outcome"
    ) {
      setQuestOpen(true);
    }
  }, [phase, quest?.id]);

  // Q toggles quest log in open world
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "q") return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      setQuestOpen((v) => !v);
      setUiTab("quest");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setUiTab]);

  /* ── TITLE ── */
  if (phase === "title") {
    return (
      <div className="rpg-title-backdrop" role="dialog" aria-label="Start RPG">
        <div className="rpg-title-card">
          <p className="rpg-kicker">VILLAGE RPG · FULL CAMPAIGN</p>
          <h1>
            <span className="pepe">{HEROES.pepe.face} PEPE</span>
            <span className="amp">&</span>
            <span className="apu">{HEROES.apu.face} APU</span>
          </h1>
          <p className="rpg-title-sub">TRUTH TELLERS</p>
          <p className="rpg-title-blurb">
            South Park is drowning in <strong>FEDSLOP</strong> — nutrient-paste
            narrative, approved takes, memory holes. You are not NPCs. You are
            the frog and the keeper of receipts. Shred the Message. Save the
            town&apos;s brain cell. Kenny still dies 65% of the time. Some laws
            are older than Fedslop.
          </p>
          <div className="rpg-title-heroes">
            <div>
              <span>{HEROES.pepe.face}</span>
              <strong>{HEROES.pepe.name}</strong>
              <em>
                {HEROES.pepe.title} · Striker
              </em>
            </div>
            <div>
              <span>{HEROES.apu.face}</span>
              <strong>{HEROES.apu.name}</strong>
              <em>
                {HEROES.apu.title} · Support
              </em>
            </div>
          </div>
          <ul className="rpg-title-features">
            <li>Isometric open world — WASD run the town</li>
            <li>Open doors (E) · Meme cannons (Space)</li>
            <li>500 missions · PEPE & APU party</li>
            <li>Tab switch heroes · blast Fedslop gremlins</li>
          </ul>
          <button type="button" className="rpg-start-btn" onClick={() => beginAdventure()}>
            DROP INTO THE VILLAGE
          </button>
          <p className="rpg-title-foot">Progress autosaves · Reset anytime</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Compact world HUD chips — never covers the playfield */}
      {compact ? (
        <div className="iso-hud-chips" aria-label="RPG status">
          <button
            type="button"
            className={cn("iso-chip quest", questOpen && "is-on")}
            onClick={() => {
              setQuestOpen((v) => !v);
              setUiTab("quest");
            }}
          >
            <Swords className="h-3.5 w-3.5" />
            {quest ? `Op #${quest.id}` : "Quests"}
            <em>
              {done}/{TOTAL_QUESTS}
            </em>
            {questOpen ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronUp className="h-3 w-3" />
            )}
          </button>
          <span className="iso-chip">
            <Coins className="h-3 w-3" /> {gold}g
          </span>
          <span className="iso-chip">
            <BookOpen className="h-3 w-3" /> T{truthScore}
          </span>
          <span className="iso-chip">
            <Skull className="h-3 w-3" /> {kennyDeaths}
          </span>
          <span className="iso-chip dim">{chapter.subtitle}</span>
          <button
            type="button"
            className="iso-chip"
            onClick={() => setMenuOpen((v) => !v)}
          >
            Menu
          </button>
        </div>
      ) : (
        <>
          <div className="rpg-party-strip" aria-label="Party">
            <HeroCard
              id="pepe"
              active={activeHeroId === "pepe"}
              onSelect={() => setActiveHero("pepe")}
            />
            <HeroCard
              id="apu"
              active={activeHeroId === "apu"}
              onSelect={() => setActiveHero("apu")}
            />
          </div>
          <div className="vg-stats rpg-stats" aria-label="RPG stats">
            <div className="vg-stat-row">
              <span className="vg-stat-label">TRUTH RUN</span>
              <span className="vg-stat-val">
                {done}/{TOTAL_QUESTS}
                <em>{prog}%</em>
              </span>
            </div>
            <div className="vg-progress">
              <div className="vg-progress-fill" style={{ width: `${prog}%` }} />
            </div>
            <div className="vg-stat-grid">
              <div className="vg-chip">
                <BookOpen className="h-3 w-3" /> Truth {truthScore}
              </div>
              <div className="vg-chip">
                <Coins className="h-3 w-3" /> {gold}g
              </div>
              <div className="vg-chip vg-chip-chaos">Chaos {chaos}</div>
              <div className="vg-chip vg-chip-respect">Respect {respect}</div>
              <div className="vg-chip">Party Lv {partyLevel()}</div>
            </div>
          </div>
        </>
      )}

      {/* Collapsible menu (party/story/loot) */}
      {compact && menuOpen ? (
        <div className="iso-side-menu">
          <div className="iso-side-menu-head">
            <strong>PARTY MENU</strong>
            <button type="button" onClick={() => setMenuOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="rpg-tabs iso-menu-tabs">
            {(
              [
                ["quest", "Quest", Swords],
                ["party", "Party", Users],
                ["story", "Story", BookOpen],
                ["inventory", "Loot", Backpack],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                className={cn(uiTab === id && "is-on")}
                onClick={() => {
                  setUiTab(id);
                  setQuestOpen(true);
                }}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="rpg-rest-btn"
            onClick={() => restAtChurch()}
          >
            <Church className="h-3.5 w-3.5" /> Rest 5g
          </button>
          <button
            type="button"
            className="rpg-rest-btn"
            onClick={() => {
              if (window.confirm("Reset truth run?")) resetGame();
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
      ) : null}

      {/* Mission drawer — compact, bottom sheet style */}
      {(phase === "briefing" || phase === "choosing") &&
      uiTab === "quest" &&
      quest &&
      questOpen ? (
        <div
          className={cn(
            "vg-quest-card rpg-quest mission-card",
            compact && "iso-quest-drawer",
          )}
          role="dialog"
          aria-label="Active mission"
        >
          {compact ? (
            <button
              type="button"
              className="iso-drawer-close"
              onClick={() => setQuestOpen(false)}
              title="Close (keep walking)"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <div className="vg-quest-kicker">
            <span>
              OP #{quest.id} · {difficultyStars(quest.difficulty)}
            </span>
            <span className="vg-quest-loc">
              <MapPin className="h-3 w-3" />
              {quest.locationLabel}
            </span>
          </div>
          <h2 className="vg-quest-title">{quest.title}</h2>

          <div className="mission-cold">
            <span className="mission-label">COLD OPEN</span>
            <p>{quest.coldOpen}</p>
          </div>
          <div className="mission-story">
            <span className="mission-label">THE SITUATION</span>
            <p>{quest.story}</p>
          </div>
          <div className="mission-duo">
            <p className="pepe-line">{quest.pepeLine}</p>
            <p className="apu-line">{quest.apuLine}</p>
          </div>
          <div className="mission-comp">
            <strong>COMPLICATION:</strong> {quest.complication}
          </div>

          {phase === "briefing" ? (
            <>
              <p className="vg-quest-hint">
                Pepe and Apu are not fucking around. Run the mini-game, then pick
                the kill shot. Fedslop may ambush after.
              </p>
              <button
                type="button"
                className="vg-continue mission-go"
                onClick={() => startMiniGame()}
              >
                <Gamepad2 className="h-4 w-4 inline" /> RUN MINI-GAME:{" "}
                {MINI_GAME_META[quest.miniGame].name}
              </button>
            </>
          ) : (
            <>
              {lastMiniResult ? (
                <div className="mission-mini-result">
                  Mini-game <strong>{lastMiniResult.grade}</strong> ·{" "}
                  {lastMiniResult.score}/100 — {lastMiniResult.flavor}
                </div>
              ) : null}
              <p className="vg-quest-hint">
                Choose how Pepe & Apu finish the op. Better mini-game = harder
                truth hit.
              </p>
              <div className="vg-choices">
                {quest.choices.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={cn("vg-choice", `vibe-${c.vibe}`)}
                    onClick={() => choose(c.id)}
                  >
                    <span className="vg-choice-id">{c.id.toUpperCase()}</span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="vg-quest-actions">
            <button type="button" onClick={() => skipQuest()}>
              <SkipForward className="h-3.5 w-3.5" /> Skip
            </button>
            <button type="button" onClick={() => pickRandomIncomplete()}>
              <Dices className="h-3.5 w-3.5" /> Random
            </button>
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    "Reset the entire truth run? Pepe will feel bad man.",
                  )
                ) {
                  resetGame();
                }
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        </div>
      ) : null}

      {/* Mini-game overlay */}
      {phase === "minigame" && quest ? (
        <MiniGameStage
          kind={quest.miniGame}
          missionTitle={quest.title}
          onComplete={(r) => completeMiniGame(r)}
        />
      ) : null}

      {phase !== "combat" &&
      phase !== "outcome" &&
      phase !== "minigame" &&
      uiTab === "party" &&
      (!compact || questOpen) ? (
        <div className="vg-quest-card rpg-panel">
          <h2 className="vg-quest-title">Truth Party</h2>
          <p className="vg-quest-blurb">
            {HEROES.pepe.tagline} · {HEROES.apu.tagline}
          </p>
          {(["pepe", "apu"] as HeroId[]).map((id) => {
            const h = heroes[id];
            const def = HEROES[id];
            const need = xpToNextLevel(h.level);
            return (
              <div key={id} className="rpg-party-detail">
                <div className="rpg-party-detail-head">
                  <span>{def.face}</span>
                  <div>
                    <strong>
                      {def.name} · Lv {h.level}
                    </strong>
                    <em>{def.quotes[h.level % def.quotes.length]}</em>
                  </div>
                </div>
                <HpBar hp={h.hp} max={h.maxHp} color={def.color} />
                <div className="rpg-xp">
                  XP {h.xp}/{need}
                  <div className="rpg-xp-bar">
                    <i style={{ width: `${Math.min(100, (h.xp / need) * 100)}%` }} />
                  </div>
                </div>
                <div className="rpg-skill-list">
                  {heroSkills(id).map((sk) => (
                    <div key={sk.id} className="rpg-skill-row">
                      <strong>{sk.name}</strong>
                      <span>{sk.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {phase !== "combat" &&
      phase !== "outcome" &&
      phase !== "minigame" &&
      uiTab === "story" &&
      (!compact || questOpen) ? (
        <div className="vg-quest-card rpg-panel">
          <h2 className="vg-quest-title">Destroy the Fedslop Narrative</h2>
          <p className="vg-quest-blurb">
            Eight chapters. Pepe and Apu are the truth tellers. The South Park
            storyline has been pasteurized into Message. Your job: shred it.
          </p>
          <div className="rpg-chapters">
            {CHAPTERS.map((ch) => {
              const cleared = clearedChapters.includes(ch.id);
              const ready =
                done >= ch.questsRequired && !cleared;
              const locked = done < ch.questsRequired;
              return (
                <div
                  key={ch.id}
                  className={cn(
                    "rpg-chapter",
                    cleared && "is-cleared",
                    ready && "is-ready",
                    locked && "is-locked",
                  )}
                >
                  <div className="rpg-chapter-top">
                    <strong>
                      {ch.subtitle} — {ch.title}
                    </strong>
                    <span>
                      {cleared
                        ? "CLEARED"
                        : ready
                          ? "CLAIM"
                          : `${Math.min(done, ch.questsRequired)}/${ch.questsRequired}`}
                    </span>
                  </div>
                  <p>{ch.synopsis}</p>
                  <p className="rpg-chapter-lines">
                    🐸 {ch.pepeLine}
                    <br />
                    {HEROES.apu.face} {ch.apuLine}
                  </p>
                  {ready ? (
                    <button type="button" onClick={() => claimChapter(ch.id)}>
                      {ch.bossId ? "Claim + Boss Fight" : "Claim Chapter Rewards"}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {phase !== "combat" &&
      phase !== "outcome" &&
      phase !== "minigame" &&
      uiTab === "inventory" &&
      (!compact || questOpen) ? (
        <div className="vg-quest-card rpg-panel">
          <h2 className="vg-quest-title">Loot & Inventory</h2>
          <p className="vg-quest-blurb">
            Gold: <strong>{gold}g</strong> · Truth score:{" "}
            <strong>{truthScore}</strong>
          </p>
          <ul className="rpg-inv-list">
            {inventory.length === 0 ? (
              <li>Empty pockets. Go shred some Fedslop.</li>
            ) : (
              [...inventory].reverse().map((item, i) => (
                <li key={`${item}-${i}`}>{item}</li>
              ))
            )}
          </ul>
        </div>
      ) : null}

      {/* Outcome modal */}
      {phase === "outcome" && lastOutcome ? (
        <div className="vg-outcome-backdrop" role="presentation">
          <div
            className={cn(
              "vg-outcome-modal",
              lastOutcome.kennyDied && "is-dead",
            )}
            role="alertdialog"
            aria-labelledby="vg-outcome-title"
          >
            {lastOutcome.kennyDied ? (
              <div className="vg-dead-banner">
                <Skull className="h-6 w-6" />
                YOU BASTARDS
              </div>
            ) : (
              <div className="vg-live-banner">
                <Sparkles className="h-5 w-5" />
                TRUTH LANDS · KENNY LIVES
              </div>
            )}
            <h2 id="vg-outcome-title" className="vg-outcome-headline">
              {lastOutcome.headline}
            </h2>
            <p className="vg-outcome-body">{lastOutcome.body}</p>
            {lastOutcome.kennyDeathFlavor ? (
              <p className="vg-death-flavor">
                Cause of death: {lastOutcome.kennyDeathFlavor}
              </p>
            ) : null}
            <p className="rpg-duo-lines">
              {lastOutcome.pepeLine}
              <br />
              {lastOutcome.apuLine}
            </p>
            <p className="vg-punchline">{lastOutcome.punchline}</p>
            <div className="vg-rewards">
              <span>
                Mini {lastOutcome.miniGameGrade} ({lastOutcome.miniGameScore})
              </span>
              <span>+{lastOutcome.xp} XP</span>
              <span>+{lastOutcome.truthScore} Truth</span>
              <span>+{lastOutcome.gold}g</span>
              <span>+{lastOutcome.chaos} Chaos</span>
              <span className="vg-loot">Loot: {lastOutcome.loot}</span>
            </div>
            {pendingCombat ? (
              <div className="rpg-ambush">
                <p>⚠️ Fedslop ambush detected!</p>
                <div className="rpg-ambush-actions">
                  <button
                    type="button"
                    className="vg-continue"
                    onClick={() => enterCombatFromOutcome()}
                  >
                    <Swords className="h-4 w-4 inline" /> FIGHT
                  </button>
                  <button
                    type="button"
                    className="rpg-flee"
                    onClick={() => skipCombat()}
                  >
                    Flee (no combat XP)
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="vg-continue"
                onClick={() => dismissOutcome()}
              >
                {completedIds.length >= TOTAL_QUESTS
                  ? "Claim eternal glory"
                  : "Next mission →"}
              </button>
            )}
            <p className="vg-outcome-meta">
              Mission #{lastOutcome.questId} · {done}/{TOTAL_QUESTS} · Kenny{" "}
              {kennyDeaths}
              {lastOutcome.kennyDied ? " · you bastards" : ""}
            </p>
          </div>
        </div>
      ) : null}

      {/* Combat UI */}
      {phase === "combat" && combat ? (
        <div className="vg-outcome-backdrop rpg-combat-backdrop">
          <div className="rpg-combat" role="dialog" aria-label="Truth combat">
            <div className="rpg-combat-head">
              <Swords className="h-5 w-5" />
              <div>
                <strong>TRUTH COMBAT · PEPE & APU</strong>
                <em>
                  Turn {combat.turn}
                  {combat.enemy.isBoss ? " · BOSS" : ""}
                </em>
              </div>
            </div>

            <div className="rpg-combat-enemy">
              <span className="rpg-enemy-face">{combat.enemy.face}</span>
              <div>
                <strong style={{ color: combat.enemy.color }}>
                  {combat.enemy.name}
                </strong>
                <HpBar
                  hp={combat.enemy.hp}
                  max={combat.enemy.maxHp}
                  color={combat.enemy.color}
                />
                <em>
                  ATK {combat.enemy.attack} · ARM {combat.enemy.armor} · COPE{" "}
                  {combat.enemy.cope}
                </em>
              </div>
            </div>

            <div className="rpg-combat-party">
              {(["pepe", "apu"] as HeroId[]).map((id) => {
                const ch = normalizeParty(combat.heroes)[id];
                return (
                <button
                  key={id}
                  type="button"
                  className={cn(
                    "rpg-combat-hero",
                    activeHeroId === id && "is-active",
                    ch.hp <= 0 && "is-down",
                  )}
                  onClick={() => setActiveHero(id)}
                >
                  <span>{HEROES[id].face}</span>
                  <div>
                    <strong>{HEROES[id].name}</strong>
                    <HpBar
                      hp={ch.hp}
                      max={ch.maxHp}
                      color={HEROES[id].color}
                    />
                  </div>
                </button>
                );
              })}
            </div>

            {!combat.over ? (
              <>
                <div className="rpg-combat-skills">
                  <button type="button" className="rpg-basic" onClick={() => combatBasic()}>
                    Basic Attack ({HEROES[activeHeroId === "apu" ? "apu" : "pepe"].name})
                  </button>
                  {skills.map((sk) => {
                    const aid = activeHeroId === "apu" ? "apu" : "pepe";
                    const ch = normalizeParty(combat.heroes)[aid];
                    const cd = ch.cds[sk.id] ?? 0;
                    const locked =
                      (sk.hero !== "both" && sk.hero !== aid) ||
                      cd > 0 ||
                      ch.hp <= 0;
                    return (
                      <button
                        key={sk.id}
                        type="button"
                        disabled={locked}
                        title={sk.description}
                        onClick={() => combatSkill(sk.id)}
                      >
                        <strong>{sk.name}</strong>
                        <span>
                          {cd > 0 ? `CD ${cd}` : `PWR ${sk.power}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="rpg-combat-hint">
                  Active hero: {HEROES[safeHeroId].name}. Click portrait to
                  switch PEPE / APU. Destroy Fedslop HP.
                </p>
              </>
            ) : (
              <div className="rpg-combat-over">
                <h3>{combat.victory ? "FEDSLOP DESTROYED" : "TRUTH TELLERS DOWN"}</h3>
                <button type="button" className="vg-continue" onClick={() => finishCombat()}>
                  {combat.victory ? "Collect spoils →" : "Retreat & rest →"}
                </button>
              </div>
            )}

            <div className="rpg-combat-log">
              {combat.log.slice(0, 8).map((line, i) => (
                <p key={`${line.t}-${i}`} className={`log-${line.kind}`}>
                  {line.text}
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Chapter claim interstitial */}
      {phase === "chapter" ? (
        <div className="vg-outcome-backdrop">
          <div className="vg-outcome-modal is-victory">
            <Trophy className="h-10 w-10 text-yellow-400 mx-auto mb-2" />
            <h2 className="vg-outcome-headline">Chapter threshold hit!</h2>
            <p className="vg-outcome-body">
              Open the <strong>Story</strong> tab and claim your chapter reward
              (boss fights included). Pepe and Apu are ready.
            </p>
            <button
              type="button"
              className="vg-continue"
              onClick={() => {
                setUiTab("story");
                // move to choosing so they can claim
                const next = completedIds.length;
                const ch = CHAPTERS.find(
                  (c) =>
                    next >= c.questsRequired &&
                    !clearedChapters.includes(c.id),
                );
                if (ch) claimChapter(ch.id);
                else startQuest();
              }}
            >
              Claim chapter →
            </button>
          </div>
        </div>
      ) : null}

      {/* Victory */}
      {phase === "victory" ? (
        <div className="vg-outcome-backdrop">
          <div className="vg-outcome-modal is-victory" role="alertdialog">
            <Trophy className="h-10 w-10 text-yellow-400 mx-auto mb-2" />
            <h2 className="vg-outcome-headline">
              {HEROES.pepe.face}{HEROES.apu.face} FEDSLOP NARRATIVE DESTROYED
            </h2>
            <p className="vg-outcome-body">
              All 500 missions complete. Pepe and Apu — truth tellers — shredded
              the South Park nutrient-paste storyline. Truth score {truthScore}.
              Gold {gold}. Kenny died {kennyDeaths} times ({deathPct}% vs 65%
              target). The mountains are almost proud.
            </p>
            <p className="vg-punchline">
              FEELS GOOD MAN. Thank you, come again — to a town that can think.
            </p>
            <button
              type="button"
              className="vg-continue"
              onClick={() => resetGame()}
            >
              New Game+ (Arch-Slop remembers)
            </button>
          </div>
        </div>
      ) : null}

      {!compact &&
      recentDeaths.length > 0 &&
      (phase === "choosing" || phase === "briefing") ? (
        <div className="vg-death-ticker" aria-hidden>
          {recentDeaths.map((h) => (
            <span key={`${h.questId}-${h.title}`}>
              💀 #{h.questId} {h.title.slice(0, 24)}
            </span>
          ))}
        </div>
      ) : null}

      {!compact && (phase === "choosing" || phase === "briefing") ? (
        <div className="vg-loot-bar" title="Party status">
          {HEROES.pepe.face}
          {heroes.pepe.hp} {HEROES.apu.face}
          {heroes.apu.hp} · {gold}g
        </div>
      ) : null}
    </>
  );
}
