"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { laboratoryKeys } from "../constants";
import { completeExerciseAttempt } from "../services/writingExercisesApi";

export interface CompleteExerciseAttemptInput {
  attemptId: string;
  exerciseId: string;
}

export function useCompleteExerciseAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ attemptId }: CompleteExerciseAttemptInput) => completeExerciseAttempt(attemptId),
    onSuccess: (_data, { exerciseId }) => {
      queryClient.invalidateQueries({ queryKey: [...laboratoryKeys.all, "exercises"] });
      queryClient.invalidateQueries({ queryKey: laboratoryKeys.exercise(exerciseId) });
      queryClient.invalidateQueries({ queryKey: laboratoryKeys.exerciseHistory(exerciseId) });
    },
  });
}
