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
import { hiveHudSummary, type HiveNode } from "@/lib/tutor-hive-map";
import { assembleHiveField } from "@/lib/hive-idle-field";
import {
  industryIdFromMapCard,
  mapCardDeskHref,
} from "@/lib/map-2d-layers";
import {
  learnerIdleHeaderMeta,
  learnerStatusLastMessage,
} from "@/lib/learner-desk-chrome";
import {
  buildReasoningLessonCombs,
  firstSliceTrackById,
  lessonNodeId,
  sitLessonIdFromNode,
} from "@/lib/reasoning-tracks";
import { useHiveDeskStore } from "@/lib/hive-desk-store";
import { useHiveEditStore } from "@/lib/hive-edit-store";
import { detectHiveQuality, profileFor } from "@/lib/hive-load-quality";
import {
  defaultViewForDevice,
  isPhoneLayout,
  layoutTier,
  type HiveLayoutTier,
} from "@/lib/hive-viewport";
import {
  NODE_SIZE_LEGEND,
  NODE_STYLE_META,
  sizeMeaningForNode,
  thinkingPriority,
} from "@/lib/hive-node-style";
import { cn } from "@/lib/utils";
import type { TutorHive3D } from "./tutor-hive3d";
import { HiveEditPanel } from "./hive-edit-panel";
import { FirstRunCoach } from "./first-run-coach";
import { HiveAsk } from "./hive-ask";
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
  const openRoute = useHiveDeskStore((s) => s.openRoute);
  const desks = useHiveDeskStore((s) => s.desks);
  const lastMessage = useHiveDeskStore((s) => s.lastMessage);

  const editMode = useHiveEditStore((s) => s.editMode);
  const fieldModeRaw = useHiveEditStore((s) => s.fieldMode);
  const fieldMode = fieldModeRaw === "examples" ? "examples" : "catalog";
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
  const setFieldMode = useHiveEditStore((s) => s.setFieldMode);
  const setActiveLessonId = useHiveEditStore((s) => s.setActiveLessonId);
  const sitFromMapCard = useHiveEditStore((s) => s.sitFromMapCard);
  const activeLessonId = useHiveEditStore((s) => s.activeLessonId);
  const attachedLensId = useHiveEditStore((s) => s.attachedLensId);
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
    profileFor("steady", {
      reasons: ["safe-fallback-no-gpu-probe"],
      gpuLabel: "deferred",
      isIgpu: true,
      webgl: false,
    }),
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

  const lessons = useMemo(() => buildReasoningLessonCombs(), []);
  const sittingLesson = firstSliceTrackById(activeLessonId);
  const examplesOn = fieldMode === "examples";
  // Learner idle: exactly three first-slice trade pairings. Sitting does not
  // dump rooms or auto-open a desk — a comb click opens the desk.
  const assembled = useMemo(
    () =>
      assembleHiveField({
        editMode,
        examplesOn,
        sittingLessonId: activeLessonId,
        attachedLensId,
      }),
    [editMode, examplesOn, activeLessonId, attachedLensId],
  );
  const fieldWorkspaces = assembled.workspaces;
  const fieldSkills = assembled.skills;
  const fieldIndustries = assembled.industries;
  const workspaces = fieldWorkspaces;
  const skills = fieldSkills;
  const industries = fieldIndustries;
  const summary = useMemo(() => hiveHudSummary(), []);
  const idleHeaderMeta = editMode ? null : learnerIdleHeaderMeta();
  const operatorStatus = learnerStatusLastMessage(editMode, lastMessage);

  const phases = useMemo(
    () => phasesFor(fieldWorkspaces, fieldSkills, fieldIndustries),
    [
      phasesFor,
      fieldWorkspaces,
      fieldSkills,
      fieldIndustries,
      shapeId,
      reasoningDepth,
      deepProfileId,
    ],
  );

  const orchScenario = useMemo(
    () => scenarioFor(fieldWorkspaces, fieldSkills, fieldIndustries),
    [scenarioFor, fieldWorkspaces, fieldSkills, fieldIndustries, shapeId, reasoningDepth],
  );
  const orchStep = useMemo(
    () => scenarioStepFor(fieldWorkspaces, fieldSkills, fieldIndustries),
    [
      scenarioStepFor,
      fieldWorkspaces,
      fieldSkills,
      fieldIndustries,
      shapeId,
      reasoningDepth,
      phaseIndex,
    ],
  );
  const orchSkills = useMemo(
    () => scenarioSkillsFor(fieldWorkspaces, fieldSkills, fieldIndustries),
    [
      scenarioSkillsFor,
      fieldWorkspaces,
      fieldSkills,
      fieldIndustries,
      shapeId,
      reasoningDepth,
      phaseIndex,
    ],
  );

  const positions = useMemo(
    () => positionsFor(fieldWorkspaces, fieldSkills, fieldIndustries),
    [
      positionsFor,
      fieldWorkspaces,
      fieldSkills,
      fieldIndustries,
      shapeId,
      customOffsets,
      nodeStyle,
    ],
  );

  const activePhase = phases[phaseIndex];
  const exampleGlowIds = sittingLesson ? [lessonNodeId(sittingLesson.id)] : [];
  const phaseNodeIds = useMemo(() => {
    const ids = new Set(activePhase?.nodeIds ?? []);
    for (const id of exampleGlowIds) ids.add(id);
    return [...ids];
  }, [activePhase, exampleGlowIds]);

  const openIds = useMemo(() => {
    const ids: string[] = [];
    const pool = [...fieldWorkspaces, ...fieldIndustries, ...fieldSkills, ...lessons];
    for (const d of desks) {
      if (!d?.href) continue;
      const path = d.href.split("?")[0] || "";
      const hit = pool.find((n) => path === n.href.split("?")[0]);
      if (hit) ids.push(hit.id);
    }
    return ids;
  }, [desks, fieldWorkspaces, fieldIndustries, fieldSkills, lessons]);

  const openFromNodeRef = useRef(openFromNode);
  openFromNodeRef.current = openFromNode;
  const setActiveLessonIdRef = useRef(setActiveLessonId);
  setActiveLessonIdRef.current = setActiveLessonId;
  const editModeRef = useRef(editMode);
  editModeRef.current = editMode;
  const selectNodeRef = useRef(selectNode);
  selectNodeRef.current = selectNode;
  const positionsRef = useRef(positions);
  positionsRef.current = positions;
  const qualityRef = useRef(quality);
  qualityRef.current = quality;
  const workspacesRef = useRef(fieldWorkspaces);
  workspacesRef.current = fieldWorkspaces;
  const skillsRef = useRef(fieldSkills);
  skillsRef.current = fieldSkills;
  const industriesRef = useRef(fieldIndustries);
  industriesRef.current = fieldIndustries;

  const prefer3d = viewMode === "3d";
  /** Map shows on user choice OR soft 3D failure — never blocks shapes/desks */
  const showMap = viewMode === "2d" || loadStage === "failed";
  const softFailed = loadStage === "failed";

  // Remount 3D when the connected sitting changes (small field — never the corpus)
  useEffect(() => {
    if (!prefer3d) return;
    setRemountKey((k) => k + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeStyle, fieldMode, activeLessonId, attachedLensId]);

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
        const field = p.get("field");
        if (field === "examples" || field === "catalog") {
          setFieldMode(field);
        }
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
        const rawShapeEarly = p.get("shape");
        if (
          rawShapeEarly &&
          (allowedShapes as readonly string[]).includes(rawShapeEarly)
        ) {
          setShape(rawShapeEarly as (typeof allowedShapes)[number]);
        }
        const track = p.get("track");
        if (track) {
          setFieldMode("examples");
          selectNode(lessonNodeId(track));
        }
        const orch = p.get("orch") === "1" || p.get("demo") === "scenario";
        if (!orch) return;
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
        // Play works on Map. Do not force 3D — that GPU-crashed iGPU browsers.
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
    // Do not probe WebGL on boot — loseContext() on Iris Xe crashed Edge/Chrome
    // even in Map view. Probe only if the user later opts into 3D.
    const q = profileFor("steady", {
      reasons: ["safe-fallback-no-gpu-probe"],
      gpuLabel: "deferred",
      isIgpu: true,
      webgl: false,
    });
    setQuality(q);
    try {
      const params = new URLSearchParams(window.location.search);
      const urlView = params.get("view");
      const wantMap =
        urlView === "map" ||
        urlView === "2d" ||
        urlView === "safe" ||
        params.get("safe") === "1";

      // Safe fallback (restored): Map is the product on iGPU / preferMap.
      // Ignore stored/forced 3D and ?view=3d so a prior crash URL cannot loop.
      if (q.preferMap || wantMap || isPhoneLayout()) {
        setViewMode("2d");
        try {
          localStorage.setItem(VIEW_KEY, "2d");
          localStorage.removeItem(VIEW_FORCED_KEY);
        } catch {
          /* ignore */
        }
        return;
      }

      if (urlView === "3d") {
        setViewMode("3d");
        try {
          localStorage.setItem(VIEW_KEY, "3d");
          localStorage.setItem(VIEW_FORCED_KEY, "1");
        } catch {
          /* ignore */
        }
        return;
      }
      setViewMode(readStoredView());
    } catch {
      setViewMode(defaultViewForDevice());
    }
  }, []);

  const retry3d = useCallback(() => {
    const q = detectHiveQuality();
    setQuality(q);
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
                failIfMajorPerformanceCaveat: q.failIfMajorPerformanceCaveat,
              },
              onHover: (info) => {
                if (!cancelled && stillMine()) setHover(info);
              },
              onSelect: (node) => {
                if (editModeRef.current) {
                  selectNodeRef.current(node.id);
                  return;
                }
                const sitId = sitLessonIdFromNode(node.id);
                if (sitId) setActiveLessonIdRef.current(sitId);
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
      const edges = edgesFor(fieldWorkspaces, fieldSkills, fieldIndustries);
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
    const cardIndustry = industryIdFromMapCard(node.id);
    if (cardIndustry) {
      // Same sit path as ask / named-pack. Not a /demo catalog.
      const sat = sitFromMapCard(cardIndustry);
      if (sat.ok) {
        try {
          openRoute(mapCardDeskHref(sat.industryId), sat.pairing, node.color, "");
        } catch {
          /* desk open must never crash the Hive */
        }
      }
      return;
    }
    // Desk opens only from a learner click — never on idle mount / Path Play.
    // Sit first-slice only (Electrical / Plumbing / HVAC). Civic is off this sitting.
    const sitId = sitLessonIdFromNode(node.id);
    if (sitId) setActiveLessonId(sitId);
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
      ? `${glError} Map keeps example lessons and lenses. Retry 3D when ready.`
      : "Map mode (3D paused) — same lessons and lenses. Retry 3D anytime."
    : viewMode === "2d"
      ? examplesOn
        ? "Map of example lessons — pick a lens to remap the same samples."
        : quality.preferMap
          ? `Map-first on this machine (${quality.tier}) — full Hive features. 3D is optional.`
          : "Map view — reasoning shapes and phases still apply. Switch to 3D anytime."
      : null;

  const flowEdges = useMemo(() => {
    if (!(playOrchestration || editMode || examplesOn)) return [];
    try {
      return edgesFor(fieldWorkspaces, fieldSkills, fieldIndustries);
    } catch {
      return [];
    }
  }, [
    playOrchestration,
    editMode,
    examplesOn,
    edgesFor,
    fieldWorkspaces,
    fieldSkills,
    fieldIndustries,
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
      data-field={fieldMode}
      data-shape={shapeId}
      data-node-style={nodeStyle}
      data-reasoning={reasoningDepth}
      data-load={loadStage}
      data-view={showMap ? "2d" : "3d"}
      data-quality={quality.tier}
      data-layout={tier}
      data-idle-combs={!editMode && !examplesOn ? String(fieldWorkspaces.length) : undefined}
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
          workspaces={fieldWorkspaces}
          skills={fieldSkills}
          industries={fieldIndustries}
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
          learnerLayers={!editMode && !examplesOn}
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
            {editMode ? (
              <p className="tutor-hive-meta">{summary.sittingLabel}</p>
            ) : idleHeaderMeta ? (
              <p className="tutor-hive-meta">{idleHeaderMeta}</p>
            ) : null}
            <p className="tutor-hive-sub">
              {editMode
                ? "Edit — operator sculpt. Learners use Tools to attach a lens and Path to play the lesson."
                : "Three first-slice lessons. Click a comb to open a desk. Path walks this sitting's seven habits."}
            </p>
            {editMode ? null : <HiveAsk />}
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
          {operatorStatus ? ` · ${operatorStatus}` : null}
        </div>
      </div>

      <div
        className={cn("tutor-hive-zoom-bar", phone && "is-phone-dock")}
        role="toolbar"
        aria-label="Hive tools"
      >
        {editMode ? (
          <button
            type="button"
            className="is-active-tool"
            onClick={() => toggleEditMode()}
            title="Leave operator edit"
          >
            <Pencil className="h-3.5 w-3.5" />
            {phone ? null : "Edit"}
          </button>
        ) : null}

        <span className="tutor-view-toggle" role="group" aria-label="Hive view">
          <button
            type="button"
            className={cn(prefer3d && !softFailed && "is-on")}
            title="3D field"
            onClick={() => retry3d()}
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
        workspaces={fieldWorkspaces}
        skills={fieldSkills}
        industries={fieldIndustries}
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

      {/* Size key — always visible in 3D so galactic scale is readable */}
      {!showMap && prefer3d && !softFailed ? (
        <aside
          className="tutor-hive-size-legend"
          aria-label="What node sizes mean"
        >
          <p className="tutor-hive-size-legend-title">
            Node size
            <span>
              {nodeStyle === "galactic"
                ? NODE_STYLE_META.galactic.label
                : NODE_STYLE_META.geometric.label}
            </span>
          </p>
          <ul>
            {NODE_SIZE_LEGEND.map((row) => (
              <li key={row.id} data-kind={row.id}>
                <span className={cn("sz-dot", `is-${row.id}`)} aria-hidden />
                <span>
                  <strong>{row.label}</strong>
                  <em>{row.meaning}</em>
                </span>
              </li>
            ))}
          </ul>
          <p className="tutor-hive-size-legend-foot">
            {nodeStyle === "galactic"
              ? "Within a tier, slightly larger = more central to clear thinking."
              : "Hex size follows desk / craft / tool role — same meaning as galactic."}
          </p>
        </aside>
      ) : null}

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
            {(() => {
              const list =
                hover.kind === "workspace"
                  ? fieldWorkspaces
                  : hover.kind === "industry"
                    ? fieldIndustries
                    : fieldSkills;
              const idx = Math.max(
                0,
                list.findIndex((n) => n.id === hover.id),
              );
              const pr = thinkingPriority(hover.kind, idx, list.length, {
                enabled: hover.enabled,
              });
              const sm = sizeMeaningForNode(hover.kind, pr);
              return (
                <p className="thh-size" title={sm.sizeBlurb}>
                  <span className="thh-size-label">{sm.sizeLabel}</span>
                  <span className="thh-size-blurb">{sm.sizeBlurb}</span>
                </p>
              );
            })()}
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
