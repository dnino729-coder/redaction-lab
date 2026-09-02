"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { laboratoryKeys } from "../constants";
import { startExerciseAttempt } from "../services/writingExercisesApi";

export function useStartExerciseAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exerciseId: string) => startExerciseAttempt(exerciseId),
    onSuccess: (_data, exerciseId) => {
      queryClient.invalidateQueries({ queryKey: [...laboratoryKeys.all, "exercises"] });
      queryClient.invalidateQueries({ queryKey: laboratoryKeys.exercise(exerciseId) });
      queryClient.invalidateQueries({ queryKey: laboratoryKeys.exerciseHistory(exerciseId) });
    },
  });
}
