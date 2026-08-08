/**
 * Workspace edit panel — shapes, node nudges, orchestration, saved layouts (T4).
 */
import { useRef, useState } from "react";
import {
  Box,
  ChevronRight,
  Download,
  Layers3,
  Pause,
  Play,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DEEP_REASONING_PROFILES,
  HIVE_SHAPES,
  NODE_STYLE_META,
  getShapeDef,
  useHiveEditStore,
} from "@/lib/hive-edit-store";
import type { HiveNode } from "@/lib/tutor-hive-map";
import type { ReasoningPhase } from "@/lib/hive-layout-shapes";

type Props = {
  workspaces: HiveNode[];
  skills: HiveNode[];
  industries: HiveNode[];
  phases: ReasoningPhase[];
  className?: string;
};

export function HiveEditPanel({
  workspaces,
  skills,
  industries,
  phases,
  className,
}: Props) {
  const editMode = useHiveEditStore((s) => s.editMode);
  const shapeId = useHiveEditStore((s) => s.shapeId);
  const nodeStyle = useHiveEditStore((s) => s.nodeStyle);
  const reasoningDepth = useHiveEditStore((s) => s.reasoningDepth);
  const deepProfileId = useHiveEditStore((s) => s.deepProfileId);
  const selectedNodeId = useHiveEditStore((s) => s.selectedNodeId);
  const customOffsets = useHiveEditStore((s) => s.customOffsets);
  const playOrchestration = useHiveEditStore((s) => s.playOrchestration);
  const liveBindLearn = useHiveEditStore((s) => s.liveBindLearn);
  const phaseIndex = useHiveEditStore((s) => s.phaseIndex);
  const savedLayouts = useHiveEditStore((s) => s.savedLayouts);
  const setEditMode = useHiveEditStore((s) => s.setEditMode);
  const setShape = useHiveEditStore((s) => s.setShape);
  const setNodeStyle = useHiveEditStore((s) => s.setNodeStyle);
  const setReasoningDepth = useHiveEditStore((s) => s.setReasoningDepth);
  const setDeepProfileId = useHiveEditStore((s) => s.setDeepProfileId);
  const selectNode = useHiveEditStore((s) => s.selectNode);
  const nudgeNode = useHiveEditStore((s) => s.nudgeNode);
  const resetOffsets = useHiveEditStore((s) => s.resetOffsets);
  const resetNode = useHiveEditStore((s) => s.resetNode);
  const setPlayOrchestration = useHiveEditStore((s) => s.setPlayOrchestration);
  const setLiveBindLearn = useHiveEditStore((s) => s.setLiveBindLearn);
  const setPhaseIndex = useHiveEditStore((s) => s.setPhaseIndex);
  const saveLayout = useHiveEditStore((s) => s.saveLayout);
  const loadLayout = useHiveEditStore((s) => s.loadLayout);
  const deleteLayout = useHiveEditStore((s) => s.deleteLayout);
  const exportLayoutsJson = useHiveEditStore((s) => s.exportLayoutsJson);
  const importLayoutsJson = useHiveEditStore((s) => s.importLayoutsJson);

  const [layoutName, setLayoutName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!editMode) return null;

  const shape = getShapeDef(shapeId);
  const allNodes = [...workspaces, ...industries, ...skills];
  const selected = allNodes.find((n) => n.id === selectedNodeId) ?? null;
  const offset = selectedNodeId
    ? (customOffsets[selectedNodeId] ?? { x: 0, y: 0, z: 0 })
    : null;
  const activePhase = phases[phaseIndex] ?? phases[0] ?? null;
  const offsetCount = Object.keys(customOffsets).length;

  function onSave() {
    const lay = saveLayout(layoutName || shape.name);
    if (lay) {
      toast.success(`Saved layout “${lay.name}”`);
      setLayoutName("");
    } else {
      toast.message("Enter a layout name");
    }
  }

  function onExport() {
    const json = exportLayoutsJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grok-tutor-hive-layouts-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported layouts JSON");
  }

  function onImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result || "");
      const res = importLayoutsJson(raw);
      if (res.ok) toast.success(`Imported ${res.count} layout(s)`);
      else toast.error(res.error || "Import failed");
    };
    reader.readAsText(file);
  }

  return (
    <aside
      className={cn("hive-edit-panel", className)}
      aria-label="Hive workspace editor"
    >
      <header className="hive-edit-head">
        <div>
          <strong>
            <Layers3 className="inline h-3.5 w-3.5 mr-1" />
            Workspace edit
          </strong>
          <em>Shapes · modeling · orchestration · saved layouts</em>
        </div>
        <button
          type="button"
          className="hive-edit-icon-btn"
          title="Close editor"
          onClick={() => setEditMode(false)}
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <section className="hive-edit-section">
        <h3>Reasoning shape</h3>
        <p className="hive-edit-blurb">{shape.doctrine}</p>
        <div className="hive-edit-shape-grid">
          {HIVE_SHAPES.filter((s) => s.id !== "custom").map((s) => (
            <button
              key={s.id}
              type="button"
              className={cn("hive-edit-shape", shapeId === s.id && "is-on")}
              onClick={() => setShape(s.id)}
            >
              <span className="hive-edit-shape-name">{s.name}</span>
              <span className="hive-edit-shape-tag">{s.tagline}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="hive-edit-section hive-edit-advanced">
        <h3>
          <Sparkles className="inline h-3.5 w-3.5 mr-1" />
          Advanced · learning universe
        </h3>
        <p className="hive-edit-blurb">
          Node look and deep reasoning models. Same desks and shapes — richer sky
          and longer phase paths when you want them.
        </p>
        <p className="hive-edit-subhead">Node style</p>
        <div className="hive-edit-orch-controls">
          {(["geometric", "galactic"] as const).map((st) => (
            <button
              key={st}
              type="button"
              className={cn("hive-edit-pill", nodeStyle === st && "is-on")}
              title={NODE_STYLE_META[st].blurb}
              onClick={() => setNodeStyle(st)}
            >
              {NODE_STYLE_META[st].label}
            </button>
          ))}
        </div>
        <p className="hive-edit-hint">{NODE_STYLE_META[nodeStyle].blurb}</p>
        <p className="hive-edit-subhead">Reasoning depth</p>
        <div className="hive-edit-orch-controls">
          <button
            type="button"
            className={cn(
              "hive-edit-pill",
              reasoningDepth === "standard" && "is-on",
            )}
            onClick={() => setReasoningDepth("standard")}
          >
            Standard
          </button>
          <button
            type="button"
            className={cn("hive-edit-pill", reasoningDepth === "deep" && "is-on")}
            onClick={() => setReasoningDepth("deep")}
          >
            Deep universe
          </button>
        </div>
        {reasoningDepth === "deep" ? (
          <>
            <p className="hive-edit-subhead">Deep profile</p>
            <div className="hive-edit-shape-grid">
              {DEEP_REASONING_PROFILES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={cn(
                    "hive-edit-shape",
                    deepProfileId === p.id && "is-on",
                  )}
                  onClick={() => setDeepProfileId(p.id)}
                >
                  <span className="hive-edit-shape-name">{p.name}</span>
                  <span className="hive-edit-shape-tag">{p.tagline}</span>
                </button>
              ))}
            </div>
            <p className="hive-edit-hint">
              {
                DEEP_REASONING_PROFILES.find((p) => p.id === deepProfileId)
                  ?.universeMetaphor
              }
            </p>
          </>
        ) : (
          <p className="hive-edit-hint">
            Standard uses the active shape’s phase list. Deep expands into a longer
            multi-layer path for expansive models.
          </p>
        )}
      </section>

      <section className="hive-edit-section">
        <h3>
          <Sparkles className="inline h-3.5 w-3.5 mr-1" />
          Orchestration
        </h3>
        <p className="hive-edit-blurb">
          Play runs a full scenario: real skills light up, claims appear, and you
          can open tools to reason with each beat — not just animation.
        </p>
        <div className="hive-edit-orch-controls">
          <button
            type="button"
            className={cn("hive-edit-pill", playOrchestration && "is-on")}
            onClick={() => setPlayOrchestration(!playOrchestration)}
          >
            {playOrchestration ? (
              <>
                <Pause className="h-3.5 w-3.5" /> Pause sim
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" /> Play full scenario
              </>
            )}
          </button>
          <button
            type="button"
            className="hive-edit-pill"
            onClick={() =>
              setPhaseIndex((phaseIndex + 1) % Math.max(1, phases.length))
            }
          >
            Next phase <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <label className="hive-edit-check">
          <input
            type="checkbox"
            checked={liveBindLearn}
            onChange={(e) => setLiveBindLearn(e.target.checked)}
          />
          Live Learn advances phases (show the process)
        </label>
        <ol className="hive-edit-phases">
          {phases.map((p, i) => (
            <li
              key={p.id}
              className={cn(i === phaseIndex && "is-active")}
              style={{ ["--ph" as string]: p.color }}
            >
              <button type="button" onClick={() => setPhaseIndex(i)}>
                <span className="ph-acr">{p.acr}</span>
                <span>
                  <strong>{p.label}</strong>
                  <em>{p.blurb}</em>
                </span>
              </button>
            </li>
          ))}
        </ol>
        {activePhase ? (
          <p className="hive-edit-phase-live">
            Active:{" "}
            <strong style={{ color: activePhase.color }}>{activePhase.label}</strong>
            {" · "}
            {activePhase.nodeIds.length} nodes lit
          </p>
        ) : null}
      </section>

      <section className="hive-edit-section">
        <h3>
          <Save className="inline h-3.5 w-3.5 mr-1" />
          Saved layouts
        </h3>
        <div className="hive-edit-save-row">
          <input
            type="text"
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            placeholder={`Name (e.g. ${shape.name})`}
            className="hive-edit-input"
            maxLength={48}
          />
          <button type="button" className="hive-edit-pill is-on" onClick={onSave}>
            <Save className="h-3.5 w-3.5" /> Save
          </button>
        </div>
        <div className="hive-edit-orch-controls" style={{ marginTop: "0.45rem" }}>
          <button type="button" className="hive-edit-pill" onClick={onExport}>
            <Download className="h-3.5 w-3.5" /> Export JSON
          </button>
          <button
            type="button"
            className="hive-edit-pill"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" /> Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImportFile(f);
              e.target.value = "";
            }}
          />
        </div>
        {savedLayouts.length === 0 ? (
          <p className="hive-edit-empty" style={{ marginTop: "0.5rem" }}>
            No saved layouts yet — save the current shape + offsets.
          </p>
        ) : (
          <ul className="hive-edit-layouts">
            {savedLayouts.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  className="hive-edit-layout-load"
                  onClick={() => {
                    if (loadLayout(l.id)) toast.message(`Loaded “${l.name}”`);
                  }}
                >
                  <strong>{l.name}</strong>
                  <em>{l.shapeId}</em>
                </button>
                <button
                  type="button"
                  className="hive-edit-icon-btn"
                  title="Delete layout"
                  onClick={() => deleteLayout(l.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="hive-edit-section">
        <h3>
          <Box className="inline h-3.5 w-3.5 mr-1" />
          Node modeling
        </h3>
        <p className="hive-edit-blurb">
          Click a comb to select. Nudge X / Y / Z. Offsets stack on the active shape.
        </p>
        {selected && offset ? (
          <div className="hive-edit-node">
            <div className="hive-edit-node-title">
              <span style={{ color: selected.color }}>{selected.acr}</span>
              <strong>{selected.title}</strong>
              <button
                type="button"
                className="hive-edit-link"
                onClick={() => resetNode(selected.id)}
              >
                Reset node
              </button>
            </div>
            {(["x", "y", "z"] as const).map((axis) => (
              <div key={axis} className="hive-edit-axis">
                <span>{axis.toUpperCase()}</span>
                <button type="button" onClick={() => nudgeNode(selected.id, axis, -0.25)}>
                  −
                </button>
                <code>{offset[axis].toFixed(2)}</code>
                <button type="button" onClick={() => nudgeNode(selected.id, axis, 0.25)}>
                  +
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="hive-edit-empty">No node selected — click a comb.</p>
        )}
        <div className="hive-edit-footer-row">
          <span>
            {offsetCount} custom offset{offsetCount === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            className="hive-edit-pill danger"
            onClick={resetOffsets}
            disabled={offsetCount === 0}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset all offsets
          </button>
        </div>
        <button
          type="button"
          className="hive-edit-link"
          onClick={() => selectNode(null)}
        >
          Clear selection
        </button>
      </section>
    </aside>
  );
}
