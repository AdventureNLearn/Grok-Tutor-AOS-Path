/**
 * South Park–style village map for the hub.
 * Homage aesthetic (cutout town, snow, mountains) — original names, product routes.
 * Compatible with hive desk openFromNode via HiveNode shape.
 */

import type { HiveNode } from "./tutor-hive-map";
import { INDUSTRIES } from "./industries";
import { AOS_SKILLS } from "./aos-skills";

export type VillageBuildingKind =
  | "landmark"
  | "shop"
  | "house"
  | "prop";

export type VillageBuilding = HiveNode & {
  kind: "workspace" | "skill" | "industry";
  buildingKind: VillageBuildingKind;
  /** World position on the village grid */
  x: number;
  z: number;
  rotY?: number;
  /** Building archetype for mesh factory */
  archetype:
    | "school"
    | "bus"
    | "hall"
    | "library"
    | "church"
    | "center"
    | "trail"
    | "shop"
    | "house"
    | "trailer";
  scale?: number;
  roofColor?: string;
  wallColor?: string;
};

const LANDMARKS: Omit<VillageBuilding, "kind">[] = [
  {
    id: "ws:learn",
    buildingKind: "landmark",
    archetype: "school",
    acr: "SCH",
    title: "South Park Elementary",
    description:
      "Where the kids learn stuff. Open a live tutor session — explain, practice, quiz, or on-the-job.",
    how: "Click the school. Class is in session. Max 5 floating desks.",
    color: "#facc15",
    href: "/tutor?lane=meme",
    meta: "LIVE LEARN · meme lane",
    x: 0,
    z: -6,
    wallColor: "#e8e0c8",
    roofColor: "#c45c26",
    scale: 1.35,
  },
  {
    id: "ws:samples",
    buildingKind: "landmark",
    archetype: "bus",
    acr: "BUS",
    title: "The Big Yellow Bus",
    description:
      "192 sample rides across every industry. Hop on, watch the dialogue, bail if it sucks.",
    how: "Click the bus. Browse sample lessons without committing to a live session.",
    color: "#fbbf24",
    href: "/demo",
    meta: "32 industries · 6 modes",
    x: -8,
    z: 2,
    wallColor: "#f5d547",
    roofColor: "#222222",
    scale: 1.1,
  },
  {
    id: "ws:industries",
    buildingKind: "landmark",
    archetype: "hall",
    acr: "HALL",
    title: "Town Hall",
    description:
      "Every craft in the catalog — trades, health, tech, public service, the works.",
    how: "Click Town Hall. Pick your industry. Don't elect Kenny mayor.",
    color: "#60a5fa",
    href: "/explore",
    meta: `${INDUSTRIES.length} crafts`,
    x: 8,
    z: -4,
    wallColor: "#d4c4a8",
    roofColor: "#4a5568",
    scale: 1.25,
  },
  {
    id: "ws:skills",
    buildingKind: "landmark",
    archetype: "library",
    acr: "LIB",
    title: "Public Library",
    description:
      "Thinking tools that keep you honest — evidence, civic judgment, clear writing.",
    how: "Click the library. Attach tools to your learning brain.",
    color: "#fbbf24",
    href: "/skills",
    meta: `${AOS_SKILLS.filter((s) => s.tutorEnabled).length} tools`,
    x: -7,
    z: -8,
    wallColor: "#c4b5a0",
    roofColor: "#6b3a2a",
    scale: 1.15,
  },
  {
    id: "ws:itshabbening",
    buildingKind: "landmark",
    archetype: "church",
    acr: "ITS",
    title: "The Note Church",
    description:
      "ITSHABBENING. Dated notes. Sourced. Limits. Meme energy, real habits. Respect the pile.",
    how: "Click it. Browse the bag. Tutor yanks notes into Learn so it doesn't freestyle.",
    color: "#e879f9",
    href: "/itshabbening",
    meta: "MEME LANE · holy bag",
    x: 7,
    z: -10,
    wallColor: "#f5f0e6",
    roofColor: "#7c3aed",
    scale: 1.2,
  },
  {
    id: "ws:progress",
    buildingKind: "landmark",
    archetype: "center",
    acr: "GYM",
    title: "Community Center",
    description:
      "Sessions, study minutes, notes in your browser. Your local progress board.",
    how: "Click the gym. See what you actually did.",
    color: "#4ade80",
    href: "/progress",
    meta: "Local notes",
    x: 10,
    z: 4,
    wallColor: "#a8c8e0",
    roofColor: "#1e40af",
    scale: 1.1,
  },
  {
    id: "ws:path",
    buildingKind: "landmark",
    archetype: "trail",
    acr: "TRL",
    title: "Trailhead",
    description:
      "Get-started path. First weeks with the tutor mapped like a mountain trail.",
    how: "Click the trail sign. Map your first weeks.",
    color: "#f472b6",
    href: "/path",
    meta: "PATH · get started",
    x: -11,
    z: -2,
    wallColor: "#8b6914",
    roofColor: "#3f6212",
    scale: 0.95,
  },
];

/** Landmark buildings (primary product surfaces) */
export function buildVillageLandmarks(): VillageBuilding[] {
  return LANDMARKS.map((b) => ({
    ...b,
    kind: "workspace" as const,
  }));
}

/** Industry houses lining the street */
export function buildVillageHouses(limit = 12): VillageBuilding[] {
  const palette = [
    { wall: "#e8a0a0", roof: "#7f1d1d" },
    { wall: "#a0c4e8", roof: "#1e3a5f" },
    { wall: "#c8e8a0", roof: "#3f6212" },
    { wall: "#e8d4a0", roof: "#92400e" },
    { wall: "#d4a0e8", roof: "#581c87" },
    { wall: "#a0e8d4", roof: "#115e59" },
  ];
  return INDUSTRIES.slice(0, limit).map((ind, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const row = Math.floor(i / 2);
    const pal = palette[i % palette.length]!;
    return {
      id: `ind:${ind.id}`,
      kind: "industry" as const,
      buildingKind: "house" as const,
      archetype: (i % 5 === 0 ? "trailer" : "house") as VillageBuilding["archetype"],
      acr: ind.name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 3),
      title: ind.name,
      description: ind.blurb,
      how: "Click the house. Opens that craft's sample pack + learn path.",
      color: pal.wall,
      href: `/demo/${ind.id}`,
      meta: ind.sector,
      x: side * (5.5 + (row % 2) * 0.4),
      z: 6 + row * 2.8,
      rotY: side > 0 ? -0.15 : 0.15,
      wallColor: pal.wall,
      roofColor: pal.roof,
      scale: 0.75 + (i % 3) * 0.05,
      enabled: true,
    };
  });
}

/** All interactive village nodes */
export function buildVillageNodes(): VillageBuilding[] {
  return [...buildVillageLandmarks(), ...buildVillageHouses(12)];
}

export function villageHudSummary() {
  const nodes = buildVillageNodes();
  return {
    label: "SOUTH PARK VILLAGE · ITSHABBENING HUB",
    buildings: nodes.length,
    landmarks: buildVillageLandmarks().length,
  };
}
