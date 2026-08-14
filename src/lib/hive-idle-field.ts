/**
 * Learner idle field — exactly the three first-slice trade combs.
 * Sitting / persisted lesson must not dump rooms, skills, or a desk.
 */
import {
  buildFirstSliceIdleCombs,
  buildReasoningLessonCombs,
  firstSliceTrackById,
  lessonNodeId,
} from "./reasoning-tracks";
import { skillIdsForLens } from "./suite-rooms";
import { buildConnectedHiveField, type HiveNode } from "./tutor-hive-map";

export function assembleHiveField(opts: {
  editMode: boolean;
  examplesOn: boolean;
  sittingLessonId: string | null;
  attachedLensId: string | null;
}): { workspaces: HiveNode[]; skills: HiveNode[]; industries: HiveNode[] } {
  const firstSlice = buildFirstSliceIdleCombs();
  const lessons = buildReasoningLessonCombs();
  const sitting = firstSliceTrackById(opts.sittingLessonId);

  // Learner idle: three first-slice combs only. No rooms, no skill carpet.
  // Sector-layer cards paint on the 2D map — they are not a fourth idle comb.
  if (!opts.editMode && !opts.examplesOn) {
    return { workspaces: firstSlice, skills: [], industries: [] };
  }

  if (opts.examplesOn) {
    const one = sitting
      ? lessons.filter((n) => n.id === lessonNodeId(sitting.id))
      : firstSlice;
    return {
      workspaces: one.length ? one : firstSlice,
      skills: [],
      industries: [],
    };
  }

  // Operator edit — existing connected sitting (not learner idle).
  const slice = buildConnectedHiveField({
    lessonId: opts.sittingLessonId,
    industryId: sitting?.industryId ?? null,
    lensSkillIds: skillIdsForLens(opts.attachedLensId),
  });
  if (sitting) {
    const extra = lessons.find((n) => n.id === lessonNodeId(sitting.id));
    return {
      workspaces: extra ? [extra, ...slice.workspaces] : slice.workspaces,
      skills: slice.skills,
      industries: slice.industries,
    };
  }
  return slice;
}
