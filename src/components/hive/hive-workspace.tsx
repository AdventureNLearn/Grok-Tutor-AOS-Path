/**
 * Grok Tutor · The Hive
 * - 3D WebGL field (default when available)
 * - 2D shape map (user toggle or graceful WebGL fallback)
 * - Reasoning shapes + orchestration work in BOTH modes
 * - Fail soft: never catastrophic abort; always can open desks
 * - Clean swap: dispose forces WebGL context loss + fresh canvas on retry
 */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Maximize2, Minus, Pencil, Plus, Sparkles } from "lucide-react";
import {
  buildIndustryField,
  buildSkillField,
  buildWorkspaceCombs,
  hiveHudSummary,
  type HiveNode,
} from "@/lib/tutor-hive-map";
import { useHiveDeskStore } from "@/lib/hive-desk-store";
import { useHiveEditStore } from "@/lib/hive-edit-store";
import { detectHiveQuality } from "@/lib/hive-load-quality";
import {
  defaultViewForDevice,
  isPhoneLayout,
  layoutTier,
  type HiveLayoutTier,
} from "@/lib/hive-viewport";
import { cn } from "@/lib/utils";
import type { TutorHive3D } from "./tutor-hive3d";
import { HiveEditPanel } from "./hive-edit-panel";
import { FirstRunCoach } from "./first-run-coach";
import { HiveMap2D } from "./hive-map-2d";
import { OrchestrationSimPanel } from "./orchestration-sim-panel";

type Props = {
  className?: string;
};

/** User-facing view: 3D field or shape-aware map */
export type HiveViewMode = "3d" | "2d";

type LoadStage = "idle" | "igniting" | "ready" | "failed";

const VIEW_KEY = "grok-tutor-hive-view-v1";
/** Set when user explicitly picks 3D/Map — survives device-default logic */
const VIEW_FORCED_KEY = "grok-tutor-hive-view-forced-v1";

function readStoredView(): HiveViewMode {
  // SSR: Map/2d shell so first paint is our Hive without waiting on WebGL.
  if (typeof window === "undefined") return "2d";
  try {
    const forced = localStorage.getItem(VIEW_FORCED_KEY) === "1";
    const v = localStorage.getItem(VIEW_KEY);
    if (forced && (v === "2d" || v === "3d")) return v;
    if (v === "2d" || v === "3d") {
      // Honor stored, but first visit on phone prefers Map (utility-first)
      return v;
    }
  } catch {
    /* ignore */
  }
  return defaultViewForDevice();
}

function webglLikelyAvailable(): boolean {
  if (typeof document === "undefined") return true;
  try {
    const c = document.createElement("canvas");
    const gl =
      c.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ||
      c.getContext("webgl", { failIfMajorPerformanceCaveat: false }) ||
      c.getContext("experimental-webgl", { failIfMajorPerformanceCaveat: false });
    if (!gl) return false;
    // Drop the probe context immediately so we don't burn a slot
    const lose = (gl as WebGLRenderingContext).getExtension?.("WEBGL_lose_context");
    lose?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function softDispose(api: TutorHive3D | null) {
  if (!api) return;
  try {
    api.dispose();
  } catch {
    /* never throw from cleanup */
  }
}

export function HiveWorkspace({ className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<TutorHive3D | null>(null);
  const openFromNode = useHiveDeskStore((s) => s.openFromNode);
  const desks = useHiveDeskStore((s) => s.desks);
  const lastMessage = useHiveDeskStore((s) => s.lastMessage);

  const editMode = useHiveEditStore((s) => s.editMode);
  const shapeId = useHiveEditStore((s) => s.shapeId);
  const nodeStyle = useHiveEditStore((s) => s.nodeStyle);
  const reasoningDepth = useHiveEditStore((s) => s.reasoningDepth);
  const deepProfileId = useHiveEditStore((s) => s.deepProfileId);
  const customOffsets = useHiveEditStore((s) => s.customOffsets);
  const selectedNodeId = useHiveEditStore((s) => s.selectedNodeId);
  const playOrchestration = useHiveEditStore((s) => s.playOrchestration);
  const phaseIndex = useHiveEditStore((s) => s.phaseIndex);
  const toggleEditMode = useHiveEditStore((s) => s.toggleEditMode);
  const setEditMode = useHiveEditStore((s) => s.setEditMode);
  const setShape = useHiveEditStore((s) => s.setShape);
  const setPlayOrchestration = useHiveEditStore((s) => s.setPlayOrchestration);
  const setReasoningDepth = useHiveEditStore((s) => s.setReasoningDepth);
  const selectNode = useHiveEditStore((s) => s.selectNode);
  const nextPhase = useHiveEditStore((s) => s.nextPhase);
  const positionsFor = useHiveEditStore((s) => s.positionsFor);
  const phasesFor = useHiveEditStore((s) => s.phasesFor);
  const edgesFor = useHiveEditStore((s) => s.edgesFor);
  const scenarioFor = useHiveEditStore((s) => s.scenarioFor);
  const scenarioStepFor = useHiveEditStore((s) => s.scenarioStepFor);
  const scenarioSkillsFor = useHiveEditStore((s) => s.scenarioSkillsFor);

  // Quality + stored view are client-only — SSR always paints Map so hydration
  // matches. Prefer 3D only after mount (localStorage / user click).
  const [quality, setQuality] = useState(() =>
    detectHiveQuality(), // SSR: steady; client first paint also steady until effect
  );
  const [viewMode, setViewMode] = useState<HiveViewMode>("2d");
  const [loadStage, setLoadStage] = useState<LoadStage>("idle");
  const [glError, setGlError] = useState<string | null>(null);
  /** Bumps to force a brand-new <canvas> + 3D instance (context-safe retry) */
  const [remountKey, setRemountKey] = useState(0);
  const [hover, setHover] = useState<HiveNode | null>(null);
  const [zoomPct, setZoomPct] = useState(100);
  const [mapScale, setMapScale] = useState(1);
  const [serverOk, setServerOk] = useState(true);
  const [tier, setTier] = useState<HiveLayoutTier>(() =>
    typeof window !== "undefined" ? layoutTier() : "desktop",
  );
  const phone = tier === "phone";

  const workspaces = useMemo(() => buildWorkspaceCombs(), []);
  const skills = useMemo(
    () => buildSkillField(quality.maxSkills),
    [quality.maxSkills],
  );
  const industries = useMemo(
    () => buildIndustryField(quality.maxIndustries),
    [quality.maxIndustries],
  );
  const summary = useMemo(() => hiveHudSummary(), []);

  const phases = useMemo(
    () => phasesFor(workspaces, skills, industries),
    [
      phasesFor,
      workspaces,
      skills,
      industries,
      shapeId,
      reasoningDepth,
      deepProfileId,
    ],
  );

  const orchScenario = useMemo(
    () => scenarioFor(workspaces, skills, industries),
    [scenarioFor, workspaces, skills, industries, shapeId, reasoningDepth],
  );
  const orchStep = useMemo(
    () => scenarioStepFor(workspaces, skills, industries),
    [
      scenarioStepFor,
      workspaces,
      skills,
      industries,
      shapeId,
      reasoningDepth,
      phaseIndex,
    ],
  );
  const orchSkills = useMemo(
    () => scenarioSkillsFor(workspaces, skills, industries),
    [
      scenarioSkillsFor,
      workspaces,
      skills,
      industries,
      shapeId,
      reasoningDepth,
      phaseIndex,
    ],
  );

  const positions = useMemo(
    () => positionsFor(workspaces, skills, industries),
    [positionsFor, workspaces, skills, industries, shapeId, customOffsets],
  );

  const activePhase = phases[phaseIndex];
  const phaseNodeIds = activePhase?.nodeIds ?? [];

  const openIds = useMemo(() => {
    const ids: string[] = [];
    for (const d of desks) {
      if (!d?.href) continue;
      const path = d.href.split("?")[0] || "";
      const hit =
        workspaces.find((n) => path === n.href.split("?")[0]) ||
        industries.find((n) => path === n.href.split("?")[0]) ||
        skills.find(
          (n) => path === n.href.split("?")[0] || d.href.includes(n.href),
        );
      if (hit) ids.push(hit.id);
    }
    return ids;
  }, [desks, workspaces, industries, skills]);

  const openFromNodeRef = useRef(openFromNode);
  openFromNodeRef.current = openFromNode;
  const editModeRef = useRef(editMode);
  editModeRef.current = editMode;
  const selectNodeRef = useRef(selectNode);
  selectNodeRef.current = selectNode;
  const positionsRef = useRef(positions);
  positionsRef.current = positions;
  const qualityRef = useRef(quality);
  qualityRef.current = quality;
  const workspacesRef = useRef(workspaces);
  workspacesRef.current = workspaces;
  const skillsRef = useRef(skills);
  skillsRef.current = skills;
  const industriesRef = useRef(industries);
  industriesRef.current = industries;

  const prefer3d = viewMode === "3d";
  /** Map shows on user choice OR soft 3D failure — never blocks shapes/desks */
  const showMap = viewMode === "2d" || loadStage === "failed";
  const softFailed = loadStage === "failed";

  // Remount 3D when node visual style changes (geometric ↔ galactic)
  useEffect(() => {
    if (!prefer3d) return;
    setRemountKey((k) => k + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeStyle]);

  /**
   * Human-observable demo / auto-test entry:
   *   /?orch=1&shape=spine|integrity-triangle|four-agent|…
   *   /?orch=1&deep=1&style=galactic
   * URL must win over persisted Edit store (otherwise every iframe sticks on spine).
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const applyOrchFromUrl = () => {
      try {
        const p = new URLSearchParams(window.location.search);
        const orch = p.get("orch") === "1" || p.get("demo") === "scenario";
        if (!orch) return;
        const allowedShapes = [
          "spine",
          "integrity-triangle",
          "four-agent",
          "claim-diamond",
          "lpin-helix",
          "sense-orbit",
          "star-burst",
          "honeycomb",
        ] as const;
        const rawShape = p.get("shape") || "spine";
        const shape = (allowedShapes as readonly string[]).includes(rawShape)
          ? (rawShape as (typeof allowedShapes)[number])
          : "spine";
        setShape(shape);
        if (p.get("deep") === "1") setReasoningDepth("deep");
        else setReasoningDepth("standard");
        if (p.get("style") === "galactic") {
          useHiveEditStore.getState().setNodeStyle("galactic");
        } else {
          useHiveEditStore.getState().setNodeStyle("geometric");
        }
        setEditMode(true);
        setPlayOrchestration(true);
        if (p.get("view") !== "map") {
          try {
            localStorage.setItem("grok-tutor-hive-view-v1", "3d");
            localStorage.setItem("grok-tutor-hive-view-forced-v1", "1");
          } catch {
            /* ignore */
          }
          setViewMode("3d");
        }
      } catch {
        /* ignore */
      }
    };

    applyOrchFromUrl();
    // Re-apply after zustand persist rehydrates (was overwriting shape → always spine)
    const persistApi = useHiveEditStore.persist;
    if (persistApi?.hasHydrated?.()) {
      applyOrchFromUrl();
    }
    const unsub = persistApi?.onFinishHydration?.(() => {
      applyOrchFromUrl();
    });
    // SPA / observe pane navigations
    window.addEventListener("popstate", applyOrchFromUrl);
    const t1 = window.setTimeout(applyOrchFromUrl, 50);
    const t2 = window.setTimeout(applyOrchFromUrl, 250);
    const t3 = window.setTimeout(applyOrchFromUrl, 800);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.removeEventListener("popstate", applyOrchFromUrl);
      if (typeof unsub === "function") unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Generation token — any in-flight 3D start must match to apply state */
  const genRef = useRef(0);

  const failSoft = useCallback((reason: string, gen?: number) => {
    if (gen !== undefined && gen !== genRef.current) return;
    // Invalidate in-flight init so a late import cannot resurrect a dead session
    genRef.current += 1;
    softDispose(apiRef.current);
    apiRef.current = null;
    setGlError(reason);
    setLoadStage("failed");
  }, []);

  const setView = useCallback((mode: HiveViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_KEY, mode);
      localStorage.setItem(VIEW_FORCED_KEY, "1");
    } catch {
      /* ignore */
    }
    // Invalidate any in-flight 3D init
    genRef.current += 1;
    softDispose(apiRef.current);
    apiRef.current = null;
    if (mode === "3d") {
      setGlError(null);
      setLoadStage("idle");
      setRemountKey((k) => k + 1);
    } else {
      setGlError(null);
      setLoadStage("idle");
    }
  }, []);

  // Track layout tier (phone / tablet / desktop / wide) for chrome + map fill
  useEffect(() => {
    const update = () => setTier(layoutTier());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // After hydration: apply device quality + stored view (avoids SSR/client mismatch)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = detectHiveQuality();
    setQuality(q);
    try {
      const params = new URLSearchParams(window.location.search);
      const urlView = params.get("view");
      // Operator deep-link: /?view=3d or /?view=map
      if (urlView === "3d" || urlView === "map" || urlView === "2d") {
        const mode: HiveViewMode = urlView === "3d" ? "3d" : "2d";
        setViewMode(mode);
        try {
          localStorage.setItem(VIEW_KEY, mode);
          localStorage.setItem(VIEW_FORCED_KEY, "1");
        } catch {
          /* ignore */
        }
        return;
      }
      const stored = readStoredView();
      // Phone + no forced preference → Map
      if (localStorage.getItem(VIEW_FORCED_KEY) !== "1" && isPhoneLayout()) {
        setViewMode("2d");
        localStorage.setItem(VIEW_KEY, "2d");
        return;
      }
      // Prefer Map on accessible/steady unless user already forced 3D
      if (
        stored === "3d" &&
        q.preferMap &&
        localStorage.getItem(VIEW_FORCED_KEY) !== "1"
      ) {
        setViewMode("2d");
        return;
      }
      setViewMode(stored);
    } catch {
      setViewMode(defaultViewForDevice());
    }
  }, []);

  const retry3d = useCallback(() => {
    setView("3d");
  }, [setView]);

  // Mount / remount 3D when preferred (fresh canvas each remountKey)
  useEffect(() => {
    if (!prefer3d) return;

    const gen = genRef.current;
    const stillMine = () => gen === genRef.current;

    if (!webglLikelyAvailable()) {
      failSoft("WebGL is not available in this browser.", gen);
      return;
    }

    let cancelled = false;
    let api: TutorHive3D | null = null;
    let failTimer = 0;
    let readyTimer = 0;
    let waitFrames = 0;

    const start = () => {
      if (cancelled || !stillMine()) return;
      const canvas = canvasRef.current;
      // Fresh canvas may need a frame after remountKey swap
      if (!canvas) {
        if (waitFrames++ < 12) {
          requestAnimationFrame(start);
        } else {
          failSoft("3D canvas did not mount — map view stays available.", gen);
        }
        return;
      }

      setLoadStage("igniting");
      setGlError(null);

      failTimer = window.setTimeout(() => {
        if (!cancelled && stillMine() && !apiRef.current) {
          failSoft(
            "3D took too long to start — map view is fully usable. Retry 3D anytime.",
            gen,
          );
        }
      }, qualityRef.current.igniteBudgetMs || 8000);

      void import("./tutor-hive3d")
        .then(({ createTutorHive3D }) => {
          if (cancelled || !stillMine() || !canvasRef.current) return;
          try {
            const ws = workspacesRef.current;
            const sk = skillsRef.current;
            const ind = industriesRef.current;
            const q = qualityRef.current;
            api = createTutorHive3D(canvasRef.current, {
              workspaces: ws,
              skills: sk,
              industries: ind,
              positions: positionsRef.current,
              nodeStyle,
              quality: {
                pixelRatioCap: q.pixelRatioCap,
                starFar: q.starFar,
                starMid: q.starMid,
                starNear: q.starNear,
                antialias: q.antialias,
                transmission: q.transmission,
                nebula: q.nebula,
                grid: q.grid,
                powerPreference: q.powerPreference,
              },
              onHover: (info) => {
                if (!cancelled && stillMine()) setHover(info);
              },
              onSelect: (node) => {
                if (editModeRef.current) {
                  selectNodeRef.current(node.id);
                  return;
                }
                openFromNodeRef.current(node);
              },
              onReady: () => {
                if (!cancelled && stillMine()) setLoadStage("ready");
              },
              onContextLost: (reason) => {
                if (!cancelled && stillMine()) failSoft(reason, gen);
              },
            });
            if (cancelled || !stillMine()) {
              softDispose(api);
              return;
            }
            apiRef.current = api;
            setZoomPct(Math.round(api.getZoom() * 100));
            // Mark ready even if onReady is delayed (layout rAF)
            readyTimer = window.setTimeout(() => {
              if (!cancelled && stillMine() && apiRef.current) {
                setLoadStage((s) => (s === "igniting" ? "ready" : s));
              }
            }, 350);
          } catch (e) {
            if (!cancelled && stillMine()) {
              failSoft(
                e instanceof Error
                  ? e.message
                  : "WebGL failed to start — map view stays available.",
                gen,
              );
            }
          }
        })
        .catch((e) => {
          if (!cancelled && stillMine()) {
            failSoft(
              e instanceof Error
                ? e.message
                : "Could not load 3D module — map view stays available.",
              gen,
            );
          }
        });
    };

    start();

    return () => {
      cancelled = true;
      window.clearTimeout(failTimer);
      window.clearTimeout(readyTimer);
      softDispose(api);
      if (apiRef.current === api) apiRef.current = null;
    };
    // remountKey forces clean canvas + GPU context
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefer3d, remountKey, failSoft, nodeStyle]);

  // Sync layout / orchestration to 3D when live — never throw to React
  useEffect(() => {
    const api = apiRef.current;
    if (!api || loadStage !== "ready") return;
    try {
      api.applyLayout(positions, true);
    } catch {
      /* keep map usable */
    }
  }, [positions, loadStage]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api || loadStage !== "ready") return;
    try {
      const edges = edgesFor(workspaces, skills, industries);
      api.setFlowEdges(playOrchestration || editMode ? edges : []);
    } catch {
      /* ignore */
    }
  }, [
    playOrchestration,
    editMode,
    shapeId,
    phaseIndex,
    edgesFor,
    workspaces,
    skills,
    industries,
    loadStage,
  ]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api || loadStage !== "ready") return;
    try {
      api.setEditMode(editMode);
      api.setReasoning(playOrchestration);
      if (selectedNodeId) api.setSelected(selectedNodeId);
      if (!playOrchestration && !editMode) {
        api.setPhaseNodeIds([]);
        return;
      }
      api.setPhaseNodeIds(phaseNodeIds);
    } catch {
      /* ignore */
    }
  }, [playOrchestration, phaseNodeIds, phases, editMode, selectedNodeId, loadStage]);

  useEffect(() => {
    if (!playOrchestration) return;
    // Longer beat when a full scenario is driving (time to read + reason)
    const ms = orchStep ? 5200 : 2800;
    const id = window.setInterval(() => {
      nextPhase(phases.length);
    }, ms);
    return () => window.clearInterval(id);
  }, [playOrchestration, phases.length, nextPhase, orchStep]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api || loadStage !== "ready") return;
    try {
      api.setOpenIds(openIds);
      api.setDeskOpen(desks.length > 0);
    } catch {
      /* ignore */
    }
  }, [openIds, desks.length, loadStage]);

  useEffect(() => {
    let cancelled = false;
    const probe = async () => {
      try {
        const res = await fetch(`/?_hive_health=${Date.now()}`, {
          cache: "no-store",
          credentials: "same-origin",
        });
        if (!cancelled) setServerOk(res.ok || res.status === 404);
      } catch {
        if (!cancelled) setServerOk(false);
      }
    };
    void probe();
    const id = window.setInterval(probe, 10000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const setZoom = (factor: number) => {
    if (showMap) {
      // Wider range on large screens so zoom-out still fills the board
      const lo = phone ? 0.65 : 0.45;
      const hi = phone ? 1.45 : 1.75;
      const next = Math.min(hi, Math.max(lo, factor));
      setMapScale(next);
      setZoomPct(Math.round(next * 100));
      return;
    }
    const api = apiRef.current;
    if (!api) return;
    try {
      api.setZoom(factor);
      setZoomPct(Math.round(api.getZoom() * 100));
    } catch {
      /* ignore */
    }
  };

  const handleNode = (node: HiveNode) => {
    if (editMode) {
      selectNode(node.id);
      return;
    }
    try {
      const result = openFromNode(node);
      if (result && "ok" in result && result.ok) {
        // Status line updates via lastMessage; no-op here
      }
    } catch {
      /* desk open must never crash the Hive */
    }
  };

  const igniting = prefer3d && loadStage === "igniting" && !showMap;
  const mapNote = softFailed
    ? glError
      ? `${glError} Map keeps full Hive features. Retry 3D when ready.`
      : "Map mode (3D paused) — same shapes, desks, and phases. Retry 3D anytime."
    : viewMode === "2d"
      ? quality.preferMap
        ? `Map-first on this machine (${quality.tier}) — full Hive features. 3D is optional.`
        : "Map view — reasoning shapes and phases still apply. Switch to 3D anytime."
      : null;

  const flowEdges = useMemo(() => {
    if (!(playOrchestration || editMode)) return [];
    try {
      return edgesFor(workspaces, skills, industries);
    } catch {
      return [];
    }
  }, [
    playOrchestration,
    editMode,
    edgesFor,
    workspaces,
    skills,
    industries,
    shapeId,
    phaseIndex,
  ]);

  return (
    <div
      className={cn(
        "tutor-hive-root",
        desks.length > 0 && "has-desks",
        editMode && "is-editing",
        phone && "is-phone",
        tier === "wide" && "is-wide",
        className,
      )}
      data-lane="real"
      data-surface="tutor-hive"
      data-shape={shapeId}
      data-node-style={nodeStyle}
      data-reasoning={reasoningDepth}
      data-load={loadStage}
      data-view={showMap ? "2d" : "3d"}
      data-quality={quality.tier}
      data-layout={tier}
    >
      <div className="tutor-galaxy-layer" aria-hidden />
      <div className="tutor-hive-glow" aria-hidden />
      <div className="tutor-hive-vignette" aria-hidden />

      {/*
        Fresh canvas on every remountKey so WebGL context is never reused after dispose.
        Hidden (not unmounted) only while Map is preferred and 3D is idle — when failed we
        still remount on Retry.
      */}
      {prefer3d ? (
        <canvas
          key={remountKey}
          ref={canvasRef}
          className={cn("tutor-hive-canvas", showMap && "is-hidden")}
          tabIndex={showMap ? -1 : 0}
          aria-label="Grok Tutor · The Hive — 3D field"
          aria-hidden={showMap}
        />
      ) : null}

      {showMap ? (
        <HiveMap2D
          workspaces={workspaces}
          skills={skills}
          industries={industries}
          positions={positions}
          phaseNodeIds={
            playOrchestration || editMode ? phaseNodeIds : []
          }
          flowEdges={flowEdges}
          selectedNodeId={selectedNodeId}
          openIds={openIds}
          editMode={editMode}
          scale={mapScale}
          shapeId={shapeId}
          qualityTier={quality.tier}
          note={mapNote}
          onSelect={handleNode}
          onHover={setHover}
        />
      ) : null}

      {igniting ? (
        <div className="tutor-hive-ignite" aria-live="polite">
          <span className="tutor-hive-ignite-mark" />
          <strong>Starting 3D hive…</strong>
          <em>Map view is one click away — shapes keep working either way</em>
        </div>
      ) : null}

      <div className="tutor-hive-hud cinematic">
        <div className="tutor-hive-brand">
          <span className="tutor-hive-mark" aria-hidden />
          <div>
            <h1>Grok Tutor · The Hive</h1>
            <p className="tutor-hive-meta">{summary.label}</p>
            <p className="tutor-hive-sub">
              {editMode
                ? phone
                  ? "Edit — pick a shape · phases light combs · Map or 3D"
                  : "Edit mode — pick a shape · phases light combs · works in 3D and Map"
                : showMap
                  ? softFailed
                    ? "Map fallback — tap a comb · shapes still apply · Retry 3D when ready"
                    : phone
                      ? "Tap a comb to open a desk · shapes apply · switch to 3D anytime"
                      : "Map view — click a comb to open a desk · shapes still apply · zoom fills the field"
                  : phone
                    ? "Drag to orbit · pinch/scroll zoom · tap comb → desk"
                    : "Click a comb to open Learn, Samples, Industries, or Tools. Drag to orbit · scroll to zoom · zoom-out scales cards to fill."}
            </p>
          </div>
        </div>
        <div className="tutor-hive-status" data-health={serverOk ? "ok" : "offline"}>
          {serverOk ? (
            <span className="tutor-health-ok">Ready</span>
          ) : (
            <span
              className="tutor-health-off"
              title="App host unreachable — desks need the same origin"
            >
              Offline · desks paused
            </span>
          )}
          {" · "}
          <span
            className="tutor-quality-chip"
            title={[
              `Auto quality: ${quality.tier}`,
              quality.gpuLabel ? `GPU: ${quality.gpuLabel}` : null,
              quality.reasons.join(", "),
              "Map is full product; 3D is optional enhancement",
            ]
              .filter(Boolean)
              .join(" · ")}
          >
            {quality.tier}
          </span>
          {" · "}
          <span title={showMap ? (softFailed ? "Map (3D paused)" : "Shape map — full features") : "WebGL field"}>
            {showMap ? (softFailed ? "Map · 3D paused" : "Map") : "3D"}
          </span>
          {" · "}
          {desks.length > 0
            ? `${desks.length} desk${desks.length === 1 ? "" : "s"} open`
            : "Hive idle"}
          {playOrchestration && activePhase
            ? ` · ${activePhase.acr} ${activePhase.label}`
            : null}
          {lastMessage ? ` · ${lastMessage}` : null}
        </div>
      </div>

      <div
        className={cn("tutor-hive-zoom-bar", phone && "is-phone-dock")}
        role="toolbar"
        aria-label="Hive tools"
      >
        <button
          type="button"
          className={cn(editMode && "is-active-tool")}
          onClick={() => toggleEditMode()}
          title="Edit workspace shapes"
        >
          <Pencil className="h-3.5 w-3.5" />
          {phone ? null : "Edit"}
          {phone ? <span className="sr-only">Edit</span> : null}
        </button>

        <span className="tutor-view-toggle" role="group" aria-label="Hive view">
          <button
            type="button"
            className={cn(prefer3d && !softFailed && "is-on")}
            title="3D field"
            onClick={() => setView("3d")}
          >
            3D
          </button>
          <button
            type="button"
            className={cn((viewMode === "2d" || softFailed) && "is-on")}
            title="Shape map"
            onClick={() => setView("2d")}
          >
            Map
          </button>
        </span>

        <button
          type="button"
          onClick={() =>
            setZoom(
              showMap
                ? mapScale - 0.1
                : (apiRef.current?.getZoom() ?? 1) - 0.12,
            )
          }
          title="Zoom out"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="tutor-hive-zoom-label">{zoomPct}%</span>
        <button
          type="button"
          onClick={() =>
            setZoom(
              showMap
                ? mapScale + 0.1
                : (apiRef.current?.getZoom() ?? 1) + 0.12,
            )
          }
          title="Zoom in"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (showMap) {
              setMapScale(1);
              setZoomPct(100);
              return;
            }
            try {
              apiRef.current?.fitAll();
              setZoomPct(Math.round((apiRef.current?.getZoom() ?? 1) * 100));
            } catch {
              /* ignore */
            }
          }}
          title="Fit all"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          Fit
        </button>
        {softFailed ? (
          <button type="button" title="Retry 3D with a fresh canvas" onClick={retry3d}>
            Retry 3D
          </button>
        ) : null}
        {playOrchestration ? (
          <button type="button" title="Orchestration playing">
            <Sparkles className="h-3.5 w-3.5" />
            Flow
          </button>
        ) : null}
      </div>

      <HiveEditPanel
        workspaces={workspaces}
        skills={skills}
        industries={industries}
        phases={phases}
      />

      {playOrchestration && orchStep ? (
        <OrchestrationSimPanel
          scenario={orchScenario}
          step={orchStep}
          phaseIndex={phaseIndex}
          phaseCount={phases.length}
          skills={orchSkills}
        />
      ) : null}

      <FirstRunCoach />

      <div
        className={cn("tutor-hive-hover cinematic", hover && "is-on")}
        style={
          hover
            ? ({ ["--hover-glow" as string]: hover.color } as CSSProperties)
            : undefined
        }
        aria-hidden={!hover}
      >
        {hover ? (
          <>
            <div className="thh-top">
              <span className="thh-acr" style={{ color: hover.color }}>
                {hover.acr}
              </span>
              <span className="thh-kind">{hover.kind}</span>
            </div>
            <span className="thh-title">{hover.title}</span>
            {hover.meta ? <span className="thh-meta">{hover.meta}</span> : null}
            <p className="thh-desc">{hover.description}</p>
            <p className="thh-how">
              {editMode
                ? "Click to select for shape modeling."
                : hover.how}
            </p>
          </>
        ) : null}
      </div>

      <p className="tutor-hive-hint">
        {editMode
          ? "Edit · pick shape · nudge · play flow · 3D or Map"
          : showMap
            ? softFailed
              ? "Map fallback · shapes apply · comb → desk · Retry 3D"
              : phone
                ? "Map · tap comb → desk · 3D anytime"
                : "Map · zoom fills field · comb → desk · 3D anytime"
            : phone
              ? "Orbit · zoom · tap comb → desk · Map anytime"
              : "Orbit · zoom-out scales cards · comb → desk · Map anytime"}
      </p>
    </div>
  );
}
