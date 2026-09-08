"use client";
// Mismo patrón que useLearningGoals.ts (vertical slice "connect goals and
// objectives").
import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/apiClient";
import { myPlanKeys } from "../constants";
import { getLearningPhases } from "../services/myPlanApi";

export function useLearningPhases() {
  return useQuery({
    queryKey: myPlanKeys.phases(),
    queryFn: getLearningPhases,
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    // Un 404 (sin plan activo) es un estado válido, no un fallo
    // transitorio — reintentarlo no cambia el resultado.
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < 2,
  });
}
