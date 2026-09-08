// Jerarquía de Query Keys de Mi Plan — mismo patrón que
// features/laboratory/constants/query-keys.ts.
export const myPlanKeys = {
  all: ["my-plan"] as const,
  activeLearningPlan: () => [...myPlanKeys.all, "active-learning-plan"] as const,
};
