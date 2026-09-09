"use client";
// Mismo patrón que usePauseLearningPlan.ts — única query key invalidada:
// myPlanKeys.activeLearningPlan(). El cliente nunca envía `endDate`
// (CancelLearningPlanHandler usa siempre Clock.now(), sin modificar).
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { myPlanKeys } from "../constants";
import { cancelLearningPlan } from "../services/myPlanApi";

export function useCancelLearningPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cancelLearningPlan(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myPlanKeys.activeLearningPlan() });
    },
  });
}
