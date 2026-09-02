"use client";
import { useQuery } from "@tanstack/react-query";
import { laboratoryKeys } from "../constants";
import { getWritingExercises, type ExerciseMode } from "../services/writingExercisesApi";

export function useWritingExercises(mode?: ExerciseMode) {
  return useQuery({
    queryKey: laboratoryKeys.exercises(mode),
    queryFn: () => getWritingExercises(mode),
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    retry: 2,
  });
}
