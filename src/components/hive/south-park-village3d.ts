/**
 * South Park–style 3D village hub.
 * Homage cutout aesthetic — original buildings, product routes, no IP assets.
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { VillageBuilding } from "@/lib/south-park-village-map";
import type { HiveNode } from "@/lib/tutor-hive-map";

export type VillageHoverInfo = HiveNode | null;

export type SouthParkVillage3D = {
  setSelected: (id: string | null) => void;
  setOpenIds: (ids: string[]) => void;
  setReasoning: (active: boolean) => void;
  setDeskOpen: (open: boolean) => void;
  setZoom: (factor: number) => void;
  getZoom: () => number;
  zoomBy: (delta: number) => void;
  fitAll: () => void;
  dispose: () => void;
};

/* ── materials ─────────────────────────────────────────── */

function mat(color: string | number, opts: { flat?: boolean; rough?: number } = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.rough ?? 0.85,
    metalness: 0.02,
    flatShading: opts.flat !== false,
  });
}

function makeLabelSprite(title: string, color: string, big = false) {
  const canvas = document.createElement("canvas");
  canvas.width = big ? 640 : 384;
  canvas.height = big ? 160 : 112;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Comic speech-bubble style plate
  ctx.fillStyle = "rgba(255,255,255,0.94)";
  const pad = 10;
  const rw = canvas.width - pad * 2;
  const rh = canvas.height - pad * 2;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(pad, pad, rw, rh, 18);
    ctx.fill();
  } else {
    ctx.fillRect(pad, pad, rw, rh);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(pad, pad, rw, rh, 18);
    ctx.stroke();
  }
  // Black outline (South Park comic ink)
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 2;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(pad + 3, pad + 3, rw - 6, rh - 6, 14);
    ctx.stroke();
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#111";
  ctx.font = `bold ${big ? 36 : 26}px Comic Sans MS, "Segoe UI", system-ui, sans-serif`;
  const text = String(title || "").slice(0, big ? 28 : 18);
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }),
  );
  sprite.scale.set(big ? 3.2 : 2.0, big ? 0.8 : 0.55, 1);
  sprite.raycast = () => {};
  return sprite;
}

/* ── primitive builders ────────────────────────────────── */

function box(
  w: number,
  h: number,
  d: number,
  color: string | number,
  y = 0,
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.position.y = y + h / 2;
  return m;
}

/** Pitched roof as a triangular prism */
function pitchedRoof(w: number, h: number, d: number, color: string | number): THREE.Mesh {
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0);
  shape.lineTo(w / 2, 0);
  shape.lineTo(0, h);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d,
    bevelEnabled: false,
  });
  geo.rotateY(Math.PI / 2);
  geo.translate(0, 0, -d / 2);
  const m = new THREE.Mesh(geo, mat(color));
  return m;
}

function cylinder(
  rTop: number,
  rBot: number,
  h: number,
  color: string | number,
  y = 0,
  segs = 8,
): THREE.Mesh {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(rTop, rBot, h, segs),
    mat(color),
  );
  m.position.y = y + h / 2;
  return m;
}

/** Classic cutout kid — big head, tiny body, colored hat */
function makeKid(opts: {
  body: string;
  hat: string;
  skin?: string;
  phase?: number;
}): THREE.Group {
  const g = new THREE.Group();
  const skin = opts.skin ?? "#f5c9a0";

  // Legs
  const legL = box(0.12, 0.28, 0.12, "#222", 0);
  legL.position.x = -0.08;
  const legR = box(0.12, 0.28, 0.12, "#222", 0);
  legR.position.x = 0.08;
  g.add(legL, legR);

  // Body
  const body = box(0.42, 0.38, 0.28, opts.body, 0.28);
  g.add(body);

  // Arms
  const armL = box(0.1, 0.32, 0.1, opts.body, 0.32);
  armL.position.x = -0.28;
  const armR = box(0.1, 0.32, 0.1, opts.body, 0.32);
  armR.position.x = 0.28;
  g.add(armL, armR);

  // Head (oversized)
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 12, 10),
    mat(skin, { flat: true }),
  );
  head.position.y = 0.95;
  g.add(head);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.07, 8, 6);
  const eyeMat = mat("#fff", { flat: true });
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.1, 0.98, 0.28);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.1, 0.98, 0.28);
  g.add(eyeL, eyeR);
  const pupilMat = mat("#111", { flat: true });
  const pL = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), pupilMat);
  pL.position.set(-0.1, 0.98, 0.34);
  const pR = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), pupilMat);
  pR.position.set(0.1, 0.98, 0.34);
  g.add(pL, pR);

  // Hat / beanie
  const hat = cylinder(0.28, 0.34, 0.22, opts.hat, 1.12, 10);
  g.add(hat);
  const pom = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 6),
    mat(opts.hat, { flat: true }),
  );
  pom.position.y = 1.42;
  g.add(pom);

  g.userData.phase = opts.phase ?? Math.random() * Math.PI * 2;
  g.userData.bob = 0;
  g.userData.walkSpeed = 0.4 + Math.random() * 0.5;
  g.userData.radius = 4 + Math.random() * 8;
  g.userData.angle = Math.random() * Math.PI * 2;
  g.userData.centerX = (Math.random() - 0.5) * 6;
  g.userData.centerZ = (Math.random() - 0.5) * 6;
  return g;
}

function makeTree(scale = 1): THREE.Group {
  const g = new THREE.Group();
  const trunk = cylinder(0.12, 0.18, 0.7, "#5c3a1e", 0, 6);
  g.add(trunk);
  // Layered snowy pine
  for (let i = 0; i < 3; i++) {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.7 - i * 0.15, 0.9, 7),
      mat(i === 2 ? "#2d5a27" : "#1e4a1a"),
    );
    cone.position.y = 0.85 + i * 0.55;
    g.add(cone);
    // Snow cap
    const snow = new THREE.Mesh(
      new THREE.ConeGeometry(0.45 - i * 0.1, 0.25, 7),
      mat("#f0f4f8"),
    );
    snow.position.y = 1.15 + i * 0.55;
    g.add(snow);
  }
  g.scale.setScalar(scale);
  return g;
}

/* ── building factories ────────────────────────────────── */

function buildSchool(b: VillageBuilding): THREE.Group {
  const g = new THREE.Group();
  const wall = b.wallColor ?? "#e8e0c8";
  const roof = b.roofColor ?? "#c45c26";
  g.add(box(4.2, 1.8, 2.6, wall, 0));
  // Wings
  const wingL = box(1.4, 1.4, 2.0, wall, 0);
  wingL.position.x = -2.5;
  g.add(wingL);
  const wingR = box(1.4, 1.4, 2.0, wall, 0);
  wingR.position.x = 2.5;
  g.add(wingR);
  const r = pitchedRoof(4.6, 1.1, 2.9, roof);
  r.position.y = 1.8;
  g.add(r);
  // Bell tower
  g.add(box(0.7, 1.2, 0.7, wall, 1.8));
  g.add(cylinder(0.15, 0.15, 0.25, "#fbbf24", 3.0, 8));
  // Door
  const door = box(0.55, 0.9, 0.12, "#4a3728", 0);
  door.position.z = 1.35;
  g.add(door);
  // Windows
  for (const x of [-1.2, 0, 1.2]) {
    const win = box(0.45, 0.45, 0.08, "#87ceeb", 0.9);
    win.position.set(x, 0, 1.32);
    g.add(win);
  }
  // Flag pole
  const pole = cylinder(0.04, 0.04, 2.2, "#888", 0, 6);
  pole.position.set(2.8, 0, 1.2);
  g.add(pole);
  const flag = box(0.7, 0.4, 0.04, "#ef4444", 1.9);
  flag.position.set(3.15, 0, 1.2);
  g.add(flag);
  return g;
}

function buildBus(b: VillageBuilding): THREE.Group {
  const g = new THREE.Group();
  const body = box(3.6, 1.3, 1.5, b.wallColor ?? "#f5d547", 0.35);
  g.add(body);
  // Cab
  const cab = box(1.0, 1.1, 1.5, b.wallColor ?? "#f5d547", 0.35);
  cab.position.x = 1.9;
  g.add(cab);
  // Windows strip
  const winF = box(3.0, 0.4, 0.08, "#87ceeb", 1.15);
  winF.position.set(-0.1, 0, 0.76);
  g.add(winF);
  const winB = box(3.0, 0.4, 0.08, "#87ceeb", 1.15);
  winB.position.set(-0.1, 0, -0.76);
  g.add(winB);
  // Wheels
  for (const [x, z] of [
    [-1.1, 0.85],
    [0.6, 0.85],
    [-1.1, -0.85],
    [0.6, -0.85],
    [1.9, 0.85],
    [1.9, -0.85],
  ] as [number, number][]) {
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.22, 10),
      mat("#222"),
    );
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.28, z);
    g.add(wheel);
  }
  // Stop sign arm
  const arm = box(0.08, 0.5, 0.08, "#333", 1.4);
  arm.position.set(2.5, 0, 0.9);
  g.add(arm);
  const stop = box(0.45, 0.45, 0.06, "#ef4444", 1.7);
  stop.position.set(2.5, 0, 0.9);
  g.add(stop);
  // Headlights
  const hl1 = box(0.15, 0.15, 0.08, "#fef08a", 0.55);
  hl1.position.set(2.45, 0, 0.5);
  g.add(hl1);
  const hl2 = box(0.15, 0.15, 0.08, "#fef08a", 0.55);
  hl2.position.set(2.45, 0, -0.5);
  g.add(hl2);
  return g;
}

function buildHall(b: VillageBuilding): THREE.Group {
  const g = new THREE.Group();
  const wall = b.wallColor ?? "#d4c4a8";
  const roof = b.roofColor ?? "#4a5568";
  g.add(box(3.8, 2.0, 2.8, wall, 0));
  const r = pitchedRoof(4.2, 1.4, 3.1, roof);
  r.position.y = 2.0;
  g.add(r);
  // Columns
  for (const x of [-1.3, -0.45, 0.45, 1.3]) {
    const col = cylinder(0.12, 0.14, 1.6, "#f5f0e6", 0, 8);
    col.position.set(x, 0, 1.5);
    g.add(col);
  }
  // Pediment steps
  const step1 = box(3.2, 0.2, 0.9, "#c8c0b0", 0);
  step1.position.z = 1.7;
  g.add(step1);
  const step2 = box(2.8, 0.2, 0.7, "#c8c0b0", 0.2);
  step2.position.z = 1.6;
  g.add(step2);
  // Door
  const hallDoor = box(0.7, 1.1, 0.1, "#3b2f2f", 0.2);
  hallDoor.position.z = 1.45;
  g.add(hallDoor);
  // Clock
  const clock = new THREE.Mesh(
    new THREE.CircleGeometry(0.35, 16),
    mat("#f8fafc"),
  );
  clock.position.set(0, 1.5, 1.42);
  g.add(clock);
  return g;
}

function buildLibrary(b: VillageBuilding): THREE.Group {
  const g = new THREE.Group();
  const wall = b.wallColor ?? "#c4b5a0";
  const roof = b.roofColor ?? "#6b3a2a";
  g.add(box(3.2, 1.7, 2.4, wall, 0));
  const r = pitchedRoof(3.5, 1.0, 2.7, roof);
  r.position.y = 1.7;
  g.add(r);
  // Big window grid
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const win = box(0.5, 0.45, 0.06, "#93c5fd", 0.55 + row * 0.65);
      win.position.set(-0.9 + col * 0.9, 0, 1.22);
      g.add(win);
    }
  }
  const libDoor = box(0.5, 0.85, 0.1, "#4a3728", 0);
  libDoor.position.z = 1.25;
  g.add(libDoor);
  // Book stack prop
  const bk1 = box(0.4, 0.15, 0.3, "#ef4444", 0);
  bk1.position.set(1.8, 0, 1.0);
  g.add(bk1);
  const bk2 = box(0.35, 0.12, 0.28, "#3b82f6", 0.15);
  bk2.position.set(1.8, 0, 1.0);
  g.add(bk2);
  const bk3 = box(0.38, 0.12, 0.28, "#22c55e", 0.27);
  bk3.position.set(1.8, 0, 1.0);
  g.add(bk3);
  return g;
}

function buildChurch(b: VillageBuilding): THREE.Group {
  const g = new THREE.Group();
  const wall = b.wallColor ?? "#f5f0e6";
  const roof = b.roofColor ?? "#7c3aed";
  g.add(box(2.6, 1.9, 3.2, wall, 0));
  const r = pitchedRoof(2.9, 1.2, 3.5, roof);
  r.position.y = 1.9;
  g.add(r);
  // Steeple
  g.add(box(0.9, 1.4, 0.9, wall, 1.9));
  const steeple = new THREE.Mesh(
    new THREE.ConeGeometry(0.55, 1.0, 4),
    mat(roof),
  );
  steeple.position.y = 3.8;
  steeple.rotation.y = Math.PI / 4;
  g.add(steeple);
  // Cross
  g.add(box(0.08, 0.5, 0.08, "#facc15", 4.2));
  g.add(box(0.35, 0.08, 0.08, "#facc15", 4.4));
  // Stained glass
  const glass = box(0.6, 0.9, 0.08, "#e879f9", 0.7);
  glass.position.z = 1.65;
  g.add(glass);
  const churchDoor = box(0.55, 0.85, 0.1, "#4a3728", 0);
  churchDoor.position.z = 1.65;
  g.add(churchDoor);
  return g;
}

function buildCenter(b: VillageBuilding): THREE.Group {
  const g = new THREE.Group();
  const wall = b.wallColor ?? "#a8c8e0";
  const roof = b.roofColor ?? "#1e40af";
  g.add(box(3.6, 1.5, 2.8, wall, 0));
  // Flat modern roof with slight overhang
  g.add(box(4.0, 0.2, 3.2, roof, 1.5));
  // Gym stripe
  const stripe = box(3.6, 0.25, 0.08, "#facc15", 1.1);
  stripe.position.z = 1.42;
  g.add(stripe);
  // Doors double
  const d1 = box(0.45, 1.0, 0.1, "#1e3a5f", 0);
  d1.position.set(-0.3, 0, 1.42);
  g.add(d1);
  const d2 = box(0.45, 1.0, 0.1, "#1e3a5f", 0);
  d2.position.set(0.3, 0, 1.42);
  g.add(d2);
  // Windows
  for (const x of [-1.3, 1.3]) {
    const w = box(0.7, 0.6, 0.06, "#bfdbfe", 0.7);
    w.position.set(x, 0, 1.42);
    g.add(w);
  }
  // Basketball hoop prop
  const pole = cylinder(0.05, 0.05, 2.0, "#888", 0, 6);
  pole.position.set(2.2, 0, 1.8);
  g.add(pole);
  const backboard = box(0.7, 0.08, 0.5, "#f97316", 1.9);
  backboard.position.set(2.2, 0, 2.0);
  g.add(backboard);
  return g;
}

function buildTrail(b: VillageBuilding): THREE.Group {
  const g = new THREE.Group();
  // Wooden sign post
  const post = cylinder(0.08, 0.1, 2.2, b.wallColor ?? "#8b6914", 0, 6);
  g.add(post);
  const board = box(1.8, 0.9, 0.12, "#a16207", 1.4);
  g.add(board);
  // Arrow
  const arrow = box(0.6, 0.2, 0.1, "#fef3c7", 1.55);
  arrow.position.x = 0.9;
  g.add(arrow);
  // Rocks
  for (let i = 0; i < 4; i++) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.2 + Math.random() * 0.15, 0),
      mat("#78716c"),
    );
    rock.position.set((Math.random() - 0.5) * 1.5, 0.15, 0.5 + Math.random());
    g.add(rock);
  }
  // Small pine
  const pine = makeTree(0.55);
  pine.position.set(-1.2, 0, 0.3);
  g.add(pine);
  return g;
}

function buildHouse(b: VillageBuilding): THREE.Group {
  const g = new THREE.Group();
  const wall = b.wallColor ?? "#e8a0a0";
  const roof = b.roofColor ?? "#7f1d1d";
  g.add(box(1.8, 1.2, 1.5, wall, 0));
  const r = pitchedRoof(2.0, 0.75, 1.7, roof);
  r.position.y = 1.2;
  g.add(r);
  const hDoor = box(0.35, 0.65, 0.08, "#4a3728", 0);
  hDoor.position.z = 0.78;
  g.add(hDoor);
  const hWin = box(0.35, 0.35, 0.06, "#87ceeb", 0.7);
  hWin.position.set(0.5, 0, 0.78);
  g.add(hWin);
  // Chimney
  const chim = box(0.25, 0.55, 0.25, "#78716c", 1.3);
  chim.position.set(0.55, 0, -0.3);
  g.add(chim);
  return g;
}

function buildTrailer(b: VillageBuilding): THREE.Group {
  const g = new THREE.Group();
  const wall = b.wallColor ?? "#c4c4c4";
  g.add(box(2.4, 1.0, 1.2, wall, 0.15));
  g.add(box(2.5, 0.12, 1.3, "#888", 1.15));
  // Wheels
  for (const x of [-0.7, 0.7]) {
    const w = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.15, 8),
      mat("#222"),
    );
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.2, 0.65);
    g.add(w);
  }
  const tDoor = box(0.3, 0.55, 0.06, "#4a3728", 0.15);
  tDoor.position.set(0.7, 0, 0.62);
  g.add(tDoor);
  const tWin = box(0.4, 0.3, 0.05, "#87ceeb", 0.55);
  tWin.position.set(-0.4, 0, 0.62);
  g.add(tWin);
  return g;
}

function buildShop(b: VillageBuilding): THREE.Group {
  return buildHouse(b);
}

const ARCH: Record<
  VillageBuilding["archetype"],
  (b: VillageBuilding) => THREE.Group
> = {
  school: buildSchool,
  bus: buildBus,
  hall: buildHall,
  library: buildLibrary,
  church: buildChurch,
  center: buildCenter,
  trail: buildTrail,
  house: buildHouse,
  trailer: buildTrailer,
  shop: buildShop,
};

/* ── environment ───────────────────────────────────────── */

function buildMountains(): THREE.Group {
  const g = new THREE.Group();
  const peaks: [number, number, number, number, string][] = [
    [-28, -32, 18, 22, "#5a6a7a"],
    [-12, -38, 28, 32, "#4a5a6a"],
    [8, -40, 34, 36, "#3d4d5d"],
    [26, -34, 20, 24, "#556575"],
    [-40, -28, 14, 16, "#6a7a8a"],
    [40, -30, 16, 18, "#5a6a7a"],
    [0, -48, 22, 40, "#2d3d4d"],
  ];
  for (const [x, z, h, r, col] of peaks) {
    const mesh = new THREE.Mesh(
      new THREE.ConeGeometry(r, h, 5),
      mat(col),
    );
    mesh.position.set(x, h / 2 - 0.5, z);
    g.add(mesh);
    // Snow cap
    const cap = new THREE.Mesh(
      new THREE.ConeGeometry(r * 0.45, h * 0.35, 5),
      mat("#f8fafc"),
    );
    cap.position.set(x, h * 0.72, z);
    g.add(cap);
  }
  return g;
}

function buildGround(): THREE.Group {
  const g = new THREE.Group();
  // Snow field
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(55, 48),
    new THREE.MeshStandardMaterial({
      color: "#e8eef5",
      roughness: 0.95,
      metalness: 0,
      flatShading: true,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  g.add(ground);

  // Road (main street)
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 40),
    mat("#4a4a4a", { flat: true, rough: 0.9 }),
  );
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.02;
  road.position.z = 4;
  g.add(road);

  // Cross street
  const cross = new THREE.Mesh(
    new THREE.PlaneGeometry(36, 4.5),
    mat("#4a4a4a", { flat: true, rough: 0.9 }),
  );
  cross.rotation.x = -Math.PI / 2;
  cross.position.y = 0.025;
  cross.position.z = 1;
  g.add(cross);

  // Yellow center lines
  for (let i = -8; i <= 14; i += 2) {
    const line = new THREE.Mesh(
      new THREE.PlaneGeometry(0.15, 1.0),
      mat("#facc15"),
    );
    line.rotation.x = -Math.PI / 2;
    line.position.set(0, 0.03, i);
    g.add(line);
  }

  // Sidewalks
  for (const x of [-3.8, 3.8]) {
    const walk = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 36),
      mat("#c4c0b8"),
    );
    walk.rotation.x = -Math.PI / 2;
    walk.position.set(x, 0.03, 4);
    g.add(walk);
  }

  return g;
}

function buildSnowParticles(count = 900): THREE.Points {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 50;
    pos[i * 3 + 1] = Math.random() * 22;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
    vel[i] = 0.4 + Math.random() * 1.2;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("vel", new THREE.BufferAttribute(vel, 1));
  const pts = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.12,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      sizeAttenuation: true,
    }),
  );
  pts.userData.vel = vel;
  return pts;
}

/* ── main factory ──────────────────────────────────────── */

export function createSouthParkVillage3D(
  canvas: HTMLCanvasElement,
  opts: {
    buildings: VillageBuilding[];
    onHover?: (info: VillageHoverInfo) => void;
    onSelect?: (info: HiveNode) => void;
  },
): SouthParkVillage3D {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87b5d9);
  scene.fog = new THREE.Fog(0x9ec5e0, 28, 70);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
  camera.position.set(14, 12, 22);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 6;
  controls.maxDistance = 48;
  controls.maxPolarAngle = Math.PI * 0.46;
  controls.minPolarAngle = 0.15;
  controls.target.set(0, 1.2, 0);
  controls.zoomSpeed = 1.1;
  controls.rotateSpeed = 0.65;

  // South Park daylight
  scene.add(new THREE.AmbientLight(0xfff5e6, 0.72));
  scene.add(new THREE.HemisphereLight(0xb8d4f0, 0xd4c8b0, 0.55));
  const sun = new THREE.DirectionalLight(0xfff0d4, 1.15);
  sun.position.set(18, 28, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 2;
  sun.shadow.camera.far = 80;
  sun.shadow.camera.left = -30;
  sun.shadow.camera.right = 30;
  sun.shadow.camera.top = 30;
  sun.shadow.camera.bottom = -30;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xa0c4e8, 0.35);
  fill.position.set(-12, 10, -8);
  scene.add(fill);

  // Environment
  scene.add(buildGround());
  scene.add(buildMountains());

  // Trees around perimeter
  const treeGroup = new THREE.Group();
  for (let i = 0; i < 28; i++) {
    const angle = (i / 28) * Math.PI * 2;
    const rad = 16 + (i % 3) * 3 + Math.random() * 2;
    const t = makeTree(0.7 + Math.random() * 0.6);
    t.position.set(Math.cos(angle) * rad, 0, Math.sin(angle) * rad * 0.7 - 4);
    // Keep trees off the road
    if (Math.abs(t.position.x) < 4 && t.position.z > -2 && t.position.z < 16)
      continue;
    treeGroup.add(t);
  }
  scene.add(treeGroup);

  // Snow
  const snow = buildSnowParticles(1000);
  scene.add(snow);

  // Buildings
  const buildingGroup = new THREE.Group();
  scene.add(buildingGroup);
  const pickables: THREE.Object3D[] = [];
  const meshes = new Map<string, THREE.Object3D>();
  const nodeData = new Map<string, VillageBuilding>();
  const openIds = new Set<string>();
  const hitboxes: THREE.Mesh[] = [];

  for (const b of opts.buildings) {
    const factory = ARCH[b.archetype] ?? buildHouse;
    const mesh = factory(b);
    const s = b.scale ?? 1;
    mesh.scale.setScalar(s);
    mesh.position.set(b.x, 0, b.z);
    if (b.rotY) mesh.rotation.y = b.rotY;
    mesh.userData.id = b.id;
    mesh.userData.baseY = 0;
    mesh.userData.phase = Math.random() * Math.PI * 2;
    mesh.userData.isLandmark = b.buildingKind === "landmark";

    // Invisible hit box for reliable picking
    const box3 = new THREE.Box3().setFromObject(mesh);
    const size = box3.getSize(new THREE.Vector3());
    const center = box3.getCenter(new THREE.Vector3());
    const hit = new THREE.Mesh(
      new THREE.BoxGeometry(
        Math.max(size.x, 1.2) * 1.05,
        Math.max(size.y, 1.5) * 1.1,
        Math.max(size.z, 1.2) * 1.05,
      ),
      new THREE.MeshBasicMaterial({
        visible: false,
        transparent: true,
        opacity: 0,
      }),
    );
    hit.position.copy(center);
    hit.position.y = size.y / 2;
    // Parent hit to world so we can raycast easily
    hit.userData.id = b.id;
    hit.userData.buildingRoot = mesh;
    scene.add(hit);
    hitboxes.push(hit);

    // Label
    const label = makeLabelSprite(
      b.title,
      b.color,
      b.buildingKind === "landmark",
    );
    label.position.set(0, size.y / s + 0.6, 0);
    mesh.add(label);
    mesh.userData.label = label;

    // Ground ring glow when open
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.9, 1.15, 24),
      new THREE.MeshBasicMaterial({
        color: b.color,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.04;
    mesh.add(ring);
    mesh.userData.ring = ring;

    buildingGroup.add(mesh);
    meshes.set(b.id, mesh);
    nodeData.set(b.id, b);
    pickables.push(hit);
  }

  // NPCs — cutout kids wandering
  const kids: THREE.Group[] = [];
  const kidColors = [
    { body: "#e11d48", hat: "#1d4ed8" },
    { body: "#f97316", hat: "#f97316" },
    { body: "#22c55e", hat: "#16a34a" },
    { body: "#3b82f6", hat: "#1e3a8a" },
    { body: "#a855f7", hat: "#7c3aed" },
    { body: "#14b8a6", hat: "#0f766e" },
    { body: "#f43f5e", hat: "#be123c" },
    { body: "#eab308", hat: "#a16207" },
  ];
  for (let i = 0; i < 8; i++) {
    const c = kidColors[i % kidColors.length]!;
    const kid = makeKid({ ...c, phase: i * 0.8 });
    kid.scale.setScalar(0.85);
    kid.position.set(
      (Math.random() - 0.5) * 10,
      0,
      2 + Math.random() * 8,
    );
    scene.add(kid);
    kids.push(kid);
  }

  // Town square fountain / "Oh my god they killed the lesson" monument
  const monument = new THREE.Group();
  monument.add(cylinder(0.8, 1.0, 0.3, "#94a3b8", 0, 12));
  monument.add(cylinder(0.5, 0.55, 0.9, "#64748b", 0.3, 10));
  const plaque = box(0.9, 0.4, 0.08, "#facc15", 0.7);
  plaque.position.set(0, 0, 0.55);
  monument.add(plaque);
  monument.position.set(0, 0, 2.5);
  scene.add(monument);

  // Clouds
  const clouds: THREE.Group[] = [];
  for (let i = 0; i < 6; i++) {
    const cloud = new THREE.Group();
    for (let j = 0; j < 4; j++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(0.8 + Math.random() * 0.5, 8, 6),
        mat("#ffffff", { flat: true }),
      );
      puff.position.set(j * 0.9 - 1.2, Math.random() * 0.3, (Math.random() - 0.5) * 0.8);
      cloud.add(puff);
    }
    cloud.position.set(
      (Math.random() - 0.5) * 40,
      12 + Math.random() * 4,
      -15 - Math.random() * 20,
    );
    cloud.userData.speed = 0.15 + Math.random() * 0.2;
    scene.add(cloud);
    clouds.push(cloud);
  }

  let fitDistance = 28;
  let zoomFactor = 1;
  let hoverId: string | null = null;
  let selectedId: string | null = null;
  let deskOpen = false;
  let pointerDown: { x: number; y: number; id: string | null } | null = null;
  let raf = 0;
  let disposed = false;

  function applyZoom() {
    const dir = new THREE.Vector3()
      .subVectors(camera.position, controls.target)
      .normalize();
    const dist = fitDistance / zoomFactor;
    camera.position.copy(controls.target).addScaledVector(dir, dist);
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
    const maxXZ = Math.max(size.x, size.z, 8);
    const fov = (camera.fov * Math.PI) / 180;
    const dist = (maxXZ * 0.55) / Math.tan(fov / 2) + size.y;
    fitDistance = Math.max(14, Math.min(42, dist * 1.15));
    controls.target.set(center.x, 1.0, center.z);
    camera.position.set(center.x + 10, fitDistance * 0.42, center.z + fitDistance * 0.72);
    zoomFactor = 1;
    applyZoom();
  }

  function resize() {
    const w = canvas.clientWidth || canvas.parentElement?.clientWidth || 1;
    const h = canvas.clientHeight || canvas.parentElement?.clientHeight || 1;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function pick(clientX: number, clientY: number): string | null {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(hitboxes, false);
    const hit = hits[0];
    if (!hit) return null;
    const id = hit.object.userData?.id;
    return id ? String(id) : null;
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
    pointerDown = {
      x: e.clientX,
      y: e.clientY,
      id: pick(e.clientX, e.clientY),
    };
  }

  function onPointerUp(e: PointerEvent) {
    if (!pointerDown || e.button !== 0) return;
    const dist = Math.hypot(e.clientX - pointerDown.x, e.clientY - pointerDown.y);
    const id = pick(e.clientX, e.clientY);
    if (dist < 8 && id && id === pointerDown.id) {
      selectedId = id;
      const node = nodeData.get(id);
      if (node) opts.onSelect?.(node);
    }
    pointerDown = null;
  }

  function tick(t: number) {
    if (disposed) return;
    const time = t * 0.001;

    // Snow fall
    const posAttr = snow.geometry.getAttribute("position") as THREE.BufferAttribute;
    const vel = snow.userData.vel as Float32Array;
    for (let i = 0; i < posAttr.count; i++) {
      let y = posAttr.getY(i) - vel[i]! * 0.018;
      let x = posAttr.getX(i) + Math.sin(time + i) * 0.008;
      if (y < 0) {
        y = 18 + Math.random() * 4;
        x = (Math.random() - 0.5) * 50;
        posAttr.setZ(i, (Math.random() - 0.5) * 50);
      }
      posAttr.setY(i, y);
      posAttr.setX(i, x);
    }
    posAttr.needsUpdate = true;

    // Kids wander in circles
    for (const kid of kids) {
      const u = kid.userData;
      u.angle += 0.004 * u.walkSpeed;
      const x = u.centerX + Math.cos(u.angle) * u.radius * 0.35;
      const z = u.centerZ + Math.sin(u.angle) * u.radius * 0.35 + 4;
      kid.position.x = x;
      kid.position.z = z;
      kid.position.y = Math.abs(Math.sin(time * 6 * u.walkSpeed)) * 0.06;
      kid.rotation.y = -u.angle + Math.PI / 2;
    }

    // Clouds drift
    for (const c of clouds) {
      c.position.x += c.userData.speed * 0.02;
      if (c.position.x > 30) c.position.x = -30;
    }

    // Building hover / open pulse
    for (const [id, mesh] of meshes) {
      const isHover = id === hoverId;
      const isOpen = openIds.has(id);
      const isSel = id === selectedId;
      const phase = mesh.userData.phase as number;
      const bob =
        (isHover || isOpen ? 0.08 : 0.02) * Math.sin(time * 2.2 + phase);
      mesh.position.y = bob;
      const ring = mesh.userData.ring as THREE.Mesh | undefined;
      if (ring) {
        const rm = ring.material as THREE.MeshBasicMaterial;
        rm.opacity = isOpen ? 0.75 : isHover ? 0.45 : 0;
        ring.scale.setScalar(1 + (isOpen ? 0.15 * Math.sin(time * 3) : 0));
      }
      if (isHover || isSel) {
        mesh.scale.setScalar(
          ((nodeData.get(id)?.scale ?? 1) as number) * (isHover ? 1.04 : 1.02),
        );
      } else {
        mesh.scale.setScalar(nodeData.get(id)?.scale ?? 1);
      }
    }

    // Sync hitboxes to building positions
    for (const hit of hitboxes) {
      const root = hit.userData.buildingRoot as THREE.Object3D | undefined;
      if (!root) continue;
      const box3 = new THREE.Box3().setFromObject(root);
      const size = box3.getSize(new THREE.Vector3());
      const center = box3.getCenter(new THREE.Vector3());
      hit.position.copy(center);
      hit.position.y = Math.max(size.y / 2, 0.5);
    }

    controls.update();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas.parentElement ?? canvas);
  resize();
  fitAll();

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  raf = requestAnimationFrame(tick);

  return {
    setSelected(id) {
      selectedId = id;
    },
    setOpenIds(ids) {
      openIds.clear();
      ids.forEach((id) => openIds.add(id));
    },
    setReasoning() {
      /* no-op for village */
    },
    setDeskOpen(open) {
      deskOpen = open;
      void deskOpen;
    },
    setZoom(factor) {
      zoomFactor = Math.max(0.45, Math.min(1.8, factor));
      applyZoom();
    },
    getZoom() {
      return zoomFactor;
    },
    zoomBy(delta) {
      zoomFactor = Math.max(0.45, Math.min(1.8, zoomFactor + delta));
      applyZoom();
    },
    fitAll,
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      controls.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          const m = obj.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m?.dispose();
        }
      });
    },
  };
}
