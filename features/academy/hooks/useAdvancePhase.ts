"use client";
// Blueprint §3.1/§8.2, fila EP-04. Transporte REST — único hook del flujo de
// aprendizaje sin Server Action equivalente (confirmado en código: no existe
// `advancePhaseAction`). Usado en P-09 (Blueprint §12/§21, resolución
// AFR-F02) para la transición REWRITE→REFLECT.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { advancePhase } from "../services";
import { academyKeys } from "../constants";
import { normalizeAcademyError } from "../utils/normalizeAcademyError";
import type { AcademyErrorHttp, AttemptSummaryHttp } from "../types";

export function useAdvancePhase() {
  const queryClient = useQueryClient();

  return useMutation<AttemptSummaryHttp, AcademyErrorHttp, { attemptId: string; unitId: string }>({
    mutationFn: async ({ attemptId }) => {
      try {
        return await advancePhase(attemptId);
      } catch (error) {
        throw normalizeAcademyError(error);
      }
    },
    retry: 0,
    onSuccess: (_data, { unitId }) => {
      queryClient.invalidateQueries({ queryKey: academyKeys.continuation() });
      queryClient.invalidateQueries({ queryKey: academyKeys.unit(unitId) });
    },
  });
}
