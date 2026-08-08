/**
 * MEME LANE ONLY — Pepe & Apu isometric village RPG.
 * Not the default Grok Tutor shell. Mount only from meme routes.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildVillageNodes,
  type VillageBuilding,
} from "@/lib/south-park-village-map";
import { useHiveDeskStore } from "@/lib/hive-desk-store";
import { useVillageGameStore } from "@/lib/village-game/store";
import { HEROES } from "@/lib/village-game/heroes";
import { VillageGamePanel } from "./village-game-panel";
import { cn } from "@/lib/utils";

type IsoApi = {
  setActiveHero: (id: "pepe" | "apu") => void;
  getActiveHero: () => "pepe" | "apu";
  getWeapon: () => "cannon" | "sniper";
  setWeapon: (w: "cannon" | "sniper") => void;
  getNearBuilding: () => VillageBuilding | null;
  setHighlightIds: (ids: string[]) => void;
  setPaused: (p: boolean) => void;
  dispose: () => void;
};

type Props = {
  className?: string;
};

/** Isolated meme village — never import into the professional Tutor Hive shell. */
export function MemeVillageWorkspace({ className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<IsoApi | null>(null);
  const openFromNode = useHiveDeskStore((s) => s.openFromNode);
  const desks = useHiveDeskStore((s) => s.desks);
  const startQuestAtBuilding = useVillageGameStore((s) => s.startQuestAtBuilding);
  const setActiveHero = useVillageGameStore((s) => s.setActiveHero);
  const activeHeroId = useVillageGameStore((s) => s.activeHeroId);
  const targetLocationId = useVillageGameStore((s) => s.targetLocationId);
  const phase = useVillageGameStore((s) => s.phase);
  const beginAdventure = useVillageGameStore((s) => s.beginAdventure);
  const kennyDeaths = useVillageGameStore((s) => s.kennyDeaths);
  const completedCount = useVillageGameStore((s) => s.completedIds.length);
  const heroes = useVillageGameStore((s) => s.heroes);

  const [webglOk, setWebglOk] = useState(true);
  const [near, setNear] = useState<VillageBuilding | null>(null);
  const [memeKills, setMemeKills] = useState(0);
  const [weapon, setWeapon] = useState<"cannon" | "sniper">("sniper");
  const [toast, setToast] = useState<string | null>(null);

  const buildings = useMemo(() => buildVillageNodes(), []);

  const handlersRef = useRef({
    openFromNode,
    startQuestAtBuilding,
    setActiveHero,
    beginAdventure,
    phase: phase as string,
  });
  handlersRef.current = {
    openFromNode,
    startQuestAtBuilding,
    setActiveHero,
    beginAdventure,
    phase,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let api: IsoApi | null = null;

    void import("./iso-village-rpg3d").then(({ createIsoVillageRPG }) => {
      if (cancelled || !canvasRef.current) return;
      try {
        api = createIsoVillageRPG(canvasRef.current, {
          buildings,
          activeHero: activeHeroId === "apu" ? "apu" : "pepe",
          onNearBuilding: (b) => setNear(b),
          onEnterDoor: (b) => {
            const h = handlersRef.current;
            if (h.phase === "title") h.beginAdventure();
            h.startQuestAtBuilding(b.id);
            setToast(`Entered ${b.title}`);
            window.setTimeout(() => setToast(null), 1800);
          },
          onHeroSwitch: (id) => {
            handlersRef.current.setActiveHero(id);
            setToast(id === "pepe" ? "Playing as PEPE" : "Playing as APU");
            window.setTimeout(() => setToast(null), 1200);
          },
          onWeaponSwitch: (w) => {
            setWeapon(w);
            setToast(
              w === "sniper"
                ? "🎯 TRUTH SNIPER equipped"
                : "💥 MEME CANNON equipped",
            );
            window.setTimeout(() => setToast(null), 1400);
          },
          onMemeHit: ({ kills }) => setMemeKills(kills),
        });
        apiRef.current = api;
        setWeapon(api.getWeapon());
        setWebglOk(true);
      } catch {
        setWebglOk(false);
      }
    });

    return () => {
      cancelled = true;
      api?.dispose();
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once for world
  }, [buildings]);

  useEffect(() => {
    apiRef.current?.setActiveHero(activeHeroId === "apu" ? "apu" : "pepe");
  }, [activeHeroId]);

  useEffect(() => {
    const heavy =
      phase === "title" ||
      phase === "minigame" ||
      phase === "combat" ||
      phase === "outcome" ||
      phase === "victory" ||
      phase === "chapter";
    apiRef.current?.setPaused(heavy);
  }, [phase]);

  useEffect(() => {
    const ids: string[] = [];
    if (targetLocationId?.startsWith("ws:")) ids.push(targetLocationId);
    desks.forEach((d) => {
      if (!d?.href) return;
      const hit = buildings.find((b) => d.href.includes(b.href.split("?")[0]!));
      if (hit) ids.push(hit.id);
    });
    apiRef.current?.setHighlightIds(ids);
  }, [targetLocationId, desks, buildings]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "e") return;
      if (!e.shiftKey) return;
      const b = apiRef.current?.getNearBuilding();
      if (b) {
        openFromNode(b);
        setToast(`Desk: ${b.title}`);
        window.setTimeout(() => setToast(null), 1500);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openFromNode]);

  const pepe = heroes?.pepe;
  const apu = heroes?.apu;

  return (
    <div
      className={cn(
        "tutor-hive-root village-mode game-mode iso-rpg",
        desks.length > 0 && "has-desks",
        className,
      )}
      data-lane="meme"
      data-surface="meme-village"
    >
      <canvas
        ref={canvasRef}
        className="tutor-hive-canvas"
        tabIndex={0}
        aria-label="Meme village RPG — WASD move, E doors, Space fire, 2 sniper, 1 cannon, Tab PEPE/APU"
      />

      <div className="iso-topbar">
        <div className="iso-brand">
          <span className="iso-logo">
            {HEROES.pepe.face}
            {HEROES.apu.face}
          </span>
          <div>
            <strong>MEME VILLAGE</strong>
            <em>
              {completedCount}/500 · 💀{kennyDeaths} · 💥{memeKills} gremlins · not
              pro tutor
            </em>
          </div>
        </div>
        <div className="iso-party-pills">
          <button
            type="button"
            className={cn("iso-pill pepe", activeHeroId !== "apu" && "is-on")}
            onClick={() => setActiveHero("pepe")}
          >
            {HEROES.pepe.face} PEPE{" "}
            <i>
              {pepe?.hp ?? 100}/{pepe?.maxHp ?? 100}
            </i>
          </button>
          <button
            type="button"
            className={cn("iso-pill apu", activeHeroId === "apu" && "is-on")}
            onClick={() => setActiveHero("apu")}
          >
            {HEROES.apu.face} APU{" "}
            <i>
              {apu?.hp ?? 90}/{apu?.maxHp ?? 90}
            </i>
          </button>
          <button
            type="button"
            className={cn("iso-pill weapon", weapon === "sniper" && "is-on sniper")}
            onClick={() => apiRef.current?.setWeapon("sniper")}
            title="Truth Sniper Rifle"
          >
            🎯 SNIPER
          </button>
          <button
            type="button"
            className={cn("iso-pill weapon", weapon === "cannon" && "is-on cannon")}
            onClick={() => apiRef.current?.setWeapon("cannon")}
            title="Meme Cannon"
          >
            💥 CANNON
          </button>
        </div>
      </div>

      {weapon === "sniper" ? (
        <div className="iso-scope" aria-hidden>
          <div className="iso-scope-ring" />
          <div className="iso-scope-cross-h" />
          <div className="iso-scope-cross-v" />
          <div className="iso-scope-dot" />
        </div>
      ) : null}

      <div className="iso-controls" aria-hidden>
        <span>
          <kbd>WASD</kbd> move
        </span>
        <span>
          <kbd>E</kbd> door
        </span>
        <span>
          <kbd>Space</kbd> fire
        </span>
        <span>
          <kbd>2</kbd> sniper
        </span>
        <span>
          <kbd>1</kbd> cannon
        </span>
        <span>
          <kbd>V</kbd> ADS
        </span>
        <span>
          <kbd>Tab</kbd> hero
        </span>
        <span>
          <kbd>Q</kbd> quest
        </span>
      </div>

      {near && phase !== "title" && phase !== "minigame" && phase !== "combat" ? (
        <div className="iso-door-prompt">
          <strong>{near.title}</strong>
          <span>
            Press <kbd>E</kbd> to enter · <kbd>Shift+E</kbd> floating desk
          </span>
        </div>
      ) : null}

      {toast ? <div className="iso-toast">{toast}</div> : null}

      <VillageGamePanel compact />

      {!webglOk ? (
        <div className="tutor-hive-fallback">
          <p>WebGL required for the meme village.</p>
        </div>
      ) : null}
    </div>
  );
}
