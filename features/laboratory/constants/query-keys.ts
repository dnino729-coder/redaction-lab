// Jerarquía de Query Keys de Laboratorio — mismo patrón que
// features/academy/constants/query-keys.ts.
export const laboratoryKeys = {
  all: ["laboratory"] as const,
  modelExamples: () => [...laboratoryKeys.all, "model-examples"] as const,
  exercises: (mode?: string) => [...laboratoryKeys.all, "exercises", { mode }] as const,
  exercise: (exerciseId: string) => [...laboratoryKeys.all, "exercise", exerciseId] as const,
  exerciseHistory: (exerciseId: string) =>
    [...laboratoryKeys.all, "exercise", exerciseId, "history"] as const,
  attempt: (attemptId: string) => [...laboratoryKeys.all, "attempt", attemptId] as const,
};
