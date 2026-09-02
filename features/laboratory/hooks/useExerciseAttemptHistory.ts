"use client";
import { useQuery } from "@tanstack/react-query";
import { laboratoryKeys } from "../constants";
import { getExerciseHistory } from "../services/writingExercisesApi";

export function useExerciseAttemptHistory(exerciseId: string | null) {
  return useQuery({
    queryKey: laboratoryKeys.exerciseHistory(exerciseId ?? ""),
    queryFn: () => getExerciseHistory(exerciseId as string),
    enabled: exerciseId !== null,
    staleTime: 15_000,
    gcTime: 10 * 60_000,
    retry: 2,
  });
}
