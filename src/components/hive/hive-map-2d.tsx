/**
 * 2D Hive map — full comb field with reasoning-shape positions.
 * This is the accessible product surface: same shapes, desks, phases, and
 * orchestration as 3D, without WebGL. Designed for basic hardware first.
 * Learner sector layers paint short-label cards. Door stays the three
 * first-slice combs. All paints the 27 covered cards at once.
 * Layer switch does not open /demo or /explore.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { HiveNode } from "@/lib/tutor-hive-map";
import type { Vec3 } from "@/lib/hive-layout-shapes";
import {
  ALL_LAYER,
  ALL_LAYER_ID,
  DOOR_LAYER_ID,
  MAP_SECTOR_LAYERS,
  cardsForLayer,
  industryIdFromMapCard,
  isMapLayerCardId,
  mapCardNodesForLayer,
  mapCardPositions,
  type MapLayerId,
} from "@/lib/map-2d-layers";
import {
  layoutTier,
  mapBoardSize,
  type HiveLayoutTier,
} from "@/lib/hive-viewport";
import { cn } from "@/lib/utils";

/** Keep local — do not import tutor-hive3d (pulls three.js into Map path). */
export type MapFlowEdge = {
  from: string;
  to: string;
  kind?: "flow" | "gate" | "sense" | "deliver";
};

type Props = {
  workspaces: HiveNode[];
  skills: HiveNode[];
  industries: HiveNode[];
  positions: Record<string, Vec3>;
  phaseNodeIds: string[];
  /** Orchestration / reasoning edges projected onto the map */
  flowEdges?: MapFlowEdge[];
  selectedNodeId: string | null;
  openIds: string[];
  editMode: boolean;
  /** User zoom 0.55–1.6 — multiplies board fill scale */
  scale?: number;
  shapeId?: string;
  qualityTier?: string;
  note?: string | null;
  /** Learner may switch sector layers. Off in Edit / examples. */
  learnerLayers?: boolean;
  onSelect: (node: HiveNode) => void;
  onHover?: (node: HiveNode | null) => void;
};

/** Project 3D layout (x,z) onto a 2D board; y becomes slight size accent. */
function project(
  pos: Vec3 | undefined,
  index: number,
  total: number,
  /** How much of the board the field uses (0.7–0.96) — higher = less dead space */
  fieldSpan: number,
  /** All-layer inset keeps 27 cards above the layer switcher. */
  inset?: { leftMin: number; leftMax: number; topMin: number; topMax: number },
): { left: number; top: number; sizeBoost: number; elev: number } {
  const leftMin = inset?.leftMin ?? 4;
  const leftMax = inset?.leftMax ?? 96;
  const topMin = inset?.topMin ?? 6;
  const topMax = inset?.topMax ?? 94;
  if (pos) {
    // Wider fieldSpan on large screens / zoom-out fills sides
    const span = 50 * fieldSpan;
    const left = 50 + pos.x * (span / 9.5);
    const top = 50 + pos.z * (span / 9.5);
    const elev = Math.min(1, Math.abs(pos.y || 0) / 4);
    const sizeBoost = 1 + Math.min(0.2, Math.abs(pos.y || 0) * 0.04);
    return {
      left: Math.min(leftMax, Math.max(leftMin, left)),
      top: Math.min(topMax, Math.max(topMin, top)),
      sizeBoost,
      elev,
    };
  }
  const a = (index / Math.max(1, total)) * Math.PI * 2 - Math.PI / 2;
  const r = 22 + (index % 5) * 3.5;
  return {
    left: 50 + Math.cos(a) * r * (fieldSpan / 0.85),
    top: 50 + Math.sin(a) * r * 0.72 * (fieldSpan / 0.85),
    sizeBoost: 1,
    elev: 0,
  };
}

export function HiveMap2D({
  workspaces,
  skills,
  industries,
  positions,
  phaseNodeIds,
  flowEdges = [],
  selectedNodeId,
  openIds,
  editMode,
  scale = 1,
  shapeId,
  qualityTier,
  note,
  learnerLayers = false,
  onSelect,
  onHover,
}: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [tier, setTier] = useState<HiveLayoutTier>("desktop");
  const [board, setBoard] = useState({ width: 800, height: 480, combScale: 1 });
  const [layerId, setLayerId] = useState<MapLayerId>(DOOR_LAYER_ID);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const t = layoutTier(rect.width, rect.height);
      setTier(t);
      setBoard(mapBoardSize(rect.width, rect.height, t));
    };
    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const sectorCards = useMemo(
    () => (learnerLayers ? mapCardNodesForLayer(layerId) : []),
    [learnerLayers, layerId],
  );
  const sectorPositions = useMemo(
    () => (learnerLayers ? mapCardPositions(cardsForLayer(layerId)) : {}),
    [learnerLayers, layerId],
  );
  const paintDoor = !learnerLayers || layerId === DOOR_LAYER_ID;
  const paintAll = learnerLayers && layerId === ALL_LAYER_ID;
  const all = useMemo(
    () => (paintDoor ? [...workspaces, ...industries, ...skills] : sectorCards),
    [paintDoor, workspaces, industries, skills, sectorCards],
  );
  const layoutPositions = useMemo(
    () => (paintDoor ? positions : { ...positions, ...sectorPositions }),
    [paintDoor, positions, sectorPositions],
  );
  const phaseSet = new Set(phaseNodeIds);
  const openSet = new Set(openIds);

  // Zoom-out (scale < 1) → expand field span + comb size to kill gutters
  // Zoom-in → slightly denser center. All uses a tighter span so 27 cards
  // stay on the board and above the layer switcher.
  const fieldSpan = paintAll
    ? Math.min(0.86, Math.max(0.64, 0.72 + (1 - scale) * 0.22))
    : Math.min(0.96, Math.max(0.72, 0.82 + (1 - scale) * 0.28));
  const combPx =
    board.combScale * scale * (tier === "phone" ? 1.08 : 1) * (paintAll ? 0.72 : 1);
  const projectInset = useMemo(
    () =>
      paintAll ? { leftMin: 6, leftMax: 94, topMin: 8, topMax: 78 } : undefined,
    [paintAll],
  );

  const projected = useMemo(() => {
    const map = new Map<
      string,
      { left: number; top: number; sizeBoost: number; elev: number; node: HiveNode }
    >();
    all.forEach((n, i) => {
      map.set(n.id, {
        ...project(layoutPositions[n.id], i, all.length, fieldSpan, projectInset),
        node: n,
      });
    });
    return map;
  }, [all, layoutPositions, fieldSpan, projectInset]);

  const edgePaths = useMemo(() => {
    if (!flowEdges.length) return [] as { key: string; d: string; kind: string }[];
    return flowEdges
      .map((e, i) => {
        const a = projected.get(e.from);
        const b = projected.get(e.to);
        if (!a || !b) return null;
        // Quadratic curve for a soft “flow” feel without WebGL
        const mx = (a.left + b.left) / 2;
        const my = (a.top + b.top) / 2 - 6;
        return {
          key: `${e.from}-${e.to}-${i}`,
          d: `M ${a.left} ${a.top} Q ${mx} ${my} ${b.left} ${b.top}`,
          kind: e.kind || "flow",
        };
      })
      .filter(Boolean) as { key: string; d: string; kind: string }[];
  }, [flowEdges, projected]);

  return (
    <div
      ref={shellRef}
      className={cn(
        "hive-map-2d",
        `is-${tier}`,
        learnerLayers && "has-layers",
        paintAll && "is-all-layer",
      )}
      data-testid="hive-map-2d"
      data-tier={tier}
      data-quality={qualityTier || "balanced"}
      data-shape={shapeId || "honeycomb"}
      data-map-layer={learnerLayers ? layerId : undefined}
      data-map-cards={String(all.length)}
      style={
        {
          ["--map-comb-scale" as string]: String(combPx),
          ["--map-field-span" as string]: String(fieldSpan),
        } as CSSProperties
      }
    >
      <div className="hive-map-2d-lattice" aria-hidden />
      <div className="hive-map-2d-bloom" aria-hidden />

      {learnerLayers ? (
        <div
          className="hive-map-2d-layers"
          data-testid="hive-map-layers"
          role="radiogroup"
          aria-label="Sector layers"
        >
          <button
            type="button"
            role="radio"
            aria-checked={layerId === DOOR_LAYER_ID}
            className={cn(layerId === DOOR_LAYER_ID && "is-on")}
            data-map-layer-id={DOOR_LAYER_ID}
            onClick={() => setLayerId(DOOR_LAYER_ID)}
          >
            Door
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={layerId === ALL_LAYER_ID}
            className={cn(layerId === ALL_LAYER_ID && "is-on")}
            data-map-layer-id={ALL_LAYER_ID}
            style={{ ["--layer-c" as string]: ALL_LAYER.color }}
            onClick={() => setLayerId(ALL_LAYER_ID)}
          >
            {ALL_LAYER.label}
          </button>
          {MAP_SECTOR_LAYERS.map((layer) => (
            <button
              key={layer.id}
              type="button"
              role="radio"
              aria-checked={layerId === layer.id}
              className={cn(layerId === layer.id && "is-on")}
              data-map-layer-id={layer.id}
              style={{ ["--layer-c" as string]: layer.color }}
              onClick={() => setLayerId(layer.id)}
            >
              {layer.label}
            </button>
          ))}
        </div>
      ) : null}

      <div
        className="hive-map-2d-board"
        style={{
          width: board.width,
          height: board.height,
          // User zoom scales content inside filled board (not leaving empty sides)
          transform: `scale(${Math.min(1.05, Math.max(0.92, 0.96 + (scale - 1) * 0.15))})`,
        }}
        role="list"
        aria-label="Hive map — tap a comb"
      >
        {edgePaths.length > 0 ? (
          <svg
            className="hive-map-2d-edges"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            {edgePaths.map((e) => (
              <path
                key={e.key}
                className={cn("hive-map-2d-edge", `is-${e.kind}`)}
                d={e.d}
                fill="none"
              />
            ))}
          </svg>
        ) : null}

        {[...projected.values()].map(({ node: n, left, top, sizeBoost, elev }) => {
          const inPhase = phaseSet.has(n.id);
          const isOpen = openSet.has(n.id);
          const isSel = selectedNodeId === n.id;
          return (
            <button
              key={n.id}
              type="button"
              role="listitem"
              className={cn(
                "hive-map-2d-comb",
                n.kind,
                n.id.startsWith("lesson:") && "lesson",
                isMapLayerCardId(n.id) && "map-card",
                inPhase && "is-phase",
                isOpen && "is-open",
                isSel && "is-selected",
                editMode && "is-edit",
              )}
              style={
                {
                  left: `${left}%`,
                  top: `${top}%`,
                  ["--c" as string]: n.color,
                  ["--comb-boost" as string]: String(sizeBoost),
                  ["--elev" as string]: String(elev),
                  zIndex: isSel ? 5 : inPhase ? 4 : isOpen ? 3 : 1,
                } as CSSProperties
              }
              title={n.description}
              aria-label={
                isMapLayerCardId(n.id)
                  ? n.acr
                  : n.meta
                    ? n.meta
                    : `${n.acr} ${n.title}`
              }
              data-map-card={isMapLayerCardId(n.id) ? industryIdFromMapCard(n.id) : undefined}
              data-card-label={isMapLayerCardId(n.id) ? n.acr : undefined}
              onClick={() => onSelect(n)}
              onMouseEnter={() => onHover?.(n)}
              onMouseLeave={() => onHover?.(null)}
              onFocus={() => onHover?.(n)}
              onBlur={() => onHover?.(null)}
            >
              <span className="hive-map-2d-comb-face" aria-hidden />
              <span className="acr">{n.acr}</span>
              <span className="ttl">{n.title}</span>
            </button>
          );
        })}
      </div>

      <div className="hive-map-2d-footer">
        {shapeId ? (
          <span className="hive-map-2d-shape" title="Active reasoning shape">
            Shape · {shapeId}
          </span>
        ) : null}
        {qualityTier ? (
          <span className="hive-map-2d-tier" title="Auto quality for this machine">
            {qualityTier} · map-first
          </span>
        ) : null}
      </div>
      {note ? <p className="hive-map-2d-note">{note}</p> : null}
    </div>
  );
}
