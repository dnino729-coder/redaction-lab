"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { laboratoryKeys } from "../constants";
import { autosaveExerciseDraft } from "../services/writingExercisesApi";

export interface AutosaveExerciseDraftInput {
  attemptId: string;
  exerciseId: string;
  content: string;
}

export function useAutosaveExerciseDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ attemptId, content }: AutosaveExerciseDraftInput) => autosaveExerciseDraft(attemptId, content),
    onSuccess: (_data, { exerciseId }) => {
      queryClient.invalidateQueries({ queryKey: laboratoryKeys.exerciseHistory(exerciseId) });
    },
  });
}
