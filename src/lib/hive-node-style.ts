/**
 * Hive node visual styles — geometric (hex) vs galactic (dimensional bodies).
 * Galactic sizing tracks how much clear thinking depends on holding that node
 * at its priority level (workspaces highest, then industries, then skills).
 */

export type HiveNodeStyle = "geometric" | "galactic";

export type GalacticBodyKind =
  | "star" // multi-surface core + corona
  | "planet" // globe + optional ring facets
  | "moon" // compact polyhedron
  | "nebula-seed"; // soft multi-shell

export type NodePriorityKind = "workspace" | "skill" | "industry";

export const NODE_STYLE_META: Record<
  HiveNodeStyle,
  { label: string; blurb: string }
> = {
  geometric: {
    label: "Geometric",
    blurb: "Classic honeycomb hex bodies — crisp craft field.",
  },
  galactic: {
    label: "Galactic",
    blurb:
      "Dimensional globes & multi-surface bodies. Size tracks thinking priority. Names live in the hover panel — not stacked cards.",
  },
};

/**
 * How much clear thinking relies on holding this node.
 * 0..1 — drives galactic scale (not random uniform sizes).
 */
export function thinkingPriority(
  kind: NodePriorityKind,
  index: number,
  totalInKind: number,
  opts?: { enabled?: boolean },
): number {
  const n = Math.max(1, totalInKind);
  // Earlier indices slightly higher (core tools / primary desks first)
  const rank = 1 - index / n;
  let base: number;
  if (kind === "workspace") {
    // Primary desks — highest reliance
    base = 0.78 + rank * 0.2;
  } else if (kind === "industry") {
    // Domain lenses — mid
    base = 0.42 + rank * 0.28;
  } else {
    // Skills — supporting tools; still meaningful but smaller bodies
    base = 0.22 + rank * 0.32;
  }
  if (opts?.enabled === false) base *= 0.55;
  return Math.min(1, Math.max(0.12, base));
}

/** Map priority → mesh scale multiplier (non-uniform field) */
export function priorityBodyScale(priority: number): number {
  const p = Math.min(1, Math.max(0, priority));
  // Moons ~0.5×, core stars ~1.35×
  return 0.48 + p * 0.9;
}

/** Map hive node kind → galactic body class (with variety by index) */
export function galacticBodyForNode(
  kind: NodePriorityKind,
  index = 0,
  priority = 0.5,
): GalacticBodyKind {
  if (kind === "workspace") return "star";
  if (kind === "industry") {
    if (priority > 0.62) return "planet";
    return index % 3 === 0 ? "nebula-seed" : "planet";
  }
  if (priority > 0.48) return "planet";
  return index % 4 === 0 ? "nebula-seed" : "moon";
}

export function galacticRadius(body: GalacticBodyKind, base = 1): number {
  switch (body) {
    case "star":
      return 0.62 * base;
    case "planet":
      return 0.4 * base;
    case "nebula-seed":
      return 0.46 * base;
    case "moon":
    default:
      return 0.24 * base;
  }
}

/**
 * Galactic label policy — avoid messy card stacks on spheres.
 * - high: compact ACR only (no title card)
 * - low: no permanent 3D label (hover HUD carries the name)
 */
export function galacticLabelMode(
  priority: number,
  kind: NodePriorityKind,
): "acr" | "none" {
  if (kind === "workspace") return "acr";
  if (priority >= 0.55) return "acr";
  return "none";
}
