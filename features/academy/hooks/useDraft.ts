"use client";
// Blueprint §8.2, fila EP-17. Transporte REST. `staleTime: 0` — se consulta
// una sola vez al entrar a P-08; el 404 (sin borrador previo) no es un error
// de aplicación, lo interpreta el consumidor como "editor vacío" (Blueprint
// §12, P-08) — aquí se deja propagar como `ApiError` con `status === 404`.
import { useQuery } from "@tanstack/react-query";
import { academyKeys } from "../constants";
import { getDraft } from "../services";
import { ApiError } from "@/lib/apiClient";

export function useDraft(attemptId: string) {
  return useQuery({
    queryKey: academyKeys.draft(attemptId),
    queryFn: () => getDraft(attemptId),
    staleTime: 0,
    gcTime: 5 * 60_000,
    retry: (failureCount, error) => {
      // Un 404 (sin borrador) no debe reintentarse — no es transitorio.
      if (error instanceof ApiError && error.status === 404) return false;
      return failureCount < 1;
    },
  });
}
