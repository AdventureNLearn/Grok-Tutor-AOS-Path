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
      "Stars, planets, and moons. Larger bodies = higher thinking priority (desks > crafts > tools). Names live in the hover panel.",
  },
};

/** Plain-language size legend for the Hive HUD */
export const NODE_SIZE_LEGEND = [
  {
    id: "workspace",
    label: "Large · desks",
    body: "star",
    meaning:
      "Primary learning desks (Live session, Samples, Library…). Highest priority — start here.",
  },
  {
    id: "industry",
    label: "Medium · crafts",
    body: "planet",
    meaning:
      "Industry / craft lenses (electrical, nursing, software…). Mid priority — pick a domain.",
  },
  {
    id: "skill",
    label: "Small · tools",
    body: "moon",
    meaning:
      "Thinking tools and supporting skills. Smaller bodies — still useful, open when you need a lens.",
  },
] as const;

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
    // Primary desks — highest reliance (tight band so sizes stay distinct by kind)
    base = 0.82 + rank * 0.14;
  } else if (kind === "industry") {
    // Domain lenses — mid
    base = 0.48 + rank * 0.22;
  } else {
    // Skills — supporting tools
    base = 0.28 + rank * 0.24;
  }
  if (opts?.enabled === false) base *= 0.55;
  return Math.min(1, Math.max(0.16, base));
}

/**
 * Map priority → mesh scale multiplier.
 * Tighter range than before so neighbors do not fuse when packing is dense.
 */
export function priorityBodyScale(priority: number): number {
  const p = Math.min(1, Math.max(0, priority));
  // Moons ~0.62× · core stars ~1.12× (was 0.48–1.38 — caused galactic pile-ups)
  return 0.62 + p * 0.5;
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
      return 0.55 * base;
    case "planet":
      return 0.36 * base;
    case "nebula-seed":
      return 0.4 * base;
    case "moon":
    default:
      return 0.22 * base;
  }
}

/**
 * Extra shell factor for collision (corona / ring / wire sit outside the core).
 * Keep below visual corona (1.38) so packing is conservative without huge gaps.
 */
export function galacticShellFactor(body: GalacticBodyKind): number {
  switch (body) {
    case "star":
      return 1.28;
    case "planet":
      return 1.32; // includes ring band
    case "nebula-seed":
      return 1.22;
    case "moon":
    default:
      return 1.12;
  }
}

/** World-unit collision radius for packing / deoverlap */
export function collisionRadiusForNode(
  kind: NodePriorityKind,
  style: HiveNodeStyle,
  index: number,
  totalInKind: number,
  opts?: { enabled?: boolean; baseMeshScale?: number },
): number {
  const baseMesh = opts?.baseMeshScale ?? 1;
  if (style !== "galactic") {
    // Geometric hex radii (match hive-pack GEO_*)
    const r =
      kind === "workspace" ? 0.68 : kind === "industry" ? 0.36 : 0.24;
    return r * baseMesh;
  }
  const priority = thinkingPriority(kind, index, totalInKind, opts);
  const body = galacticBodyForNode(kind, index, priority);
  const pScale = priorityBodyScale(priority);
  const core = galacticRadius(body);
  return core * pScale * baseMesh * galacticShellFactor(body);
}

/** Short label for hover HUD */
export function sizeMeaningForNode(
  kind: NodePriorityKind,
  priority: number,
): { sizeLabel: string; sizeBlurb: string } {
  if (kind === "workspace") {
    return {
      sizeLabel: "Large · primary desk",
      sizeBlurb:
        "Big bodies are learning desks you open often. Size reflects how central this desk is to a session.",
    };
  }
  if (kind === "industry") {
    return {
      sizeLabel: priority > 0.6 ? "Medium-large · craft" : "Medium · craft",
      sizeBlurb:
        "Craft/industry nodes sit mid-size. They route you into a domain without replacing a full desk.",
    };
  }
  return {
    sizeLabel: priority > 0.45 ? "Small-medium · tool" : "Small · tool",
    sizeBlurb:
      "Smaller bodies are thinking tools. Use them when you need a lens — they support desks and crafts.",
  };
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
