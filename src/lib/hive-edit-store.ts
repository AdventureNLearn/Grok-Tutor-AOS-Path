/**
 * Hive workspace edit + reasoning orchestration state.
 * Persists shape choice, per-node offsets, and named layout library (T4).
 * Learn events can advance phases (T5).
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  HIVE_SHAPES,
  buildOrchestrationEdges,
  buildPhasesForShape,
  computeLayoutPositions,
  getShapeDef,
  type HiveShapeId,
  type OrchestrationEdge,
  type ReasoningPhase,
  type Vec3,
} from "./hive-layout-shapes";
import {
  buildDeepPhases,
  type ReasoningDepth,
} from "./hive-deep-reasoning";
import {
  buildScenarioEdges,
  buildScenarioPhases,
  getScenarioStep,
  pickScenario,
  skillTitlesForStep,
  type OrchScenario,
  type OrchSimStep,
} from "./hive-orchestration-sim";
import type { HiveNodeStyle } from "./hive-node-style";
import type { HiveNode } from "./tutor-hive-map";

export type { HiveNodeStyle } from "./hive-node-style";
export type { ReasoningDepth } from "./hive-deep-reasoning";
export { DEEP_REASONING_PROFILES } from "./hive-deep-reasoning";
export { NODE_STYLE_META } from "./hive-node-style";

export type SavedLayout = {
  id: string;
  name: string;
  shapeId: HiveShapeId;
  customOffsets: Record<string, Vec3>;
  savedAt: number;
};

/** Events from Live Learn that can drive orchestration */
export type LearnOrchEvent =
  | "session_start"
  | "mode_change"
  | "user_turn"
  | "assistant_turn"
  | "session_end";

type HiveEditState = {
  editMode: boolean;
  shapeId: HiveShapeId;
  /** Geometric hex vs galactic star/planet bodies */
  nodeStyle: HiveNodeStyle;
  /** Standard shape phases vs expanded deep-reasoning profiles */
  reasoningDepth: ReasoningDepth;
  deepProfileId: string;
  customOffsets: Record<string, Vec3>;
  selectedNodeId: string | null;
  playOrchestration: boolean;
  /** When true, Learn events advance phases (public “show the process”) */
  liveBindLearn: boolean;
  phaseIndex: number;
  savedLayouts: SavedLayout[];
  setEditMode: (on: boolean) => void;
  toggleEditMode: () => void;
  setShape: (id: HiveShapeId) => void;
  setNodeStyle: (style: HiveNodeStyle) => void;
  setReasoningDepth: (depth: ReasoningDepth) => void;
  setDeepProfileId: (id: string) => void;
  selectNode: (id: string | null) => void;
  setNodeOffset: (id: string, offset: Vec3) => void;
  nudgeNode: (id: string, axis: keyof Vec3, delta: number) => void;
  resetOffsets: () => void;
  resetNode: (id: string) => void;
  setPlayOrchestration: (on: boolean) => void;
  setLiveBindLearn: (on: boolean) => void;
  setPhaseIndex: (i: number) => void;
  nextPhase: (phaseCount: number) => void;
  /** T5 — call from Learn route */
  onLearnEvent: (event: LearnOrchEvent, phaseCountHint?: number) => void;
  saveLayout: (name: string) => SavedLayout | null;
  loadLayout: (id: string) => boolean;
  deleteLayout: (id: string) => void;
  exportLayoutsJson: () => string;
  importLayoutsJson: (raw: string) => { ok: boolean; count: number; error?: string };
  positionsFor: (
    workspaces: HiveNode[],
    skills: HiveNode[],
    industries: HiveNode[],
  ) => Record<string, Vec3>;
  phasesFor: (
    workspaces: HiveNode[],
    skills: HiveNode[],
    industries: HiveNode[],
  ) => ReasoningPhase[];
  edgesFor: (
    workspaces: HiveNode[],
    skills: HiveNode[],
    industries: HiveNode[],
  ) => OrchestrationEdge[];
  /** Active full simulation (skills + beats) for Play orchestration */
  scenarioFor: (
    workspaces: HiveNode[],
    skills: HiveNode[],
    industries: HiveNode[],
  ) => OrchScenario;
  scenarioStepFor: (
    workspaces: HiveNode[],
    skills: HiveNode[],
    industries: HiveNode[],
  ) => OrchSimStep | null;
  scenarioSkillsFor: (
    workspaces: HiveNode[],
    skills: HiveNode[],
    industries: HiveNode[],
  ) => ReturnType<typeof skillTitlesForStep>;
};

const MAX_SAVED = 24;

export const useHiveEditStore = create<HiveEditState>()(
  persist(
    (set, get) => ({
      editMode: false,
      // Honeycomb is the light default; Helix/Spine available in Edit (GPU-friendly cold start)
      shapeId: "honeycomb",
      nodeStyle: "geometric",
      reasoningDepth: "standard",
      deepProfileId: "cosmic-claim",
      customOffsets: {},
      selectedNodeId: null,
      playOrchestration: false,
      /** Off by default so cold load stays responsive; Learn can still opt-in */
      liveBindLearn: false,
      phaseIndex: 0,
      savedLayouts: [],

      setEditMode(on) {
        set({
          editMode: on,
          playOrchestration: on ? get().playOrchestration : get().playOrchestration,
        });
      },
      toggleEditMode() {
        set((s) => ({ editMode: !s.editMode }));
      },
      setShape(id) {
        set({ shapeId: id, phaseIndex: 0 });
      },
      setNodeStyle(style) {
        set({ nodeStyle: style === "galactic" ? "galactic" : "geometric" });
      },
      setReasoningDepth(depth) {
        set({
          reasoningDepth: depth === "deep" ? "deep" : "standard",
          phaseIndex: 0,
        });
      },
      setDeepProfileId(id) {
        set({ deepProfileId: id || "cosmic-claim", phaseIndex: 0 });
      },
      selectNode(id) {
        set({ selectedNodeId: id });
      },
      setNodeOffset(id, offset) {
        set((s) => ({
          customOffsets: { ...s.customOffsets, [id]: offset },
        }));
      },
      nudgeNode(id, axis, delta) {
        const cur = get().customOffsets[id] ?? { x: 0, y: 0, z: 0 };
        get().setNodeOffset(id, { ...cur, [axis]: cur[axis] + delta });
      },
      resetOffsets() {
        set({ customOffsets: {}, selectedNodeId: null });
      },
      resetNode(id) {
        set((s) => {
          const next = { ...s.customOffsets };
          delete next[id];
          return { customOffsets: next };
        });
      },
      setPlayOrchestration(on) {
        set({ playOrchestration: on, phaseIndex: on ? 0 : get().phaseIndex });
      },
      setLiveBindLearn(on) {
        set({ liveBindLearn: on });
      },
      setPhaseIndex(i) {
        set({ phaseIndex: Math.max(0, i) });
      },
      nextPhase(phaseCount) {
        if (phaseCount <= 0) return;
        set((s) => ({ phaseIndex: (s.phaseIndex + 1) % phaseCount }));
      },
      onLearnEvent(event, phaseCountHint = 4) {
        const s = get();
        if (!s.liveBindLearn) return;
        // Auto-enable light orchestration when Learn is driving
        if (!s.playOrchestration && event !== "session_end") {
          set({ playOrchestration: true });
        }
        const n = Math.max(1, phaseCountHint);
        if (event === "session_start") {
          set({ phaseIndex: 0, playOrchestration: true });
          return;
        }
        if (event === "mode_change" || event === "user_turn") {
          get().nextPhase(n);
          return;
        }
        if (event === "assistant_turn") {
          // Soft pulse: stay on phase or nudge every other turn via next
          get().nextPhase(n);
          return;
        }
        if (event === "session_end") {
          set({ playOrchestration: false });
        }
      },
      saveLayout(name) {
        const trimmed = (name || "").trim().slice(0, 48);
        if (!trimmed) return null;
        const layout: SavedLayout = {
          id: `lay-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          name: trimmed,
          shapeId: get().shapeId,
          customOffsets: { ...get().customOffsets },
          savedAt: Date.now(),
        };
        set((s) => ({
          savedLayouts: [layout, ...s.savedLayouts].slice(0, MAX_SAVED),
        }));
        return layout;
      },
      loadLayout(id) {
        const lay = get().savedLayouts.find((l) => l.id === id);
        if (!lay) return false;
        set({
          shapeId: lay.shapeId,
          customOffsets: { ...lay.customOffsets },
          phaseIndex: 0,
        });
        return true;
      },
      deleteLayout(id) {
        set((s) => ({
          savedLayouts: s.savedLayouts.filter((l) => l.id !== id),
        }));
      },
      exportLayoutsJson() {
        return JSON.stringify(
          {
            v: 1,
            exportedAt: new Date().toISOString(),
            active: {
              shapeId: get().shapeId,
              customOffsets: get().customOffsets,
            },
            savedLayouts: get().savedLayouts,
          },
          null,
          2,
        );
      },
      importLayoutsJson(raw) {
        try {
          const data = JSON.parse(raw) as {
            savedLayouts?: SavedLayout[];
            active?: { shapeId?: HiveShapeId; customOffsets?: Record<string, Vec3> };
          };
          const incoming = Array.isArray(data.savedLayouts) ? data.savedLayouts : [];
          const cleaned: SavedLayout[] = [];
          for (const item of incoming) {
            if (!item || typeof item !== "object") continue;
            if (typeof item.id !== "string" || typeof item.name !== "string") continue;
            if (typeof item.shapeId !== "string") continue;
            cleaned.push({
              id: item.id,
              name: String(item.name).slice(0, 48),
              shapeId: item.shapeId as HiveShapeId,
              customOffsets:
                item.customOffsets && typeof item.customOffsets === "object"
                  ? item.customOffsets
                  : {},
              savedAt: typeof item.savedAt === "number" ? item.savedAt : Date.now(),
            });
          }
          set((s) => ({
            savedLayouts: [...cleaned, ...s.savedLayouts].slice(0, MAX_SAVED),
            ...(data.active?.shapeId
              ? {
                  shapeId: data.active.shapeId,
                  customOffsets: data.active.customOffsets ?? s.customOffsets,
                }
              : {}),
          }));
          return { ok: true, count: cleaned.length };
        } catch (e) {
          return {
            ok: false,
            count: 0,
            error: e instanceof Error ? e.message : "Invalid JSON",
          };
        }
      },
      positionsFor(workspaces, skills, industries) {
        return computeLayoutPositions(
          get().shapeId,
          workspaces,
          skills,
          industries,
          get().customOffsets,
        );
      },
      scenarioFor(_workspaces, _skills, _industries) {
        return pickScenario(get().shapeId, get().reasoningDepth);
      },
      phasesFor(workspaces, skills, industries) {
        // Full scenario binding — real skills + desks, not round-robin lights
        const scenario = pickScenario(get().shapeId, get().reasoningDepth);
        if (scenario.steps.length > 0) {
          return buildScenarioPhases(scenario, workspaces, skills, industries);
        }
        if (get().reasoningDepth === "deep") {
          return buildDeepPhases(
            get().deepProfileId,
            workspaces,
            skills,
            industries,
          );
        }
        return buildPhasesForShape(
          get().shapeId,
          workspaces,
          skills,
          industries,
        );
      },
      edgesFor(workspaces, skills, industries) {
        const scenario = pickScenario(get().shapeId, get().reasoningDepth);
        const phases = get().phasesFor(workspaces, skills, industries);
        if (scenario.steps.length > 0) {
          return buildScenarioEdges(scenario, phases);
        }
        return buildOrchestrationEdges(phases);
      },
      scenarioStepFor(workspaces, skills, industries) {
        const scenario = pickScenario(get().shapeId, get().reasoningDepth);
        return getScenarioStep(scenario, get().phaseIndex);
      },
      scenarioSkillsFor(workspaces, skills, industries) {
        const step = get().scenarioStepFor(workspaces, skills, industries);
        if (!step) return [];
        return skillTitlesForStep(step, skills);
      },
    }),
    {
      name: "grok-tutor-hive-edit-v3",
      partialize: (s) => ({
        shapeId: s.shapeId,
        nodeStyle: s.nodeStyle,
        reasoningDepth: s.reasoningDepth,
        deepProfileId: s.deepProfileId,
        customOffsets: s.customOffsets,
        savedLayouts: s.savedLayouts,
        liveBindLearn: s.liveBindLearn,
      }),
    },
  ),
);

export { HIVE_SHAPES, getShapeDef };
