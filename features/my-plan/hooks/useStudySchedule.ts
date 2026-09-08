"use client";
// Mismo patrón que useActiveLearningPlan.ts (vertical slice 1).
import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/apiClient";
import { myPlanKeys } from "../constants";
import { getStudySchedule } from "../services/myPlanApi";

export function useStudySchedule() {
  return useQuery({
    queryKey: myPlanKeys.studySchedule(),
    queryFn: getStudySchedule,
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    // Un 404 (sin plan activo / sin StudySchedule) es un estado válido, no
    // un fallo transitorio — reintentarlo no cambia el resultado.
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < 2,
  });
}
