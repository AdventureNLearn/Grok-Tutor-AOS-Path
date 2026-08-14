/**
 * Path Play contract — stay on /path and walk THIS sitting's seven habits.
 * Never navigate to hive home, never invent a lesson, never open a desk.
 * THIS SITTING may be a first-slice comb or a covered pack reached by ask.
 */
import { resolveSitting } from "./sit-from-named-pack";
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
  // Civic / nursing / CM / LE / media-literacy cannot become THIS SITTING.
  const sitting = resolveSitting(activeLessonId);
  return {
    lessonId: sitting?.sitId ?? null,
    pairing: sitting?.pairing ?? null,
    route: PATH_PLAY_ROUTE,
    habits: FROZEN_HABITS,
    canPlay: Boolean(sitting),
  };
}
