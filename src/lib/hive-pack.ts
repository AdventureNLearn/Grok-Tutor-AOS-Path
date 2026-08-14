/**
 * Shared 3D packing — minimize collision, maximize readable depth.
 *
 * Design:
 * - Generous XZ spacing so hex / galactic bodies never fuse
 * - Strong Y tiers (skills floor → industries mid → workspaces high)
 * - Y-aware deoverlap: same-height nodes need more XZ clearance
 * - Optional per-node radii (galactic corona + priority scale)
 */

/** Workspace (elevated) honeycomb spacing */
export const PACK_WS = 3.55;
/** Skill carpet spacing — was 1.72; tight for galactic moons */
export const PACK_SK = 2.05;
/** Industry mid-band spacing */
export const PACK_IND = 2.95;

/** Extra spacing multiplier when node style is galactic */
export const GALACTIC_PACK_BOOST = 1.22;

/** Vertical tiers — large deltas so perspective reads structure in depth */
export const WS_Y = 3.05;
export const SK_Y = 0.05;
export const IND_Y = 1.45;

/** Extra vertical stagger within a tier (ring index jitter) */
export const WS_Y_JITTER = 0.28;
export const SK_Y_JITTER = 0.14;
export const IND_Y_JITTER = 0.18;

/** Hex body radii (world units) — well under PACK / 2 */
export const GEO_WS_R = 0.68;
export const GEO_SK_R = 0.24;
export const GEO_IND_R = 0.36;

/**
 * Max visual card boost from zoom-out.
 * Modest: field expands via separationScale instead of body growth into neighbors.
 */
export const CARD_FILL_MAX = 1.18;

/**
 * As cards grow slightly, push the field outward so neighbors stay clear.
 */
export function separationScale(cardFillScale: number): number {
  const f = Math.min(CARD_FILL_MAX, Math.max(0.85, cardFillScale || 1));
  return 0.96 + f * 0.18;
}

export function defaultRadius(kind: "workspace" | "skill" | "industry"): number {
  if (kind === "workspace") return GEO_WS_R;
  if (kind === "industry") return GEO_IND_R;
  return GEO_SK_R;
}

/**
 * Minimum XZ center distance. Nodes far apart in Y need less XZ clearance
 * (they already separate in depth when viewed obliquely).
 */
export function minCenterDistance(
  kindA: "workspace" | "skill" | "industry",
  kindB: "workspace" | "skill" | "industry",
  cardFill = 1,
  yA = 0,
  yB = 0,
  radiusA?: number,
  radiusB?: number,
): number {
  const ra = radiusA ?? defaultRadius(kindA);
  const rb = radiusB ?? defaultRadius(kindB);
  const dy = Math.abs(yA - yB);
  // Same-height: full pad. Large Y delta: allow closer footprints
  const yRelief = Math.min(1, dy / 1.8);
  const pad = 0.42 * (1 - yRelief * 0.55);
  const fill = Math.min(CARD_FILL_MAX, Math.max(1, cardFill));
  return (ra + rb + pad) * fill;
}

export type DeoverlapOpts = {
  cardFill?: number;
  iterations?: number;
  /** Node ids that keep X/Z fixed (e.g. vertical spine column) */
  lockXZ?: Set<string> | string[];
  /** Only push along X (ribs) — keeps vertical stacks clean */
  axis?: "xz" | "x" | "z";
  /** Per-node collision radius (galactic scale + shells). Falls back to GEO_* by kind. */
  radii?: Record<string, number>;
  /** Uniform pack boost (e.g. GALACTIC_PACK_BOOST applied as extra push strength) */
  pushBias?: number;
};

/**
 * Soft de-overlap in XZ, Y-aware. Mutates positions. O(n²) fine for <100 nodes.
 */
export function deoverlapPositions(
  positions: Record<string, { x: number; y: number; z: number }>,
  kinds: Record<string, "workspace" | "skill" | "industry">,
  cardFillOrOpts: number | DeoverlapOpts = 1,
  iterationsArg = 5,
): void {
  const opts: DeoverlapOpts =
    typeof cardFillOrOpts === "number"
      ? { cardFill: cardFillOrOpts, iterations: iterationsArg }
      : cardFillOrOpts;
  const cardFill = opts.cardFill ?? 1;
  const iterations = opts.iterations ?? 5;
  const pushBias = opts.pushBias ?? 1.08;
  const lock = new Set(
    opts.lockXZ
      ? Array.isArray(opts.lockXZ)
        ? opts.lockXZ
        : [...opts.lockXZ]
      : [],
  );
  const axis = opts.axis ?? "xz";
  const ids = Object.keys(positions);
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = ids[i]!;
        const b = ids[j]!;
        const pa = positions[a];
        const pb = positions[b];
        if (!pa || !pb) continue;
        let dx = axis === "z" ? 0 : pb.x - pa.x;
        let dz = axis === "x" ? 0 : pb.z - pa.z;
        const dist = Math.hypot(dx, dz) || 0.0001;
        const need = minCenterDistance(
          kinds[a] || "skill",
          kinds[b] || "skill",
          cardFill,
          pa.y,
          pb.y,
          opts.radii?.[a],
          opts.radii?.[b],
        );
        if (dist >= need) continue;
        const push = ((need - dist) / 2) * pushBias;
        const nx = dx / dist;
        const nz = dz / dist;
        const aLock = lock.has(a);
        const bLock = lock.has(b);
        if (aLock && bLock) continue;
        if (!aLock && !bLock) {
          pa.x -= nx * push;
          pa.z -= nz * push;
          pb.x += nx * push;
          pb.z += nz * push;
        } else if (aLock) {
          pb.x += nx * push * 2;
          pb.z += nz * push * 2;
        } else {
          pa.x -= nx * push * 2;
          pa.z -= nz * push * 2;
        }
      }
    }
  }
}

/**
 * Nudge tiers slightly outward in XZ so layers form concentric rings in plan
 * while Y provides the main depth read.
 */
export function tierRadialBias(
  kind: "workspace" | "skill" | "industry",
): number {
  if (kind === "workspace") return 0.9; // elevated core
  if (kind === "industry") return 1.12;
  return 1.28; // skills outer — more room for small moons
}

/** Pack spacing for a style (geometric vs galactic) */
export function packSpacing(
  kind: "workspace" | "skill" | "industry",
  style: "geometric" | "galactic" = "geometric",
): number {
  const base =
    kind === "workspace" ? PACK_WS : kind === "industry" ? PACK_IND : PACK_SK;
  return style === "galactic" ? base * GALACTIC_PACK_BOOST : base;
}
