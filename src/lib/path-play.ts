/**
 * Path Play contract — stay on /path and walk THIS sitting's seven habits.
 * Never navigate to hive home, never invent a lesson, never open a desk.
 */
import { firstSliceTrackById, learnerCombPairing } from "./reasoning-tracks";
import { FROZEN_HABITS, type FrozenHabit } from "./suite-rooms";

export const PATH_PLAY_ROUTE = "/path" as const;

export const PATH_HABIT_BEAT_MS = 3600;

export type PathPlayPlan = {
  lessonId: string | null;
  pairing: string | null;
  route: typeof PATH_PLAY_ROUTE;
  habits: readonly FrozenHabit[];
  canPlay: boolean;
};

export function planPathPlay(activeLessonId: string | null | undefined): PathPlayPlan {
  // THIS SITTING is the first-slice comb they sat — never civic / nursing / CM.
  const sitting = firstSliceTrackById(activeLessonId);
  return {
    lessonId: sitting?.id ?? null,
    pairing: sitting ? learnerCombPairing(sitting) : null,
    route: PATH_PLAY_ROUTE,
    habits: FROZEN_HABITS,
    canPlay: Boolean(sitting),
  };
}
