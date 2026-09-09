"use client";
// Mismo patrón que usePauseLearningPlan.ts — única query key invalidada:
// myPlanKeys.activeLearningPlan().
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { myPlanKeys } from "../constants";
import { resumeLearningPlan } from "../services/myPlanApi";

export function useResumeLearningPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resumeLearningPlan(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myPlanKeys.activeLearningPlan() });
    },
  });
}
