/**
 * Shared 3D packing — minimize collision, maximize readable depth.
 *
 * Design:
 * - Generous XZ spacing so hex bodies never fuse
 * - Strong Y tiers (skills floor → industries mid → workspaces high)
 * - Y-aware deoverlap: same-height nodes need more XZ clearance
 */

/** Workspace (elevated) honeycomb spacing */
export const PACK_WS = 3.15;
/** Skill carpet spacing */
export const PACK_SK = 1.72;
/** Industry mid-band spacing */
export const PACK_IND = 2.55;

/** Vertical tiers — large deltas so perspective reads structure in depth */
export const WS_Y = 2.85;
export const SK_Y = 0.05;
export const IND_Y = 1.35;

/** Extra vertical stagger within a tier (ring index jitter) */
export const WS_Y_JITTER = 0.22;
export const SK_Y_JITTER = 0.12;
export const IND_Y_JITTER = 0.16;

/** Hex body radii (world units) — well under PACK / 2 */
export const GEO_WS_R = 0.68;
export const GEO_SK_R = 0.24;
export const GEO_IND_R = 0.36;

/**
 * Max visual card boost from zoom-out.
 * Modest: field expands via separationScale instead of body growth into neighbors.
 */
export const CARD_FILL_MAX = 1.22;

/**
 * As cards grow slightly, push the field outward so neighbors stay clear.
 */
export function separationScale(cardFillScale: number): number {
  const f = Math.min(CARD_FILL_MAX, Math.max(0.85, cardFillScale || 1));
  return 0.94 + f * 0.16;
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
): number {
  const r = (k: string) =>
    k === "workspace" ? GEO_WS_R : k === "industry" ? GEO_IND_R : GEO_SK_R;
  const dy = Math.abs(yA - yB);
  // Same-height: full pad. Large Y delta: allow closer footprints (stacked in plan, clear in elev)
  const yRelief = Math.min(1, dy / 1.6);
  const pad = 0.32 * (1 - yRelief * 0.62);
  const fill = Math.min(CARD_FILL_MAX, Math.max(1, cardFill));
  return (r(kindA) + r(kindB) + pad) * fill;
}

export type DeoverlapOpts = {
  cardFill?: number;
  iterations?: number;
  /** Node ids that keep X/Z fixed (e.g. vertical spine column) */
  lockXZ?: Set<string> | string[];
  /** Only push along X (ribs) — keeps vertical stacks clean */
  axis?: "xz" | "x" | "z";
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
        );
        if (dist >= need) continue;
        const push = ((need - dist) / 2) * 1.08;
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
  if (kind === "workspace") return 0.92; // slightly inward / elevated core
  if (kind === "industry") return 1.08;
  return 1.18; // skills outer
}
