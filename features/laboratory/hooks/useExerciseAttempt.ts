"use client";
import { useQuery } from "@tanstack/react-query";
import { laboratoryKeys } from "../constants";
import { getExerciseAttempt } from "../services/writingExercisesApi";

// Recupera el contenido guardado (draft/autosave) de un attempt existente
// por su id — usado para "Continuar" un intento IN_PROGRESS localizado
// previamente en el historial (useExerciseAttemptHistory), que no incluye
// `content`.
export function useExerciseAttempt(attemptId: string | null) {
  return useQuery({
    queryKey: laboratoryKeys.attempt(attemptId ?? ""),
    queryFn: () => getExerciseAttempt(attemptId as string),
    enabled: attemptId !== null,
    staleTime: 15_000,
    gcTime: 10 * 60_000,
    retry: 2,
  });
}
