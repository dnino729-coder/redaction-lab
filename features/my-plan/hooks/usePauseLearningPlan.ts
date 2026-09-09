"use client";
// Mismo patrón que useCompleteLearningTask.ts — única query key invalidada:
// myPlanKeys.activeLearningPlan(). Pausar solo cambia
// LearningPlan.status/endDate (ver PauseLearningPlanHandler, sin
// modificar) — no afecta fases/tareas/progreso/sesiones/horario/metas, así
// que no se invalida ninguna otra key.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { myPlanKeys } from "../constants";
import { pauseLearningPlan } from "../services/myPlanApi";

export function usePauseLearningPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => pauseLearningPlan(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myPlanKeys.activeLearningPlan() });
    },
  });
}
