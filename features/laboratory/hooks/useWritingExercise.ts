"use client";
import { useQuery } from "@tanstack/react-query";
import { laboratoryKeys } from "../constants";
import { getWritingExercise } from "../services/writingExercisesApi";

export function useWritingExercise(exerciseId: string | null) {
  return useQuery({
    queryKey: laboratoryKeys.exercise(exerciseId ?? ""),
    queryFn: () => getWritingExercise(exerciseId as string),
    enabled: exerciseId !== null,
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    retry: 2,
  });
}
