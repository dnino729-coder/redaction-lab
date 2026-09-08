"use client";
// Mismo patrón que useStudySchedule.ts (vertical slice 2).
import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/apiClient";
import { myPlanKeys } from "../constants";
import { getLearningProgress } from "../services/myPlanApi";

export function useLearningProgress() {
  return useQuery({
    queryKey: myPlanKeys.progress(),
    queryFn: getLearningProgress,
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    // Un 404 (sin plan activo / sin LearningProgress) es un estado válido,
    // no un fallo transitorio — reintentarlo no cambia el resultado.
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < 2,
  });
}
