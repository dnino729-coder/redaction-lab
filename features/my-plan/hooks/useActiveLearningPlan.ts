"use client";
// Mismo patrón que features/laboratory/hooks/useWritingExercises.ts.
import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/apiClient";
import { myPlanKeys } from "../constants";
import { getActiveLearningPlan } from "../services/myPlanApi";

export function useActiveLearningPlan() {
  return useQuery({
    queryKey: myPlanKeys.activeLearningPlan(),
    queryFn: getActiveLearningPlan,
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    // Un 404 (sin plan activo) es un estado válido, no un fallo transitorio
    // — reintentarlo no cambia el resultado, solo retrasa mostrar el
    // EmptyState.
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < 2,
  });
}
