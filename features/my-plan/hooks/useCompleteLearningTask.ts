"use client";
// Mismo patrón que useCreateStudySession.ts/useFinishStudySession.ts —
// única diferencia: completar una tarea cambia tanto `phases` (status de
// la tarea/fase) como `progress` (LearningProgress recalculado por
// CompleteLearningTaskHandler, sin modificar) — se invalidan ambas query
// keys, no solo `phases()`.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { myPlanKeys } from "../constants";
import { completeLearningTask } from "../services/myPlanApi";

export function useCompleteLearningTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => completeLearningTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myPlanKeys.phases() });
      queryClient.invalidateQueries({ queryKey: myPlanKeys.progress() });
    },
  });
}
