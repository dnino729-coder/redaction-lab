"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { laboratoryKeys } from "../constants";
import { createWritingExercise } from "../services/writingExercisesApi";

export function useCreateWritingExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWritingExercise,
    onSuccess: () => {
      // Prefijo sin filtro de mode — invalida todas las variantes cacheadas
      // (con y sin filtro), no solo la que coincida exactamente con
      // { mode: undefined }.
      queryClient.invalidateQueries({ queryKey: [...laboratoryKeys.all, "exercises"] });
    },
  });
}
