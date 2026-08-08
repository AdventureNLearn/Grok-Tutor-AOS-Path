/**
 * Public Tutor Hive map — workspace combs + skill field.
 * Design language from the local Brain Hive; nodes map only to
 * public educational routes, industries, and tutor-safe skills.
 * Never includes private ops / quarantine surfaces.
 */

import { AOS_SKILLS, SKILL_CATEGORIES, type SkillCategory } from "./aos-skills";
import { INDUSTRIES, SECTORS, type IndustrySector } from "./industries";
import { ORCH_PRIORITY_SKILLS } from "./hive-orchestration-sim";
import { RELEASE_CURRICULUM, releaseHudLine } from "./release-curriculum";

export type HiveNodeKind = "workspace" | "skill" | "industry";

export type HiveNode = {
  id: string;
  kind: HiveNodeKind;
  acr: string;
  title: string;
  description: string;
  how: string;
  color: string;
  /** In-app route when clicked */
  href: string;
  meta?: string;
  enabled?: boolean;
};

const WS_COLORS = {
  learn: "#2dd4bf",
  samples: "#a78bfa",
  industries: "#60a5fa",
  skills: "#fbbf24",
  path: "#f472b6",
  progress: "#4ade80",
  help: "#94a3b8",
  cad: "#38bdf8",
  library: "#c084fc",
  credits: "#94a3b8",
  itshabbening: "#e879f9",
} as const;

const CAT_COLORS: Record<SkillCategory, string> = {
  core: "#c4b5fd",
  narrative: "#f9a8d4",
  civic: "#93c5fd",
  content: "#6ee7b7",
  visual: "#fcd34d",
  specialized: "#fdba74",
};

const SECTOR_COLORS: Record<IndustrySector, string> = {
  trades: "#5eead4",
  health: "#f87171",
  tech: "#818cf8",
  business: "#fbbf24",
  public: "#60a5fa",
  creative: "#e879f9",
  logistics: "#34d399",
  education: "#a3e635",
};

function acrFrom(name: string, fallback: string): string {
  const words = name.replace(/[^a-zA-Z0-9\s]/g, " ").trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0]![0]! + words[1]![0]!).toUpperCase();
  }
  return (name.slice(0, 3) || fallback).toUpperCase();
}

/** Elevated workspace combs — primary product surfaces */
export function buildWorkspaceCombs(): HiveNode[] {
  return [
    {
      id: "ws:learn",
      kind: "workspace",
      acr: "LRN",
      title: "Live session",
      description: "Open a guided craft lesson — explain, practice, quiz, or on-the-job.",
      how: "Start learning. Pick an industry and mode in the desk.",
      color: WS_COLORS.learn,
      href: "/tutor",
      meta: "6 modes · live tutor",
    },
    {
      id: "ws:samples",
      kind: "workspace",
      acr: "SMP",
      title: "Sample lessons",
      description: "Multi-turn craft dialogues across every industry pack and six modes.",
      how: "Browse craft-specific dialogues, then open a live session for that craft.",
      color: WS_COLORS.samples,
      href: "/demo",
      meta: `${RELEASE_CURRICULUM.industries} industries · ${RELEASE_CURRICULUM.modes} modes`,
    },
    {
      id: "ws:library",
      kind: "workspace",
      acr: "LIB",
      title: "Training library",
      description:
        "Curriculum hub: ready lessons by craft, Plan Lab, and clear entry points for learning.",
      how: "Browse ready lessons, open Plan Lab, or jump into samples and live sessions.",
      color: WS_COLORS.library,
      href: "/library",
      meta: `${RELEASE_CURRICULUM.readyPublicClean} ready · ${RELEASE_CURRICULUM.planLabTotal} Plan Lab`,
    },
    {
      id: "ws:industries",
      kind: "workspace",
      acr: "IND",
      title: "Industries",
      description: "Trades, health, tech, public service, and more.",
      how: "Filter the catalog, then open a live session for that craft.",
      color: WS_COLORS.industries,
      href: "/explore",
      meta: `${INDUSTRIES.length} crafts`,
    },
    {
      id: "ws:skills",
      kind: "workspace",
      acr: "THK",
      title: "Thinking tools",
      description: "Tutor-safe lenses: evidence, civic judgment, clear writing.",
      how: "Click a skill node below, or open the full tool map.",
      color: WS_COLORS.skills,
      href: "/skills",
      meta: `${AOS_SKILLS.filter((s) => s.tutorEnabled).length} tools`,
    },
    {
      id: "ws:path",
      kind: "workspace",
      acr: "PTH",
      title: "Your path",
      description: "Get started path and vault-style next steps.",
      how: "Map how to use Grok Tutor in your first weeks.",
      color: WS_COLORS.path,
      href: "/path",
      meta: "PATH · get started",
    },
    {
      id: "ws:progress",
      kind: "workspace",
      acr: "PRG",
      title: "Progress",
      description: "Sessions, study minutes, and notes stored in your browser.",
      how: "Review what you practiced and pick up where you left off.",
      color: WS_COLORS.progress,
      href: "/progress",
      meta: "Local notes",
    },
    {
      id: "ws:help",
      kind: "workspace",
      acr: "HLP",
      title: "How to use",
      description: "Quick start for The Hive, samples, live learn, and six modes.",
      how: "Open the guide: samples vs live, modes, and how The Hive works.",
      color: WS_COLORS.help,
      href: "/help",
      meta: "Guide",
    },
    {
      id: "ws:cad-lab",
      kind: "workspace",
      acr: "CAD",
      title: "Plan Lab · MAC + PartMode",
      description:
        "CAD learning lab: MAC pipeline samples + PartMode literacy — session approve, preview→commit, claim discipline.",
      how: "Open Plan Lab for briefs, plans, QA routing, and PartMode literacy (offline curriculum).",
      color: WS_COLORS.cad,
      href: "/labs/cad",
      meta: `${RELEASE_CURRICULUM.planLabTotal} samples · offline`,
    },
    {
      id: "ws:credits",
      kind: "workspace",
      acr: "CRD",
      title: "Credits & lineage",
      description:
        "Third-party research credits: MAC, PartMode literacy, CAI-OS conceptual spark — clean product chrome.",
      how: "Open full attribution. No secrets. No private ops brands.",
      color: WS_COLORS.credits,
      href: "/credits",
      meta: "MAC · PartMode · CAI-OS",
    },
    // ITSHABBENING / meme village are NOT professional workspace combs.
    // Access only via meme routes (/itshabbening, /meme-village) — see tutor-lane.ts.
  ];
}

/** Meme-lane nodes only — never mixed into the default professional hive field. */
export function buildMemeLaneCombs(): HiveNode[] {
  return [
    {
      id: "ws:itshabbening",
      kind: "workspace",
      acr: "ITS",
      title: "ITSHABBENING",
      description:
        "The anti-bullshit note pile. Dated. Sourced. Limits. Meme energy, real habits.",
      how: "Meme lane only. Same safety facts as Grok Tutor — different clothes.",
      color: WS_COLORS.itshabbening,
      href: "/itshabbening",
      meta: "MEME LANE · not pro UI",
    },
    {
      id: "ws:meme-village",
      kind: "workspace",
      acr: "VLG",
      title: "Meme village",
      description: "Pepe & Apu isometric playground — not the professional tutor shell.",
      how: "Optional meme surface. Professional learning stays on the Tutor Hive.",
      color: "#facc15",
      href: "/meme-village",
      meta: "MEME LANE · separated",
    },
  ];
}

/** Skill carpet — only tutor-enabled nodes are fully interactive */
export function buildSkillField(limit = 48): HiveNode[] {
  const enabled = AOS_SKILLS.filter((s) => s.tutorEnabled);
  const rest = AOS_SKILLS.filter((s) => !s.tutorEnabled);
  // Pin orchestration-critical skills first so Play scenarios can light real tools
  const priority = new Set<string>(ORCH_PRIORITY_SKILLS as unknown as string[]);
  const pin = enabled.filter((s) => priority.has(s.id));
  const pinRest = enabled.filter((s) => !priority.has(s.id));
  const ordered = [...pin, ...pinRest, ...rest].slice(0, limit);

  return ordered.map((s) => ({
    id: `sk:${s.id}`,
    kind: "skill" as const,
    acr: acrFrom(s.name, s.id.slice(0, 3)),
    title: s.name,
    description: s.purpose,
    how: s.tutorEnabled
      ? `Open tool detail, then use it in Learn. ${s.askPrompt}`
      : "Shown for map completeness — not enabled in the live tutor (tutor-safe subset only).",
    color: CAT_COLORS[s.category] ?? "#a1a1aa",
    href: s.tutorEnabled ? `/skills/${s.id}` : "/skills",
    meta: SKILL_CATEGORIES.find((c) => c.id === s.category)?.label ?? s.category,
    enabled: s.tutorEnabled,
  }));
}

/** Optional industry ring — craft entry points into samples / learn */
export function buildIndustryField(limit = 24): HiveNode[] {
  return INDUSTRIES.slice(0, limit).map((ind) => ({
    id: `ind:${ind.id}`,
    kind: "industry" as const,
    acr: acrFrom(ind.name, ind.id.slice(0, 3)),
    title: ind.name,
    description: ind.blurb,
    how: ind.safetyFirst
      ? "Safety-first craft. Open samples or start a live session."
      : "Open samples or start a live session for this craft.",
    color: SECTOR_COLORS[ind.sector] ?? "#94a3b8",
    // Open live tutor pre-scoped to this craft (not a nested hive)
    href: `/tutor?industry=${encodeURIComponent(ind.id)}`,
    meta: SECTORS.find((s) => s.id === ind.sector)?.label ?? ind.sector,
    enabled: true,
  }));
}

export function hiveHudSummary() {
  const skills = AOS_SKILLS.filter((s) => s.tutorEnabled).length;
  return {
    workspaces: buildWorkspaceCombs().length,
    skills,
    industries: INDUSTRIES.length,
    planLab: RELEASE_CURRICULUM.planLabTotal,
    readyPublicClean: RELEASE_CURRICULUM.readyPublicClean,
    label: releaseHudLine(),
  };
}
