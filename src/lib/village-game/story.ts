/**
 * Campaign: PEPE & APU destroy the South Park Fedslop Narrative.
 */
import type { EnemyId } from "./enemies";
import type { QuestLocationId } from "./quests";

export type Chapter = {
  id: number;
  title: string;
  subtitle: string;
  synopsis: string;
  locationId: QuestLocationId;
  bossId: EnemyId | null;
  /** Quests required to clear chapter (cumulative) */
  questsRequired: number;
  rewardGold: number;
  rewardTruth: number;
  pepeLine: string;
  apuLine: string;
};

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "Slop in the Snow",
    subtitle: "Chapter I",
    synopsis:
      "South Park looks normal — until you notice every joke is pre-chewed. Fedslop gremlins infest Main Street. Pepe stares. Apu brings receipts.",
    locationId: "street",
    bossId: null,
    questsRequired: 25,
    rewardGold: 40,
    rewardTruth: 15,
    pepeLine: "Feels bad man… this town's running on nutrient paste.",
    apuLine: "I have invoices for every lie on this street.",
  },
  {
    id: 2,
    title: "Elementary Gaslight",
    subtitle: "Chapter II",
    synopsis:
      "The school teaches The Message between math problems. Talking-point bots grade on vibes. Truth tellers crash assembly.",
    locationId: "ws:learn",
    bossId: null,
    questsRequired: 75,
    rewardGold: 70,
    rewardTruth: 25,
    pepeLine: "Curriculum is mid. Sources are rare.",
    apuLine: "Please show your work — and your funding.",
  },
  {
    id: 3,
    title: "Bus of Approved Takes",
    subtitle: "Chapter III",
    synopsis:
      "The big yellow bus only stops at consensus. Pepe and Apu hijack the route with primary sources.",
    locationId: "ws:samples",
    bossId: null,
    questsRequired: 125,
    rewardGold: 90,
    rewardTruth: 30,
    pepeLine: "Next stop: reality.",
    apuLine: "Transfers accepted. Copium is not legal tender.",
  },
  {
    id: 4,
    title: "Town Hall of Midwits",
    subtitle: "Chapter IV",
    synopsis:
      "PowerPoints outnumber citizens. The Midwit Manager declares narrative martial law. Time to shred.",
    locationId: "ws:industries",
    bossId: "midwit_manager",
    questsRequired: 200,
    rewardGold: 120,
    rewardTruth: 40,
    pepeLine: "Circle back to the evidence.",
    apuLine: "Your slide deck is not a jurisdiction.",
  },
  {
    id: 5,
    title: "Library of Forbidden Footnotes",
    subtitle: "Chapter V",
    synopsis:
      "The Public Library's restricted shelf holds the receipts Fedslop banned. Apu catalogs. Pepe smugs.",
    locationId: "ws:skills",
    bossId: "fact_checker_in_name_only",
    questsRequired: 275,
    rewardGold: 140,
    rewardTruth: 50,
    pepeLine: "Rated true by me.",
    apuLine: "Missing context: they hated the context.",
  },
  {
    id: 6,
    title: "Note Church Schism",
    subtitle: "Chapter VI",
    synopsis:
      "ITSHABBENING vs the Agenda Priests. Dated notes vs eternal Message. The bag rattles. Holy war (hilarious).",
    locationId: "ws:itshabbening",
    bossId: "agenda_priest",
    questsRequired: 350,
    rewardGold: 160,
    rewardTruth: 60,
    pepeLine: "The bag is based.",
    apuLine: "Amen. And timestamped.",
  },
  {
    id: 7,
    title: "Trail of Timeline Edits",
    subtitle: "Chapter VII",
    synopsis:
      "Up the mountain where the Timeline Editor rewrites yesterday. Pepe and Apu freeze the record.",
    locationId: "ws:path",
    bossId: "timeline_editor",
    questsRequired: 425,
    rewardGold: 180,
    rewardTruth: 70,
    pepeLine: "You can't edit the frog.",
    apuLine: "I printed backups. In triplicate.",
  },
  {
    id: 8,
    title: "Destroy the Fedslop Narrative",
    subtitle: "FINAL CHAPTER",
    synopsis:
      "ARCH-SLOP manifests over South Park — the full nutrient-paste storyline. Pepe and Apu, truth tellers, end the paste. Kenny still dies 65% of the time. Some laws are older than Fedslop.",
    locationId: "ws:progress",
    bossId: "arch_slop",
    questsRequired: 500,
    rewardGold: 500,
    rewardTruth: 200,
    pepeLine: "FEELS GOOD MAN.",
    apuLine: "Thank you, come again — to a town that can think.",
  },
];

export function chapterForProgress(completedCount: number): Chapter {
  let current = CHAPTERS[0]!;
  for (const ch of CHAPTERS) {
    if (completedCount >= ch.questsRequired) continue;
    return ch;
  }
  return CHAPTERS[CHAPTERS.length - 1]!;
}

export function chapterIndex(id: number): number {
  return CHAPTERS.findIndex((c) => c.id === id);
}

export function isChapterCleared(chapterId: number, completedCount: number): boolean {
  const ch = CHAPTERS.find((c) => c.id === chapterId);
  if (!ch) return false;
  return completedCount >= ch.questsRequired;
}
