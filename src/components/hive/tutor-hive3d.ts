/**
 * Tutor Hive 3D — cinematic honeycomb field with fit framing + zoom API.
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { HiveNode } from "@/lib/tutor-hive-map";
import {
  cardScaleForZoom,
  fitDistanceForBox,
} from "@/lib/hive-viewport";
import {
  CARD_FILL_MAX,
  GEO_IND_R,
  GEO_SK_R,
  GEO_WS_R,
  IND_Y,
  IND_Y_JITTER,
  SK_Y,
  SK_Y_JITTER,
  WS_Y,
  WS_Y_JITTER,
  packSpacing,
  separationScale,
  tierRadialBias,
} from "@/lib/hive-pack";
import {
  galacticBodyForNode,
  galacticLabelMode,
  galacticRadius,
  priorityBodyScale,
  thinkingPriority,
  type GalacticBodyKind,
  type HiveNodeStyle,
} from "@/lib/hive-node-style";

export type HiveHoverInfo = HiveNode | null;

export type HiveVec3 = { x: number; y: number; z: number };

export type HiveFlowEdge = {
  from: string;
  to: string;
  kind?: "flow" | "gate" | "sense" | "deliver";
};

export type TutorHive3D = {
  setSelected: (id: string | null) => void;
  setOpenIds: (ids: string[]) => void;
  setReasoning: (active: boolean) => void;
  setDeskOpen: (open: boolean) => void;
  /** Apply intelligent shape / custom 3D positions (node id → world xyz) */
  applyLayout: (positions: Record<string, HiveVec3>, animate?: boolean) => void;
  /** Highlight nodes for the active orchestration phase */
  setPhaseNodeIds: (ids: string[]) => void;
  /** Draw reasoning flow edges between nodes */
  setFlowEdges: (edges: HiveFlowEdge[]) => void;
  setEditMode: (on: boolean) => void;
  /** 0.3 = zoomed out, 2.2 = zoomed in relative to fit */
  setZoom: (factor: number) => void;
  getZoom: () => number;
  zoomBy: (delta: number) => void;
  fitAll: () => void;
  dispose: () => void;
};

function hexExtrude(radius = 1, depth = 0.42) {
  const shape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: Math.min(0.05, radius * 0.07),
    bevelSize: Math.min(0.04, radius * 0.05),
    bevelSegments: 2,
    curveSegments: 1,
  });
  geo.rotateX(-Math.PI / 2);
  geo.center();
  return geo;
}

function honeycombPosition(index: number, spacing: number) {
  if (index === 0) return { q: 0, r: 0, x: 0, z: 0 };
  let ring = 1;
  let count = 1;
  while (count + ring * 6 <= index) {
    count += ring * 6;
    ring++;
  }
  const posInRing = index - count;
  const side = Math.floor(posInRing / ring);
  const sidePos = posInRing % ring;
  const dirs: [number, number][] = [
    [1, 0],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [0, -1],
    [1, -1],
  ];
  const sideSafe = ((side % 6) + 6) % 6;
  const dir = dirs[sideSafe] ?? dirs[0]!;
  const dir2 = dirs[(sideSafe + 2) % 6] ?? dirs[0]!;
  let q = dir[0] * ring;
  let r = dir[1] * ring;
  const nq = dir2[0];
  const nr = dir2[1];
  q += nq * sidePos;
  r += nr * sidePos;
  const x = spacing * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const z = spacing * ((3 / 2) * r);
  return { q, r, x, z };
}

function vecFromHoney(
  index: number,
  spacing: number,
  yBase = 0,
  yJitter = 0,
) {
  const h = honeycombPosition(index, spacing);
  const y =
    yBase +
    (yJitter ? ((h.q * 0.05 + h.r * 0.04) % yJitter) - yJitter * 0.35 : 0);
  return new THREE.Vector3(h.x, y, h.z);
}

function ringSkip(ringOffset: number) {
  let skip = 0;
  for (let r = 0; r < ringOffset; r++) skip += r === 0 ? 1 : r * 6;
  return skip;
}

/** Outer carpet — starts after industry ring so nodes never share cells */
function skillFieldPosition(
  index: number,
  style: "geometric" | "galactic" = "geometric",
) {
  return vecFromHoney(
    ringSkip(5) + index,
    packSpacing("skill", style),
    SK_Y,
    SK_Y_JITTER,
  );
}

/** Mid band — clear of elevated workspaces */
function industryFieldPosition(
  index: number,
  style: "geometric" | "galactic" = "geometric",
) {
  return vecFromHoney(
    ringSkip(3) + index,
    packSpacing("industry", style),
    IND_Y,
    IND_Y_JITTER,
  );
}

/** Fit a learner word (Electrical, Plumbing, HVAC) — do not clip to 3-letter codes. */
function fitSpriteText(
  ctx: CanvasRenderingContext2D,
  text: string,
  startPx: number,
  maxWidth: number,
  weight: number | string = "bold",
) {
  let size = startPx;
  ctx.font = `${weight} ${size}px Segoe UI, system-ui, sans-serif`;
  while (size > 14 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px Segoe UI, system-ui, sans-serif`;
  }
}

function makeAcrSprite(
  acr: string,
  color: THREE.Color,
  opts: {
    big?: boolean;
    sub?: string;
    /** Galactic: no card plate — soft glyph only, sits under the body */
    galactic?: boolean;
  } = {},
) {
  const big = !!opts.big;
  const galactic = !!opts.galactic;
  const canvas = document.createElement("canvas");
  canvas.width = galactic ? 256 : big ? 512 : 256;
  canvas.height = galactic ? 128 : big ? 256 : 160;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const col = `#${color.getHexString()}`;

  const label = String(acr || "");
  const sub = opts.sub ? String(opts.sub) : "";

  if (galactic) {
    // Soft industry word under the body — full titles live in the hover HUD
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = col;
    ctx.shadowBlur = 14;
    ctx.fillStyle = col;
    fitSpriteText(ctx, label, 42, 220);
    ctx.fillText(label, 128, 64);
    ctx.shadowBlur = 0;
  } else if (big) {
    ctx.fillStyle = "rgba(6,8,14,0.68)";
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(36, 40, 440, 176, 28);
      ctx.fill();
    } else ctx.fillRect(36, 40, 440, 176);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = col;
    fitSpriteText(ctx, label, 44, 400);
    ctx.fillText(label, 256, 100);
    if (sub) {
      ctx.fillStyle = "#f2f4f8";
      fitSpriteText(ctx, sub, 26, 400, 600);
      ctx.fillText(sub, 256, 160);
    }
  } else {
    ctx.fillStyle = "rgba(6,8,14,0.6)";
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(24, 36, 208, 88, 16);
      ctx.fill();
    } else ctx.fillRect(24, 36, 208, 88);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = col;
    fitSpriteText(ctx, label, 34, 190);
    ctx.fillText(label, 128, 80);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    opacity: galactic ? 0.82 : 1,
  });
  const sprite = new THREE.Sprite(mat);
  if (galactic) {
    sprite.scale.set(0.55, 0.28, 1);
  } else {
    sprite.scale.set(big ? 1.2 : 0.48, big ? 0.6 : 0.3, 1);
  }
  // Labels must not steal raycasts from neighboring hexes
  sprite.raycast = () => {};
  return sprite;
}

/**
 * Dimensional galactic body — multi-surface, not a flat uniform sphere.
 * Stars / planets / moons use different poly + shell combos for depth.
 */
function makeGalacticBodyGeometry(body: GalacticBodyKind): THREE.BufferGeometry {
  const r = galacticRadius(body);
  switch (body) {
    case "star":
      // Faceted star core (icosa) — multi-surface, not smooth ball only
      return new THREE.IcosahedronGeometry(r, 1);
    case "planet":
      // Globe with enough segments to read as a sphere, still has facet light
      return new THREE.IcosahedronGeometry(r, 2);
    case "nebula-seed":
      return new THREE.DodecahedronGeometry(r * 0.95, 0);
    case "moon":
    default:
      return new THREE.OctahedronGeometry(r, 1);
  }
}

/** Soft radial gradient texture for glow discs under hexes */
function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.25, "rgba(255,255,255,0.45)");
  g.addColorStop(0.55, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeQuantumHexMaterial(
  base: THREE.Color,
  dimmed: boolean,
  large: boolean,
  useTransmission = true,
) {
  // Lift mid-tones toward soft lavender-white for a pleasant glass look
  const surface = base.clone().lerp(new THREE.Color("#e8e4ff"), large ? 0.18 : 0.28);
  const emissive = base.clone().lerp(new THREE.Color("#a78bfa"), 0.35);
  if (!useTransmission) {
    // Steady tier: still glass-like, lower GPU cost
    return new THREE.MeshStandardMaterial({
      color: surface,
      emissive,
      emissiveIntensity: dimmed ? 0.25 : large ? 0.5 : 0.65,
      metalness: 0.2,
      roughness: dimmed ? 0.5 : 0.22,
      transparent: true,
      opacity: dimmed ? 0.55 : 0.92,
    });
  }
  return new THREE.MeshPhysicalMaterial({
    color: surface,
    emissive,
    emissiveIntensity: dimmed ? 0.25 : large ? 0.55 : 0.72,
    metalness: dimmed ? 0.25 : 0.15,
    roughness: dimmed ? 0.45 : 0.12,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    sheen: 1,
    sheenRoughness: 0.35,
    sheenColor: new THREE.Color("#c4b5fd").lerp(base, 0.4),
    iridescence: dimmed ? 0.35 : 0.95,
    iridescenceIOR: 1.4,
    iridescenceThicknessRange: [80, 420],
    transmission: dimmed ? 0.08 : large ? 0.22 : 0.35,
    thickness: large ? 0.9 : 0.45,
    transparent: true,
    opacity: dimmed ? 0.55 : large ? 0.92 : 0.88,
    attenuationColor: base.clone().lerp(new THREE.Color("#7c3aed"), 0.2),
    attenuationDistance: 2.5,
    envMapIntensity: 1.2,
    side: THREE.FrontSide,
  });
}

export type Hive3DQuality = {
  pixelRatioCap?: number;
  starFar?: number;
  starMid?: number;
  starNear?: number;
  antialias?: boolean;
  transmission?: boolean;
  nebula?: boolean;
  grid?: boolean;
  powerPreference?: WebGLPowerPreference;
  failIfMajorPerformanceCaveat?: boolean;
};

function makeRenderer(
  canvas: HTMLCanvasElement,
  antialias: boolean,
  powerPreference: WebGLPowerPreference,
  failIfMajorPerformanceCaveat = false,
): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias,
    alpha: false,
    powerPreference,
    failIfMajorPerformanceCaveat,
    // Preserve drawing buffer off = less memory on iGPU
    preserveDrawingBuffer: false,
  });
  const gl = renderer.getContext();
  if (!gl) {
    try {
      renderer.dispose();
    } catch {
      /* ignore */
    }
    throw new Error("WebGL context was not created");
  }
  return renderer;
}

export function createTutorHive3D(
  canvas: HTMLCanvasElement,
  opts: {
    workspaces: HiveNode[];
    skills: HiveNode[];
    industries?: HiveNode[];
    /** Optional initial positions (shape / edit engine) */
    positions?: Record<string, HiveVec3>;
    quality?: Hive3DQuality;
    /** Geometric hex (default) or galactic star/planet bodies */
    nodeStyle?: HiveNodeStyle;
    onHover?: (info: HiveHoverInfo) => void;
    onSelect?: (info: HiveNode) => void;
    onReady?: () => void;
    /** Soft fail — context lost mid-session; host should show map, keep shapes */
    onContextLost?: (reason: string) => void;
  },
): TutorHive3D {
  const q = opts.quality ?? {};
  const pixelCap = q.pixelRatioCap ?? 1.5;
  const useAA = q.antialias === true; // default OFF unless tier asks
  const useTx = q.transmission === true; // physical glass only when tier allows
  const starFarN = Math.max(0, q.starFar ?? 0);
  const starMidN = Math.max(0, q.starMid ?? 0);
  const starNearN = Math.max(0, q.starNear ?? 0);
  const useNebula = q.nebula === true;
  const useGrid = q.grid !== false;
  const powerPref: WebGLPowerPreference = q.powerPreference ?? "default";
  const caveat = q.failIfMajorPerformanceCaveat === true;
  const nodeStyle: HiveNodeStyle =
    opts.nodeStyle === "galactic" ? "galactic" : "geometric";
  const isGalactic = nodeStyle === "galactic";
  // Accessible / steady: skip expensive galactic multi-mesh shells
  const lightGalactic = isGalactic && (starFarN + starMidN + starNearN) > 80;

  const scene = new THREE.Scene();
  // Deep quantum void — fog strengthens depth read (near sharp, far soft)
  scene.background = new THREE.Color(0x05020f);
  // Slightly softer fog in galactic mode so the field feels like deep space
  scene.fog = new THREE.FogExp2(0x080414, isGalactic ? 0.011 : 0.0145);

  // Wider FOV = stronger perspective foreshortening so structure reads in depth
  const camera = new THREE.PerspectiveCamera(48, 1, 0.12, 220);
  // Oblique start: high enough to see tiers, far enough for perspective
  camera.position.set(6.5, 9.5, 18.5);

  // Honor quality powerPreference first. If the tier asked for a caveat check,
  // do not retry without it — that path GPU-crashed this host.
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = makeRenderer(canvas, useAA, powerPref, caveat);
  } catch {
    if (caveat) throw new Error("WebGL declined on this machine — map view stays available.");
    try {
      renderer = makeRenderer(canvas, false, "default", false);
    } catch {
      renderer = makeRenderer(canvas, false, "low-power", false);
    }
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelCap));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // ACES is nice but costly on iGPU — keep simple tone map when no transmission
  if (useTx) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
  } else {
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1;
  }

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.minDistance = 6;
  controls.maxDistance = 52;
  // Allow more tilt so operator can study structure from the side / three-quarter
  controls.minPolarAngle = Math.PI * 0.12;
  controls.maxPolarAngle = Math.PI * 0.52;
  controls.target.set(0, 1.1, 0);
  controls.zoomSpeed = 1.1;
  controls.rotateSpeed = 0.68;

  // Soft cosmic lighting — fewer lights on accessible/steady (iGPU fill-rate)
  scene.add(new THREE.AmbientLight(0x9b8cff, useTx ? 0.42 : 0.55));
  scene.add(new THREE.HemisphereLight(0xc4b5fd, 0x0a0618, useTx ? 0.55 : 0.7));
  const key = new THREE.DirectionalLight(0xf0e8ff, useTx ? 0.95 : 0.85);
  key.position.set(6, 14, 8);
  scene.add(key);
  // Always keep named handles so the render loop never hits TDZ / undefined
  let gold: THREE.PointLight | null = null;
  let teal: THREE.PointLight | null = null;
  let violet: THREE.PointLight | null = null;
  if (useTx || useNebula) {
    const rim = new THREE.DirectionalLight(0x22d3ee, 0.55);
    rim.position.set(-8, 4, -6);
    scene.add(rim);
    gold = new THREE.PointLight(0xd4a84b, 0.55, 55);
    gold.position.set(0, 4.5, 0);
    scene.add(gold);
    teal = new THREE.PointLight(0x5eead4, 0.5, 40);
    teal.position.set(5, 2.5, -3);
    scene.add(teal);
    violet = new THREE.PointLight(0xa78bfa, 0.65, 48);
    violet.position.set(-4, 3, 5);
    scene.add(violet);
  } else {
    // One accent light is enough for comb readability on basic hardware
    gold = new THREE.PointLight(0xd4a84b, 0.45, 42);
    gold.position.set(0, 3.5, 0);
    scene.add(gold);
    teal = new THREE.PointLight(0x5eead4, 0.55, 42);
    teal.position.set(3, 3, 2);
    scene.add(teal);
  }

  // Subtle quantum lattice (optional — skip on accessible)
  if (useGrid) {
    const grid = new THREE.GridHelper(64, useTx ? 64 : 32, 0x4c1d95, 0x1e1035);
    const gMat = grid.material as THREE.Material | THREE.Material[];
    if (Array.isArray(gMat)) {
      gMat.forEach((m) => {
        m.transparent = true;
        (m as THREE.Material & { opacity: number }).opacity = 0.12;
      });
    } else {
      gMat.transparent = true;
      (gMat as THREE.Material & { opacity: number }).opacity = 0.12;
    }
    scene.add(grid);
  }

  // Multi-layer quantum starfield — count 0 skips layer (accessible = no stars)
  const glowTex = makeGlowTexture();
  function addStarLayer(
    count: number,
    spread: number,
    yMax: number,
    size: number,
    color: number,
    opacity: number,
  ): THREE.Points | null {
    if (count <= 0) return null;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = Math.random() * yMax + 0.1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread;
      phases[i] = Math.random() * Math.PI * 2;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("phase", new THREE.BufferAttribute(phases, 1));
    const pts = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color,
        size,
        map: glowTex,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    );
    scene.add(pts);
    return pts;
  }
  const starsFar = addStarLayer(starFarN, 70, 22, 0.09, 0xa78bfa, 0.55);
  const starsMid = addStarLayer(starMidN, 48, 14, 0.14, 0x5eead4, 0.4);
  const starsNear = addStarLayer(starNearN, 36, 10, 0.22, 0xf0abfc, 0.35);

  // Nebula volume discs (soft additive planes) — skip on steady/accessible
  function addNebula(y: number, scale: number, color: number, opacity: number) {
    const mat = new THREE.MeshBasicMaterial({
      map: glowTex,
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = y;
    mesh.scale.setScalar(scale);
    scene.add(mesh);
    return mesh;
  }
  const nebulaA = useNebula ? addNebula(0.05, 28, 0x6d28d9, 0.14) : null;
  const nebulaB = useNebula ? addNebula(0.12, 18, 0x0e7490, 0.1) : null;
  const nebulaC = useNebula ? addNebula(0.08, 22, 0xdb2777, 0.07) : null;

  const wsGroup = new THREE.Group();
  const skGroup = new THREE.Group();
  const indGroup = new THREE.Group();
  const linkGroup = new THREE.Group();
  scene.add(skGroup);
  scene.add(indGroup);
  scene.add(wsGroup);
  scene.add(linkGroup);

  // Geometric: shared hex extrudes. Galactic: per-node multi-surface bodies.
  const geoWs = hexExtrude(GEO_WS_R, 0.4);
  const geoSk = hexExtrude(GEO_SK_R, 0.13);
  const geoInd = hexExtrude(GEO_IND_R, 0.2);
  const meshes = new Map<string, THREE.Mesh>();
  const nodeData = new Map<string, HiveNode>();
  const openIds = new Set<string>();
  const glowDiscs: THREE.Mesh[] = [];
  const totals = {
    workspace: opts.workspaces.length,
    skill: opts.skills.length,
    industry: (opts.industries ?? []).length,
  };

  function makeGalacticMaterial(
    color: THREE.Color,
    body: GalacticBodyKind,
    dimmed: boolean,
  ) {
    const hot = body === "star";
    return new THREE.MeshStandardMaterial({
      color: color.clone().multiplyScalar(hot ? 1.12 : 0.88),
      emissive: color
        .clone()
        .lerp(new THREE.Color(hot ? "#fff7ed" : "#1e1b4b"), hot ? 0.32 : 0.5),
      emissiveIntensity: dimmed
        ? 0.22
        : hot
          ? 1.25
          : body === "planet"
            ? 0.52
            : 0.38,
      metalness: hot ? 0.12 : body === "moon" ? 0.45 : 0.32,
      roughness: hot ? 0.32 : body === "moon" ? 0.48 : 0.52,
      flatShading: body === "moon" || body === "nebula-seed",
      transparent: true,
      opacity: dimmed ? 0.55 : 0.96,
    });
  }

  function addGalacticShells(
    mesh: THREE.Mesh,
    body: GalacticBodyKind,
    color: THREE.Color,
    dimmed: boolean,
    r: number,
  ) {
    // Light path for basic hardware: body mesh only (no corona/wire/ring stacks)
    if (!lightGalactic) return;

    // Outer corona — kept close so packing clearance stays honest
    const corona = new THREE.Mesh(
      new THREE.SphereGeometry(r * (body === "star" ? 1.22 : 1.14), 14, 10),
      new THREE.MeshBasicMaterial({
        color: color.clone().lerp(new THREE.Color("#fdf4ff"), 0.35),
        transparent: true,
        opacity: dimmed ? 0.05 : body === "star" ? 0.16 : 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.BackSide,
      }),
    );
    corona.raycast = () => {};
    mesh.add(corona);

    // Faceted wire overlay — multi-surface read without huge extent
    const wireGeo =
      body === "star"
        ? new THREE.IcosahedronGeometry(r * 1.04, 0)
        : body === "planet"
          ? new THREE.DodecahedronGeometry(r * 1.02, 0)
          : new THREE.OctahedronGeometry(r * 1.05, 0);
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(wireGeo),
      new THREE.LineBasicMaterial({
        color: color.clone().lerp(new THREE.Color("#e9d5ff"), 0.4),
        transparent: true,
        opacity: dimmed ? 0.1 : body === "star" ? 0.4 : 0.25,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    wire.raycast = () => {};
    mesh.add(wire);

    // Equatorial ring only on stars + high planets — smaller than before
    if (body === "star" || (body === "planet" && r >= 0.34)) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r * 1.14, r * 0.028, 6, 28),
        new THREE.MeshBasicMaterial({
          color: color.clone().lerp(new THREE.Color("#a5b4fc"), 0.3),
          transparent: true,
          opacity: dimmed ? 0.08 : 0.28,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      ring.rotation.x = Math.PI / 2.35;
      ring.raycast = () => {};
      mesh.add(ring);
    }
  }

  function addNodeMesh(
    node: HiveNode,
    geo: THREE.BufferGeometry,
    group: THREE.Group,
    pos: THREE.Vector3,
    scale: number,
    bigLabel: boolean,
    kind: "workspace" | "skill" | "industry",
    index: number,
  ) {
    const color = new THREE.Color(node.color);
    const dimmed = node.enabled === false;
    const priority = thinkingPriority(kind, index, totals[kind], {
      enabled: node.enabled,
    });
    const body = isGalactic
      ? galacticBodyForNode(kind, index, priority)
      : ("star" as GalacticBodyKind);
    const pScale = isGalactic ? priorityBodyScale(priority) : 1;
    const finalScale = scale * pScale;

    const useGeo = isGalactic ? makeGalacticBodyGeometry(body) : geo;
    const mat = isGalactic
      ? makeGalacticMaterial(color, body, dimmed)
      : makeQuantumHexMaterial(color, dimmed, bigLabel, useTx);
    const mesh = new THREE.Mesh(useGeo, mat);
    mesh.position.copy(pos);
    mesh.scale.setScalar(finalScale);
    mesh.userData = {
      id: node.id,
      baseY: pos.y,
      /** Layout anchors — separation multiplies XZ so zoom-out does not pile cards */
      layoutX: pos.x,
      layoutZ: pos.z,
      baseScale: finalScale,
      phase: Math.random() * Math.PI * 2,
      spin: 0.12 + Math.random() * 0.4,
      color,
      dimmed,
      body,
      priority,
      galactic: isGalactic,
    };

    if (!isGalactic) {
      // Luminous rim — cool white-violet gradient edge
      const edgeCol = color.clone().lerp(new THREE.Color("#e9d5ff"), 0.55);
      mesh.add(
        new THREE.LineSegments(
          new THREE.EdgesGeometry(geo, 18),
          new THREE.LineBasicMaterial({
            color: edgeCol,
            transparent: true,
            opacity: dimmed ? 0.15 : 0.55,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        ),
      );
    } else {
      addGalacticShells(
        mesh,
        body,
        color,
        dimmed,
        galacticRadius(body),
      );
    }

    // Soft ground / orbital aura disc — tighter in galactic to cut visual merge
    const disc = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: glowTex,
        color: color.clone().lerp(new THREE.Color("#c4b5fd"), 0.25),
        transparent: true,
        opacity: dimmed ? 0.08 : bigLabel ? 0.24 : 0.14,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    );
    disc.rotation.x = -Math.PI / 2;
    disc.position.set(pos.x, 0.04, pos.z);
    const glowBase =
      (bigLabel ? 1.35 : 0.72) * finalScale * (isGalactic ? 0.92 : 1);
    disc.scale.setScalar(glowBase);
    disc.raycast = () => {};
    scene.add(disc);
    glowDiscs.push(disc);
    mesh.userData.glowDisc = disc;
    mesh.userData.glowBase = glowBase;

    // Labels: geometric keeps cards; galactic uses clean under-body ACR or none
    // (full titles live in the React hover HUD — no messy stacked cards on globes)
    if (!isGalactic) {
      const label = makeAcrSprite(node.acr, color, {
        big: bigLabel,
        sub: bigLabel ? node.title : undefined,
      });
      label.position.set(0, bigLabel ? 0.7 : 0.4, 0);
      mesh.add(label);
      mesh.userData.labelSprite = label;
    } else if (galacticLabelMode(priority, kind) === "acr") {
      const label = makeAcrSprite(node.acr, color, { galactic: true });
      // Sit under the body so the globe face stays clean
      const under = galacticRadius(body) * finalScale * 1.55 + 0.12;
      label.position.set(0, -under, 0);
      label.material.opacity = priority > 0.7 ? 0.75 : 0.45;
      mesh.add(label);
      mesh.userData.labelSprite = label;
      mesh.userData.labelBaseOpacity = label.material.opacity;
    }

    group.add(mesh);
    meshes.set(node.id, mesh);
    nodeData.set(node.id, node);
  }

  const packStyle: "geometric" | "galactic" = isGalactic
    ? "galactic"
    : "geometric";

  function resolvePos(
    node: HiveNode,
    index: number,
    kind: "workspace" | "skill" | "industry",
  ): THREE.Vector3 {
    const custom = opts.positions?.[node.id];
    if (custom) return new THREE.Vector3(custom.x, custom.y, custom.z);
    let v: THREE.Vector3;
    if (kind === "workspace")
      v = vecFromHoney(
        index,
        packSpacing("workspace", packStyle),
        WS_Y,
        WS_Y_JITTER,
      );
    else if (kind === "skill") v = skillFieldPosition(index, packStyle);
    else v = industryFieldPosition(index, packStyle);
    const b = tierRadialBias(kind);
    v.x *= b;
    v.z *= b;
    return v;
  }

  opts.workspaces.forEach((c, i) => {
    addNodeMesh(
      c,
      geoWs,
      wsGroup,
      resolvePos(c, i, "workspace"),
      1.0,
      true,
      "workspace",
      i,
    );
  });
  opts.skills.forEach((s, i) => {
    addNodeMesh(
      s,
      geoSk,
      skGroup,
      resolvePos(s, i, "skill"),
      0.95,
      false,
      "skill",
      i,
    );
  });
  (opts.industries ?? []).forEach((ind, i) => {
    addNodeMesh(
      ind,
      geoInd,
      indGroup,
      resolvePos(ind, i, "industry"),
      0.9,
      false,
      "industry",
      i,
    );
  });

  // Soft radial quantum filaments + dynamic orchestration edges
  const linkMats: THREE.LineBasicMaterial[] = [];
  const flowLines: THREE.Line[] = [];
  const phaseIds = new Set<string>();
  let layoutTargets = new Map<string, THREE.Vector3>();

  function rebuildHubFilaments() {
    // Clear old hub links only (keep flow lines separate)
    while (linkGroup.children.length) {
      const ch = linkGroup.children[0]!;
      linkGroup.remove(ch);
      if (ch instanceof THREE.Line) {
        ch.geometry.dispose();
        const m = ch.material;
        if (Array.isArray(m)) m.forEach((x) => x.dispose());
        else m.dispose();
      }
    }
    linkMats.length = 0;
    flowLines.length = 0;
    opts.workspaces.forEach((c) => {
      const mesh = meshes.get(c.id);
      if (!mesh) return;
      const pos = mesh.position.clone();
      const mid = new THREE.Vector3(
        pos.x * 0.45,
        Math.max(0.4, pos.y * 0.55) + 0.3,
        pos.z * 0.45,
      );
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0.2, 0),
        mid,
        pos.clone().setY(pos.y - 0.12),
      );
      const pts = curve.getPoints(18);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(c.color).lerp(new THREE.Color("#a78bfa"), 0.4),
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      linkMats.push(mat);
      linkGroup.add(
        new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat),
      );
    });
  }
  rebuildHubFilaments();

  let fitDistance = 16;
  let zoomFactor = 1;
  /** Grows cards when zoomed out / wide screens — kills side dead space */
  let cardFillScale = 1;
  let hoverId: string | null = null;
  let selectedId: string | null = null;
  let reasoning = false;
  let deskOpen = false;
  let pointerDown: { x: number; y: number; id: string | null } | null = null;
  let raf = 0;
  let disposed = false;

  function refreshCardFillScale() {
    // Modest zoom-out boost; field expands via separationScale (no pile-up)
    const zoomBoost = cardScaleForZoom(zoomFactor);
    const aspectBoost =
      camera.aspect >= 2.0 ? 1.08 : camera.aspect >= 1.6 ? 1.04 : 1;
    cardFillScale = Math.min(CARD_FILL_MAX, zoomBoost * aspectBoost);
  }

  function applyZoom() {
    const dir = new THREE.Vector3()
      .subVectors(camera.position, controls.target)
      .normalize();
    const dist = fitDistance / zoomFactor;
    camera.position.copy(controls.target).addScaledVector(dir, dist);
    refreshCardFillScale();
    controls.update();
  }

  function fitAll() {
    const box = new THREE.Box3();
    for (const mesh of meshes.values()) {
      box.expandByObject(mesh);
    }
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    // Aspect-aware distance; extra margin so tall tier stack stays in frame
    fitDistance = fitDistanceForBox(
      size.x,
      size.y * 1.15,
      size.z,
      camera.fov,
      camera.aspect,
      { margin: 1.08, min: 10, max: 48 },
    );
    // Aim mid-stack so workspaces / industries / skills all read in perspective
    const aimY = Math.max(0.85, center.y * 0.55 + size.y * 0.12);
    controls.target.set(center.x, aimY, center.z);
    // Oblique three-quarter view — more depth than top-down, less than pure side
    const elev = fitDistance * 0.34;
    const back = fitDistance * 0.86;
    const side = fitDistance * 0.22;
    camera.position.set(center.x + side, elev + 2.4, center.z + back);
    zoomFactor = 1;
    applyZoom();
  }

  function resize() {
    const w = canvas.clientWidth || canvas.parentElement?.clientWidth || 1;
    const h = canvas.clientHeight || canvas.parentElement?.clientHeight || 1;
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    // Re-frame after aspect change so large monitors keep field filled
    refreshCardFillScale();
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function idFromObject(obj: THREE.Object3D | null | undefined): string | null {
    let cur: THREE.Object3D | null | undefined = obj;
    while (cur) {
      const id = cur.userData?.id;
      if (id != null && id !== "") return String(id);
      cur = cur.parent;
    }
    return null;
  }

  function pick(clientX: number, clientY: number): string | null {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return null;
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    // Recursive true so galactic shells / edge children still resolve to node id
    const roots = [
      ...wsGroup.children,
      ...indGroup.children,
      ...skGroup.children,
    ];
    const hits = raycaster.intersectObjects(roots, true);
    for (const hit of hits) {
      const id = idFromObject(hit.object);
      if (id && nodeData.has(id)) return id;
    }
    return null;
  }

  function emitSelect(id: string | null) {
    if (!id) return;
    selectedId = id;
    const node = nodeData.get(id);
    if (node) {
      try {
        opts.onSelect?.(node);
      } catch {
        /* host must stay up even if desk open throws */
      }
    }
  }

  function onPointerMove(e: PointerEvent) {
    const id = pick(e.clientX, e.clientY);
    if (id !== hoverId) {
      hoverId = id;
      opts.onHover?.(id ? nodeData.get(id) ?? null : null);
      canvas.style.cursor = id ? "pointer" : "grab";
    }
  }

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    pointerDown = { x: e.clientX, y: e.clientY, id: pick(e.clientX, e.clientY) };
  }

  function onPointerUp(e: PointerEvent) {
    if (!pointerDown || e.button !== 0) return;
    const dist = Math.hypot(e.clientX - pointerDown.x, e.clientY - pointerDown.y);
    const id = pick(e.clientX, e.clientY) || pointerDown.id;
    // Allow small orbit drag jitter; still count as a select
    if (dist < 14 && id && (!pointerDown.id || id === pointerDown.id || dist < 6)) {
      emitSelect(id);
    }
    pointerDown = null;
  }

  // Fallback: some hosts only deliver click (not pointer*) cleanly with OrbitControls
  function onClick(e: MouseEvent) {
    if (e.button !== 0) return;
    const id = pick(e.clientX, e.clientY);
    if (id) emitSelect(id);
  }

  function tick(t: number) {
    if (disposed) return;
    // Pause heavy work when tab hidden — prevents “frozen” GPU thrash after alt-tab
    if (typeof document !== "undefined" && document.hidden) {
      raf = requestAnimationFrame(tick);
      return;
    }
    const time = t * 0.001;

    // Drift nebulas slowly (quantum cloud breathe) — null on accessible/steady
    if (nebulaA && nebulaB && nebulaC) {
      nebulaA.rotation.z = time * 0.02;
      nebulaB.rotation.z = -time * 0.015;
      nebulaC.rotation.z = time * 0.01;
      (nebulaA.material as THREE.MeshBasicMaterial).opacity =
        0.12 + Math.sin(time * 0.4) * 0.03;
      (nebulaB.material as THREE.MeshBasicMaterial).opacity =
        0.09 + Math.cos(time * 0.35) * 0.025;
    }

    // Twinkle star layers (skip empty accessible tiers)
    const starLayers: [THREE.Points | null, number, number][] = [
      [starsFar, 0.55, 0.9],
      [starsMid, 0.4, 1.3],
      [starsNear, 0.35, 1.7],
    ];
    for (const [layer, baseOp, speed] of starLayers) {
      if (!layer) continue;
      const mat = layer.material as THREE.PointsMaterial;
      mat.opacity = baseOp * (0.82 + 0.18 * Math.sin(time * speed));
    }

    const sep = separationScale(cardFillScale);
    for (const mesh of meshes.values()) {
      const ud = mesh.userData;
      const isHover = ud.id === hoverId;
      const isSel = ud.id === selectedId || openIds.has(ud.id);
      const inPhase = phaseIds.size === 0 || phaseIds.has(ud.id);
      const isPhase = phaseIds.has(ud.id);
      // Smooth layout morph into layout anchors (not display position)
      const target = layoutTargets.get(ud.id);
      if (target) {
        ud.layoutX += (target.x - (ud.layoutX as number)) * 0.12;
        ud.layoutZ += (target.z - (ud.layoutZ as number)) * 0.12;
        ud.baseY += (target.y - ud.baseY) * 0.12;
      }
      // Expand field when cards grow — prevents pile-up / stacked combs
      mesh.position.x = (ud.layoutX as number) * sep;
      mesh.position.z = (ud.layoutZ as number) * sep;
      const bob = Math.sin(time * 1.05 + ud.phase) * 0.035;
      const lift = isHover || isSel || isPhase ? 0.14 : 0;
      mesh.position.y = ud.baseY + bob + lift;
      // Geometric: subtle wobble. Galactic: slow planetary / stellar spin
      if (!ud.dimmed) {
        if (ud.galactic) {
          mesh.rotation.y += 0.004 * (ud.spin as number);
          mesh.rotation.x = Math.sin(time * 0.2 + ud.phase) * 0.06;
        } else {
          mesh.rotation.y = Math.sin(time * 0.35 + ud.phase) * 0.04;
        }
      }
      // Galactic labels: soft under-body ACR; brighten on hover (titles stay in HUD)
      const label = ud.labelSprite as THREE.Sprite | undefined;
      if (label && label.material instanceof THREE.SpriteMaterial) {
        const base = (ud.labelBaseOpacity as number) ?? 0.5;
        label.material.opacity =
          isHover || isSel || isPhase ? Math.min(1, base + 0.4) : base;
      }
      const phaseBoost = isPhase ? 1.18 : inPhase ? 1 : 0.72;
      // Modest fill only — separationScale keeps neighbors clear
      const interaction =
        (isHover ? 1.1 : isSel ? 1.06 : isPhase ? 1.08 : 1) * cardFillScale;
      mesh.scale.setScalar(ud.baseScale * interaction);
      const mat = mesh.material as THREE.MeshStandardMaterial & {
        iridescence?: number;
      };
      const baseE = ud.dimmed ? 0.25 : 0.55;
      let e = isHover ? 1.15 : isSel ? 0.95 : baseE + Math.sin(time * 1.4 + ud.phase) * 0.08;
      if (reasoning || isPhase) e *= 1.2;
      if (!inPhase && phaseIds.size > 0) e *= 0.45;
      mat.emissiveIntensity = e * phaseBoost;
      mat.opacity = !inPhase && phaseIds.size > 0 ? 0.45 : ud.dimmed ? 0.55 : 0.9;
      if (typeof mat.iridescence === "number") {
        mat.iridescence = isHover || isPhase ? 1.2 : ud.dimmed ? 0.35 : 0.9;
      }
      const disc = ud.glowDisc as THREE.Mesh | undefined;
      if (disc) {
        const dm = disc.material as THREE.MeshBasicMaterial;
        const gBase = (ud.glowBase as number) || 1.2;
        dm.opacity =
          (isHover ? 0.62 : isSel || isPhase ? 0.52 : ud.dimmed ? 0.12 : 0.3) +
          Math.sin(time * 2 + ud.phase) * 0.04;
        disc.scale.setScalar(
          gBase *
            cardFillScale *
            (isHover || isPhase ? 1.18 : isSel ? 1.08 : 1),
        );
        disc.position.x = mesh.position.x;
        disc.position.z = mesh.position.z;
      }
    }

    // Pulse orchestration flow lines
    for (const line of flowLines) {
      const m = line.material as THREE.LineBasicMaterial;
      m.opacity = 0.35 + Math.sin(time * 3 + (line.userData.phase || 0)) * 0.25;
    }

    // Pulse energy filaments
    for (let i = 0; i < linkMats.length; i++) {
      const m = linkMats[i]!;
      m.opacity = 0.18 + Math.sin(time * 1.6 + i) * 0.1;
    }

    if (gold) {
      gold.intensity = reasoning
        ? 0.85
        : deskOpen
          ? 0.4
          : 0.55 + Math.sin(time * 0.7) * 0.08;
    }
    if (violet) {
      violet.intensity = 0.55 + Math.sin(time * 0.5) * 0.12;
    }
    if (teal) {
      teal.intensity = 0.42 + Math.cos(time * 0.6) * 0.1;
    }
    controls.update();
    // Only ACES path uses exposure; NoToneMapping ignores it safely
    renderer.toneMappingExposure = deskOpen ? 0.92 : reasoning ? 1.18 : 1.05;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }

  let resizeFitTimer = 0;
  const ro = new ResizeObserver(() => {
    resize();
    // Debounced re-fit so ultrawide / window drag always fills
    window.clearTimeout(resizeFitTimer);
    resizeFitTimer = window.setTimeout(() => {
      if (!disposed) fitAll();
    }, 120);
  });
  ro.observe(canvas.parentElement || canvas);
  resize();
  // Fit after first layout frame, then signal ready (staged load)
  requestAnimationFrame(() => {
    fitAll();
    try {
      opts.onReady?.();
    } catch {
      /* ignore */
    }
  });

  const onContextLost = (ev: Event) => {
    ev.preventDefault();
    disposed = true;
    cancelAnimationFrame(raf);
    try {
      opts.onContextLost?.("WebGL context lost — map view stays fully usable");
    } catch {
      /* ignore */
    }
  };
  const onContextRestored = () => {
    // Host remounts a fresh canvas; do not try to revive this instance.
  };

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("click", onClick);
  canvas.addEventListener("webglcontextlost", onContextLost, false);
  canvas.addEventListener("webglcontextrestored", onContextRestored, false);
  raf = requestAnimationFrame(tick);

  return {
    setSelected(id) {
      selectedId = id;
    },
    setOpenIds(ids) {
      openIds.clear();
      for (const id of ids) openIds.add(id);
    },
    setReasoning(active) {
      reasoning = active;
    },
    setDeskOpen(open) {
      deskOpen = open;
    },
    applyLayout(positions, animate = true) {
      layoutTargets.clear();
      for (const [id, p] of Object.entries(positions || {})) {
        const mesh = meshes.get(id);
        if (!mesh) continue;
        const target = new THREE.Vector3(p.x, p.y, p.z);
        if (animate) {
          layoutTargets.set(id, target);
        } else {
          mesh.userData.layoutX = p.x;
          mesh.userData.layoutZ = p.z;
          mesh.userData.baseY = p.y;
          const sep = separationScale(cardFillScale);
          mesh.position.set(p.x * sep, p.y, p.z * sep);
          const disc = mesh.userData.glowDisc as THREE.Mesh | undefined;
          if (disc) {
            disc.position.x = mesh.position.x;
            disc.position.z = mesh.position.z;
          }
        }
      }
      // After short morph, snap layout anchors and rebuild filaments
      window.setTimeout(() => {
        for (const [id, target] of layoutTargets) {
          const mesh = meshes.get(id);
          if (!mesh) continue;
          mesh.userData.layoutX = target.x;
          mesh.userData.layoutZ = target.z;
          mesh.userData.baseY = target.y;
        }
        layoutTargets.clear();
        rebuildHubFilaments();
        fitAll();
      }, animate ? 700 : 0);
    },
    setPhaseNodeIds(ids) {
      phaseIds.clear();
      for (const id of ids) phaseIds.add(id);
    },
    setFlowEdges(edges) {
      // Remove previous flow lines (tagged)
      for (const line of [...flowLines]) {
        linkGroup.remove(line);
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      }
      flowLines.length = 0;
      (edges || []).forEach((edge, i) => {
        const a = meshes.get(edge.from);
        const b = meshes.get(edge.to);
        if (!a || !b) return;
        const mid = new THREE.Vector3(
          (a.position.x + b.position.x) / 2,
          Math.max(a.position.y, b.position.y) + 0.8 + (i % 3) * 0.15,
          (a.position.z + b.position.z) / 2,
        );
        const curve = new THREE.QuadraticBezierCurve3(
          a.position.clone(),
          mid,
          b.position.clone(),
        );
        const color =
          edge.kind === "deliver"
            ? 0x4ade80
            : edge.kind === "gate"
              ? 0xfbbf24
              : edge.kind === "sense"
                ? 0x22d3ee
                : 0xa78bfa;
        const mat = new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(curve.getPoints(24)),
          mat,
        );
        line.userData.phase = i;
        flowLines.push(line);
        linkGroup.add(line);
      });
    },
    setEditMode(on) {
      canvas.style.cursor = on ? "crosshair" : "grab";
    },
    setZoom(factor) {
      zoomFactor = Math.min(2.4, Math.max(0.28, factor));
      applyZoom();
    },
    getZoom() {
      return zoomFactor;
    },
    zoomBy(delta) {
      zoomFactor = Math.min(2.4, Math.max(0.28, zoomFactor + delta));
      applyZoom();
    },
    fitAll,
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeFitTimer);
      try {
        ro.disconnect();
      } catch {
        /* ignore */
      }
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("webglcontextlost", onContextLost, false);
      canvas.removeEventListener("webglcontextrestored", onContextRestored, false);
      try {
        controls.dispose();
      } catch {
        /* ignore */
      }
      // Critical: release GPU context so retry/remount on a new canvas works.
      // Without forceContextLoss, Edge/Chrome often report "3D unavailable" after one dispose.
      try {
        renderer.forceContextLoss();
      } catch {
        /* ignore */
      }
      try {
        renderer.dispose();
      } catch {
        /* ignore */
      }
      try {
        geoWs.dispose();
        geoSk.dispose();
        geoInd.dispose();
      } catch {
        /* ignore */
      }
    },
  };
}
