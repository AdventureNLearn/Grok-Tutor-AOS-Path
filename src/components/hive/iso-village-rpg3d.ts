/**
 * Isometric open-world Village RPG
 * WASD move · E open doors · Space fire · 1/2 weapons · Tab PEPE/APU
 * Meme cannon + Truth Sniper Rifle
 */
import * as THREE from "three";
import type { VillageBuilding } from "@/lib/south-park-village-map";
import type { HiveNode } from "@/lib/tutor-hive-map";

export type IsoInteractEvent = {
  building: VillageBuilding;
  kind: "door" | "proximity";
};

export type WeaponId = "cannon" | "sniper";

export type IsoVillageRPG = {
  setActiveHero: (id: "pepe" | "apu") => void;
  getActiveHero: () => "pepe" | "apu";
  getWeapon: () => WeaponId;
  setWeapon: (w: WeaponId) => void;
  getPlayerPos: () => { x: number; z: number };
  getNearBuilding: () => VillageBuilding | null;
  setHighlightIds: (ids: string[]) => void;
  setPaused: (p: boolean) => void;
  dispose: () => void;
};

function mat(color: string | number, flat = true) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.88,
    metalness: 0.02,
    flatShading: flat,
  });
}

function box(w: number, h: number, d: number, color: string | number, y = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.position.y = y + h / 2;
  return m;
}

function makeHeroMesh(kind: "pepe" | "apu"): THREE.Group {
  const g = new THREE.Group();
  const bodyCol = kind === "pepe" ? "#4ade80" : "#60a5fa";
  const hatCol = kind === "pepe" ? "#166534" : "#1e3a8a";
  const skin = "#f5c9a0";

  // Shadow disc
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.35, 16),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  g.add(shadow);

  // Legs
  const legL = box(0.14, 0.32, 0.14, "#222", 0);
  legL.position.x = -0.1;
  const legR = box(0.14, 0.32, 0.14, "#222", 0);
  legR.position.x = 0.1;
  g.add(legL, legR);

  // Body
  g.add(box(0.48, 0.42, 0.32, bodyCol, 0.32));

  // Arms
  const armL = box(0.12, 0.34, 0.12, bodyCol, 0.36);
  armL.position.x = -0.32;
  const armR = box(0.12, 0.34, 0.12, bodyCol, 0.36);
  armR.position.x = 0.32;
  g.add(armL, armR);

  // Head (big South Park style)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 10), mat(skin));
  head.position.y = 1.05;
  g.add(head);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.08, 8, 6);
  const eyeMat = mat("#fff");
  const eL = new THREE.Mesh(eyeGeo, eyeMat);
  eL.position.set(-0.11, 1.08, 0.3);
  const eR = new THREE.Mesh(eyeGeo, eyeMat);
  eR.position.set(0.11, 1.08, 0.3);
  g.add(eL, eR);
  const pMat = mat("#111");
  const pL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), pMat);
  pL.position.set(-0.11, 1.08, 0.36);
  const pR = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), pMat);
  pR.position.set(0.11, 1.08, 0.36);
  g.add(pL, pR);

  // Hat / headwear
  if (kind === "pepe") {
    // Frog hood vibe — green dome
    const hood = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
      mat(hatCol),
    );
    hood.position.y = 1.2;
    g.add(hood);
  } else {
    // Apu hair / turban-ish simple band + top
    const band = box(0.72, 0.12, 0.72, hatCol, 1.22);
    g.add(band);
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), mat("#fbbf24"));
    top.position.y = 1.48;
    g.add(top);
  }

  // Name plate
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = kind === "pepe" ? "#166534" : "#1e3a8a";
  ctx.fillRect(0, 0, 256, 64);
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 250, 58);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 32px Comic Sans MS, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(kind === "pepe" ? "PEPE" : "APU", 128, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }),
  );
  label.scale.set(1.2, 0.3, 1);
  label.position.y = 1.85;
  label.raycast = () => {};
  g.add(label);

  // Meme cannon (held) — weapon 1
  const cannon = new THREE.Group();
  cannon.add(box(0.55, 0.16, 0.16, "#333", 0));
  const muzzle = box(0.12, 0.2, 0.2, "#facc15", 0);
  muzzle.position.x = 0.32;
  cannon.add(muzzle);
  cannon.position.set(0.42, 0.7, 0.15);
  cannon.rotation.z = -0.2;
  g.add(cannon);

  // Truth Sniper Rifle — weapon 2
  const sniper = new THREE.Group();
  sniper.add(box(0.28, 0.14, 0.12, "#3f2a1a", 0)); // stock
  const recv = box(0.55, 0.14, 0.14, "#1f2937", 0);
  recv.position.x = 0.35;
  sniper.add(recv);
  const barrel = box(1.15, 0.08, 0.08, "#111827", 0.02);
  barrel.position.x = 1.05;
  sniper.add(barrel);
  const brake = box(0.12, 0.12, 0.12, "#374151", 0.02);
  brake.position.x = 1.68;
  sniper.add(brake);
  const scope = box(0.38, 0.1, 0.1, "#0f172a", 0.14);
  scope.position.x = 0.55;
  sniper.add(scope);
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.06, 8),
    new THREE.MeshStandardMaterial({
      color: "#4ade80",
      emissive: "#22c55e",
      emissiveIntensity: 0.85,
      flatShading: true,
    }),
  );
  glass.rotation.z = Math.PI / 2;
  glass.position.set(0.78, 0.19, 0);
  sniper.add(glass);
  const bipod = box(0.06, 0.18, 0.06, "#4b5563", -0.08);
  bipod.position.x = 0.9;
  sniper.add(bipod);
  sniper.position.set(0.35, 0.72, 0.18);
  sniper.rotation.z = -0.08;
  sniper.visible = false;
  g.add(sniper);

  g.userData.cannon = cannon;
  g.userData.sniper = sniper;
  g.userData.legs = [legL, legR];
  g.userData.arms = [armL, armR];

  return g;
}

function makeBuildingSimple(b: VillageBuilding): THREE.Group {
  const g = new THREE.Group();
  const wall = b.wallColor ?? "#e8a0a0";
  const roof = b.roofColor ?? "#7f1d1d";
  const s = b.scale ?? 1;
  const isLandmark = b.buildingKind === "landmark";
  const w = (isLandmark ? 3.2 : 1.9) * s;
  const h = (isLandmark ? 1.7 : 1.2) * s;
  const d = (isLandmark ? 2.6 : 1.6) * s;

  g.add(box(w, h, d, wall, 0));

  // Pitched roof
  const shape = new THREE.Shape();
  shape.moveTo(-w * 0.55, 0);
  shape.lineTo(w * 0.55, 0);
  shape.lineTo(0, h * 0.55);
  shape.closePath();
  const roofGeo = new THREE.ExtrudeGeometry(shape, { depth: d * 1.05, bevelEnabled: false });
  roofGeo.rotateY(Math.PI / 2);
  roofGeo.translate(0, 0, (-d * 1.05) / 2);
  const roofMesh = new THREE.Mesh(roofGeo, mat(roof));
  roofMesh.position.y = h;
  g.add(roofMesh);

  // Door (interactive face)
  const door = box(0.45 * s, 0.75 * s, 0.08, "#4a3728", 0);
  door.position.z = d / 2 + 0.02;
  door.userData.isDoor = true;
  g.add(door);

  // Door glow ring (when near)
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.55 * s, 0.7 * s, 20),
    new THREE.MeshBasicMaterial({
      color: b.color,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(0, 0.05, d / 2 + 0.4);
  g.add(ring);
  g.userData.doorRing = ring;
  g.userData.doorZ = d / 2 + 0.55;
  g.userData.halfW = w / 2 + 0.35;
  g.userData.halfD = d / 2 + 0.35;
  g.userData.color = b.color;

  // Floating name
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillRect(8, 8, 496, 80);
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, 496, 80);
  ctx.fillStyle = "#111";
  ctx.font = "bold 28px Comic Sans MS, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(b.title.slice(0, 26), 256, 48);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const spr = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }),
  );
  spr.scale.set(isLandmark ? 3.2 : 2.2, isLandmark ? 0.6 : 0.42, 1);
  spr.position.y = h + 1.1 * s;
  spr.raycast = () => {};
  g.add(spr);

  return g;
}

function makeFedslopGremlin(): THREE.Group {
  const g = new THREE.Group();
  g.add(box(0.4, 0.35, 0.3, "#a3a3a3", 0.15));
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), mat("#737373"));
  head.position.y = 0.65;
  g.add(head);
  // Red eyes
  const e = mat("#ef4444");
  const eL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), e);
  eL.position.set(-0.07, 0.68, 0.18);
  const eR = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), e);
  eR.position.set(0.07, 0.68, 0.18);
  g.add(eL, eR);
  g.userData.hp = 3;
  g.userData.vx = 0;
  g.userData.vz = 0;
  return g;
}

function makeMemeProjectile(kind: "pepe" | "apu"): THREE.Mesh {
  const color = kind === "pepe" ? "#4ade80" : "#facc15";
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 8, 6),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.65,
      flatShading: true,
    }),
  );
  // Trail ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.04, 6, 12),
    new THREE.MeshBasicMaterial({ color: "#fff", transparent: true, opacity: 0.7 }),
  );
  ring.rotation.x = Math.PI / 2;
  m.add(ring);
  return m;
}

type Collider = { minX: number; maxX: number; minZ: number; maxZ: number; id: string };

export function createIsoVillageRPG(
  canvas: HTMLCanvasElement,
  opts: {
    buildings: VillageBuilding[];
    activeHero?: "pepe" | "apu";
    onNearBuilding?: (b: VillageBuilding | null) => void;
    onEnterDoor?: (b: VillageBuilding) => void;
    onMemeHit?: (info: { kills: number }) => void;
    onHeroSwitch?: (id: "pepe" | "apu") => void;
    onWeaponSwitch?: (w: WeaponId) => void;
  },
): IsoVillageRPG {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x7eb6d9);
  scene.fog = new THREE.Fog(0x9ec5e0, 35, 75);

  // True-ish isometric via orthographic
  const aspect = 1;
  const frustum = 11;
  const camera = new THREE.OrthographicCamera(
    -frustum * aspect,
    frustum * aspect,
    frustum,
    -frustum,
    0.1,
    200,
  );
  // Classic isometric angles
  const isoDist = 28;
  const isoOffset = new THREE.Vector3(isoDist * 0.7, isoDist * 0.85, isoDist * 0.7);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;

  scene.add(new THREE.AmbientLight(0xfff5e6, 0.75));
  scene.add(new THREE.HemisphereLight(0xb8d4f0, 0xd4c8b0, 0.5));
  const sun = new THREE.DirectionalLight(0xfff0d4, 1.05);
  sun.position.set(20, 30, 12);
  sun.castShadow = true;
  scene.add(sun);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(50, 48),
    mat("#e8eef5", true),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Road
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(5.5, 36),
    mat("#4a4a4a", true),
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.02, 3);
  scene.add(road);
  const cross = new THREE.Mesh(
    new THREE.PlaneGeometry(32, 4),
    mat("#4a4a4a", true),
  );
  cross.rotation.x = -Math.PI / 2;
  cross.position.set(0, 0.025, 1);
  scene.add(cross);

  // Mountains backdrop
  for (const [x, z, h, r, col] of [
    [-24, -30, 16, 18, "#5a6a7a"],
    [0, -36, 28, 28, "#3d4d5d"],
    [22, -32, 18, 20, "#556575"],
    [-12, -34, 22, 24, "#4a5a6a"],
  ] as [number, number, number, number, string][]) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 5), mat(col));
    m.position.set(x, h / 2 - 0.5, z);
    scene.add(m);
    const cap = new THREE.Mesh(
      new THREE.ConeGeometry(r * 0.4, h * 0.3, 5),
      mat("#f8fafc"),
    );
    cap.position.set(x, h * 0.7, z);
    scene.add(cap);
  }

  // Buildings + colliders
  const buildingRoots = new Map<string, THREE.Group>();
  const nodeData = new Map<string, VillageBuilding>();
  const colliders: Collider[] = [];
  const highlightIds = new Set<string>();

  for (const b of opts.buildings) {
    const mesh = makeBuildingSimple(b);
    mesh.position.set(b.x, 0, b.z);
    if (b.rotY) mesh.rotation.y = b.rotY;
    mesh.userData.id = b.id;
    scene.add(mesh);
    buildingRoots.set(b.id, mesh);
    nodeData.set(b.id, b);
    const hw = mesh.userData.halfW as number;
    const hd = mesh.userData.halfD as number;
    colliders.push({
      id: b.id,
      minX: b.x - hw,
      maxX: b.x + hw,
      minZ: b.z - hd,
      maxZ: b.z + hd,
    });
  }

  // Player heroes
  let activeHero: "pepe" | "apu" = opts.activeHero ?? "pepe";
  const pepeMesh = makeHeroMesh("pepe");
  const apuMesh = makeHeroMesh("apu");
  pepeMesh.position.set(0, 0, 4);
  apuMesh.position.set(0.8, 0, 4.2);
  apuMesh.visible = false;
  scene.add(pepeMesh, apuMesh);

  function playerMesh() {
    return activeHero === "pepe" ? pepeMesh : apuMesh;
  }

  // Companion follows loosely
  function companionMesh() {
    return activeHero === "pepe" ? apuMesh : pepeMesh;
  }

  // Fedslop gremlins to blast
  const gremlins: THREE.Group[] = [];
  for (let i = 0; i < 10; i++) {
    const g = makeFedslopGremlin();
    g.position.set(
      (Math.random() - 0.5) * 22,
      0,
      (Math.random() - 0.5) * 18 + 2,
    );
    g.userData.phase = Math.random() * Math.PI * 2;
    g.userData.speed = 0.8 + Math.random() * 0.6;
    scene.add(g);
    gremlins.push(g);
  }

  // Projectiles (meme cannon only — sniper is hitscan)
  type Proj = {
    mesh: THREE.Mesh;
    vx: number;
    vz: number;
    life: number;
    kind: "pepe" | "apu";
  };
  const projs: Proj[] = [];

  // Sniper tracers / impact sparks
  type Tracer = { obj: THREE.Object3D; life: number };
  const tracers: Tracer[] = [];

  // Snow particles
  const snowCount = 500;
  const snowGeo = new THREE.BufferGeometry();
  const snowPos = new Float32Array(snowCount * 3);
  for (let i = 0; i < snowCount; i++) {
    snowPos[i * 3] = (Math.random() - 0.5) * 45;
    snowPos[i * 3 + 1] = Math.random() * 18;
    snowPos[i * 3 + 2] = (Math.random() - 0.5) * 45;
  }
  snowGeo.setAttribute("position", new THREE.BufferAttribute(snowPos, 3));
  const snow = new THREE.Points(
    snowGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.8 }),
  );
  scene.add(snow);

  // Input
  const keys = new Set<string>();
  let nearBuilding: VillageBuilding | null = null;
  let paused = false;
  let disposed = false;
  let raf = 0;
  let lastT = performance.now();
  let facingX = 0;
  let facingZ = 1;
  let fireCooldown = 0;
  let bobT = 0;
  let kills = 0;
  let weapon: WeaponId = "sniper"; // default the new toy
  let aiming = false;

  function applyWeaponVisuals() {
    for (const m of [pepeMesh, apuMesh]) {
      const c = m.userData.cannon as THREE.Group | undefined;
      const s = m.userData.sniper as THREE.Group | undefined;
      if (c) c.visible = weapon === "cannon";
      if (s) s.visible = weapon === "sniper";
    }
  }
  applyWeaponVisuals();

  function setWeapon(w: WeaponId) {
    weapon = w;
    applyWeaponVisuals();
    opts.onWeaponSwitch?.(w);
  }

  function aimDir(): { fx: number; fz: number } {
    let fx = facingX;
    let fz = facingZ;
    if (Math.abs(fx) + Math.abs(fz) < 0.01) {
      fx = 0;
      fz = 1;
    }
    const len = Math.hypot(fx, fz) || 1;
    return { fx: fx / len, fz: fz / len };
  }

  function damageGremlin(g: THREE.Group, dmg: number, knockX: number, knockZ: number) {
    if (!g.visible) return false;
    g.userData.hp -= dmg;
    g.userData.vx = knockX;
    g.userData.vz = knockZ;
    if (g.userData.hp <= 0) {
      g.visible = false;
      kills += 1;
      opts.onMemeHit?.({ kills });
      window.setTimeout(() => {
        if (disposed) return;
        g.visible = true;
        g.userData.hp = 3;
        g.position.set(
          (Math.random() - 0.5) * 20,
          0,
          (Math.random() - 0.5) * 16 + 2,
        );
      }, 4000);
      return true;
    }
    return false;
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    const k = e.key.toLowerCase();
    keys.add(k);
    // Don't steal typing from inputs
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    if (k === "tab") {
      e.preventDefault();
      activeHero = activeHero === "pepe" ? "apu" : "pepe";
      pepeMesh.visible = true;
      apuMesh.visible = true;
      companionMesh().position.set(
        playerMesh().position.x + 0.7,
        0,
        playerMesh().position.z + 0.4,
      );
      playerMesh().scale.setScalar(1.05);
      companionMesh().scale.setScalar(0.88);
      applyWeaponVisuals();
      opts.onHeroSwitch?.(activeHero);
    }
    if (k === "e" || k === "enter") {
      if (nearBuilding) opts.onEnterDoor?.(nearBuilding);
    }
    if (k === "1") setWeapon("cannon");
    if (k === "2") setWeapon("sniper");
    if (k === "r") setWeapon(weapon === "sniper" ? "cannon" : "sniper");
    if (k === "v" || k === "control") {
      aiming = true;
    }
    if (k === " " || k === "f") {
      e.preventDefault();
      fireWeapon();
    }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    keys.delete(k);
    if (k === "v" || k === "control") aiming = false;
  };
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  // Both heroes visible; active slightly bigger
  pepeMesh.visible = true;
  apuMesh.visible = true;
  pepeMesh.scale.setScalar(1.05);
  apuMesh.scale.setScalar(0.88);

  function fireWeapon() {
    if (weapon === "sniper") fireSniper();
    else fireCannon();
  }

  function fireCannon() {
    if (paused || fireCooldown > 0) return;
    fireCooldown = 0.28;
    const p = playerMesh();
    const mesh = makeMemeProjectile(activeHero);
    mesh.position.set(p.position.x, 0.75, p.position.z);
    const { fx, fz } = aimDir();
    const speed = 14;
    scene.add(mesh);
    projs.push({
      mesh,
      vx: fx * speed,
      vz: fz * speed,
      life: 1.4,
      kind: activeHero,
    });
    const cannon = p.userData.cannon as THREE.Group | undefined;
    if (cannon) cannon.rotation.z = -0.55;
  }

  function fireSniper() {
    if (paused || fireCooldown > 0) return;
    // Slower fire rate — big boom
    fireCooldown = aiming ? 0.55 : 0.85;
    const p = playerMesh();
    const { fx, fz } = aimDir();
    const range = aiming ? 42 : 28;
    const origin = new THREE.Vector3(p.position.x, 0.9, p.position.z);
    const end = new THREE.Vector3(
      p.position.x + fx * range,
      0.9,
      p.position.z + fz * range,
    );

    // Hitscan: closest gremlin along the ray
    let best: THREE.Group | null = null;
    let bestT = range;
    for (const g of gremlins) {
      if (!g.visible) continue;
      // Point-to-segment distance on XZ
      const dx = g.position.x - origin.x;
      const dz = g.position.z - origin.z;
      const t = dx * fx + dz * fz;
      if (t < 0.4 || t > range) continue;
      const closestX = origin.x + fx * t;
      const closestZ = origin.z + fz * t;
      const dist = Math.hypot(g.position.x - closestX, g.position.z - closestZ);
      // Tighter cone when aiming
      const thresh = aiming ? 0.85 : 1.35;
      if (dist < thresh && t < bestT) {
        bestT = t;
        best = g;
      }
    }

    if (best) {
      end.set(origin.x + fx * bestT, 0.9, origin.z + fz * bestT);
      // One-shot when ADS, chunky damage otherwise
      damageGremlin(best, aiming ? 99 : 3, fx * 8, fz * 8);
    }

    // Laser tracer
    const geo = new THREE.BufferGeometry().setFromPoints([origin, end]);
    const matLine = new THREE.LineBasicMaterial({
      color: activeHero === "pepe" ? 0x4ade80 : 0x60a5fa,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    const line = new THREE.Line(geo, matLine);
    scene.add(line);
    tracers.push({ obj: line, life: 0.18 });

    // Impact spark at end
    const spark = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 6),
      new THREE.MeshBasicMaterial({
        color: 0xfacc15,
        transparent: true,
        opacity: 1,
      }),
    );
    spark.position.copy(end);
    scene.add(spark);
    tracers.push({ obj: spark, life: 0.12 });

    // Recoil on sniper
    const sniper = p.userData.sniper as THREE.Group | undefined;
    if (sniper) sniper.rotation.z = -0.35;
    // Tiny camera punch via player bob
    bobT += 0.8;
  }

  function collides(x: number, z: number, radius = 0.35): boolean {
    // World bounds
    if (Math.hypot(x, z) > 28) return true;
    for (const c of colliders) {
      if (
        x + radius > c.minX &&
        x - radius < c.maxX &&
        z + radius > c.minZ &&
        z - radius < c.maxZ
      ) {
        return true;
      }
    }
    return false;
  }

  function updateNear() {
    const p = playerMesh().position;
    let best: VillageBuilding | null = null;
    let bestD = 2.4;
    for (const b of opts.buildings) {
      const root = buildingRoots.get(b.id);
      if (!root) continue;
      // Door is on +Z face of building
      const doorX = b.x;
      const doorZ = b.z + (root.userData.doorZ as number);
      const d = Math.hypot(p.x - doorX, p.z - doorZ);
      const ring = root.userData.doorRing as THREE.Mesh;
      const rm = ring.material as THREE.MeshBasicMaterial;
      if (d < 2.4) {
        rm.opacity = 0.35 + Math.sin(performance.now() * 0.008) * 0.2;
        if (d < bestD) {
          bestD = d;
          best = b;
        }
      } else {
        rm.opacity = highlightIds.has(b.id) ? 0.25 : 0;
      }
    }
    if (best?.id !== nearBuilding?.id) {
      nearBuilding = best;
      opts.onNearBuilding?.(best);
    } else {
      nearBuilding = best;
    }
  }

  function resize() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    const a = w / h;
    const f = 11;
    camera.left = -f * a;
    camera.right = f * a;
    camera.top = f;
    camera.bottom = -f;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas.parentElement ?? canvas);
  resize();

  function tick(now: number) {
    if (disposed) return;
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;

    if (!paused) {
      bobT += dt;
      fireCooldown = Math.max(0, fireCooldown - dt);

      // Movement
      let mx = 0;
      let mz = 0;
      if (keys.has("w") || keys.has("arrowup")) mz -= 1;
      if (keys.has("s") || keys.has("arrowdown")) mz += 1;
      if (keys.has("a") || keys.has("arrowleft")) mx -= 1;
      if (keys.has("d") || keys.has("arrowright")) mx += 1;

      // Isometric-friendly: screen-relative-ish (X/Z world)
      if (mx || mz) {
        const len = Math.hypot(mx, mz);
        mx /= len;
        mz /= len;
        facingX = mx;
        facingZ = mz;
        const speed = keys.has("shift") ? 9.5 : 6.2;
        const p = playerMesh().position;
        const nx = p.x + mx * speed * dt;
        const nz = p.z + mz * speed * dt;
        if (!collides(nx, p.z)) p.x = nx;
        if (!collides(p.x, nz)) p.z = nz;
        playerMesh().rotation.y = Math.atan2(mx, mz);

        // Walk bob
        const legs = playerMesh().userData.legs as THREE.Mesh[];
        if (legs) {
          legs[0]!.rotation.x = Math.sin(bobT * 12) * 0.45;
          legs[1]!.rotation.x = Math.sin(bobT * 12 + Math.PI) * 0.45;
        }
      }

      // Companion AI — follow
      const comp = companionMesh();
      const lead = playerMesh().position;
      const cdx = lead.x - 0.9 - comp.position.x;
      const cdz = lead.z - 0.5 - comp.position.z;
      const cd = Math.hypot(cdx, cdz);
      if (cd > 0.4) {
        const cs = Math.min(5.5, cd * 3);
        const cx = comp.position.x + (cdx / cd) * cs * dt;
        const cz = comp.position.z + (cdz / cd) * cs * dt;
        if (!collides(cx, comp.position.z, 0.3)) comp.position.x = cx;
        if (!collides(comp.position.x, cz, 0.3)) comp.position.z = cz;
        comp.rotation.y = Math.atan2(cdx, cdz);
      }
      // Active scale pulse
      playerMesh().scale.setScalar(1.05 + Math.sin(bobT * 3) * 0.02);
      companionMesh().scale.setScalar(0.88);

      // Weapon recoil settle
      const cannon = playerMesh().userData.cannon as THREE.Group | undefined;
      if (cannon && cannon.rotation.z < -0.2) {
        cannon.rotation.z += dt * 2.5;
      }
      const sniperW = playerMesh().userData.sniper as THREE.Group | undefined;
      if (sniperW && sniperW.rotation.z < -0.08) {
        sniperW.rotation.z += dt * 1.8;
      }
      // ADS pose — dip slightly
      if (weapon === "sniper" && sniperW) {
        sniperW.position.y = aiming ? 0.78 : 0.72;
        sniperW.position.z = aiming ? 0.28 : 0.18;
      }

      // Gremlins wander + flee meme
      for (const g of gremlins) {
        if (!g.visible) continue;
        g.userData.phase += dt * g.userData.speed;
        const gx =
          g.position.x + Math.cos(g.userData.phase) * 1.2 * dt;
        const gz =
          g.position.z + Math.sin(g.userData.phase * 0.9) * 1.2 * dt;
        if (!collides(gx, g.position.z, 0.25)) g.position.x = gx;
        if (!collides(g.position.x, gz, 0.25)) g.position.z = gz;
        g.position.y = Math.abs(Math.sin(g.userData.phase * 4)) * 0.05;
        // Knockback velocity
        if (g.userData.vx || g.userData.vz) {
          g.position.x += g.userData.vx * dt;
          g.position.z += g.userData.vz * dt;
          g.userData.vx *= 0.9;
          g.userData.vz *= 0.9;
        }
      }

      // Projectiles
      for (let i = projs.length - 1; i >= 0; i--) {
        const pr = projs[i]!;
        pr.life -= dt;
        pr.mesh.position.x += pr.vx * dt;
        pr.mesh.position.z += pr.vz * dt;
        pr.mesh.position.y = 0.75 + Math.sin(pr.life * 20) * 0.05;
        pr.mesh.rotation.y += dt * 10;

        // Hit gremlins
        for (const g of gremlins) {
          if (!g.visible) continue;
          const d = Math.hypot(
            g.position.x - pr.mesh.position.x,
            g.position.z - pr.mesh.position.z,
          );
          if (d < 0.7) {
            damageGremlin(g, 1, pr.vx * 0.4, pr.vz * 0.4);
            pr.life = 0;
            break;
          }
        }

        if (pr.life <= 0) {
          scene.remove(pr.mesh);
          pr.mesh.geometry.dispose();
          (pr.mesh.material as THREE.Material).dispose();
          projs.splice(i, 1);
        }
      }

      // Sniper tracers / sparks fade
      for (let i = tracers.length - 1; i >= 0; i--) {
        const tr = tracers[i]!;
        tr.life -= dt;
        const obj = tr.obj;
        if (obj instanceof THREE.Line) {
          const m = obj.material as THREE.LineBasicMaterial;
          m.opacity = Math.max(0, tr.life * 5);
        } else if (obj instanceof THREE.Mesh) {
          const m = obj.material as THREE.MeshBasicMaterial;
          m.opacity = Math.max(0, tr.life * 8);
          obj.scale.multiplyScalar(1 + dt * 4);
        }
        if (tr.life <= 0) {
          scene.remove(obj);
          if (obj instanceof THREE.Line || obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            (obj.material as THREE.Material).dispose();
          }
          tracers.splice(i, 1);
        }
      }

      updateNear();

      // Snow
      const attr = snow.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < snowCount; i++) {
        let y = attr.getY(i) - dt * (0.8 + (i % 5) * 0.15);
        if (y < 0) y = 16;
        attr.setY(i, y);
      }
      attr.needsUpdate = true;
    }

    // Camera follow isometric
    const target = playerMesh().position;
    const desired = new THREE.Vector3(
      target.x + isoOffset.x * 0.35,
      isoOffset.y * 0.55,
      target.z + isoOffset.z * 0.35,
    );
    camera.position.lerp(desired, 1 - Math.pow(0.001, dt));
    camera.lookAt(target.x, 0.6, target.z);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);

  return {
    setActiveHero(id) {
      activeHero = id;
      pepeMesh.scale.setScalar(id === "pepe" ? 1.05 : 0.88);
      apuMesh.scale.setScalar(id === "apu" ? 1.05 : 0.88);
      applyWeaponVisuals();
    },
    getActiveHero: () => activeHero,
    getWeapon: () => weapon,
    setWeapon,
    getPlayerPos: () => {
      const p = playerMesh().position;
      return { x: p.x, z: p.z };
    },
    getNearBuilding: () => nearBuilding,
    setHighlightIds(ids) {
      highlightIds.clear();
      ids.forEach((id) => highlightIds.add(id));
    },
    setPaused(p) {
      paused = p;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
          const o = obj as THREE.Mesh | THREE.Line;
          o.geometry?.dispose();
          const m = o.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else (m as THREE.Material | undefined)?.dispose?.();
        }
      });
    },
  };
}
