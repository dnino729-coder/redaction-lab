"use client";
// Blueprint §3.1/§8.2, fila EP-05. Transporte REST, Idempotency-Key
// obligatorio (Blueprint §2.6 punto 5 / API Contract v1.3). La respuesta ya
// es `AcademyUnitDetailHttp` completo (EP-05 compone el detalle vía QRY-02,
// confirmado en código de `attemptsHandlers.ts`), no solo `AttemptSummaryHttp`.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeReflection } from "../services";
import { academyKeys } from "../constants";
import { normalizeAcademyError } from "../utils/normalizeAcademyError";
import { useIdempotencyKey } from "./useIdempotencyKey";
import type { AcademyErrorHttp, AcademyUnitDetailHttp } from "../types";

interface CompleteReflectionInput {
  attemptId: string;
  responses: readonly string[];
}

export function useCompleteReflection() {
  const queryClient = useQueryClient();
  const idempotencyKey = useIdempotencyKey();

  return useMutation<AcademyUnitDetailHttp, AcademyErrorHttp, CompleteReflectionInput>({
    mutationFn: async ({ attemptId, responses }) => {
      try {
        return await completeReflection(attemptId, responses, idempotencyKey);
      } catch (error) {
        throw normalizeAcademyError(error);
      }
    },
    retry: 0,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: academyKeys.unit(data.unitId) });
      // Ver nota en useStartUnit.ts sobre invalidación por prefijo.
      queryClient.invalidateQueries({ queryKey: [...academyKeys.all, "units"] });
      queryClient.invalidateQueries({ queryKey: academyKeys.continuation() });
      queryClient.invalidateQueries({ queryKey: academyKeys.myProgress() });
    },
  });
}
