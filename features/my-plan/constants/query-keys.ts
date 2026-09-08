// Jerarquía de Query Keys de Mi Plan — mismo patrón que
// features/laboratory/constants/query-keys.ts.
export const myPlanKeys = {
  all: ["my-plan"] as const,
  activeLearningPlan: () => [...myPlanKeys.all, "active-learning-plan"] as const,
  studySchedule: () => [...myPlanKeys.all, "study-schedule"] as const,
  progress: () => [...myPlanKeys.all, "progress"] as const,
};
