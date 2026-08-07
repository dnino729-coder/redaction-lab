"use client";
// Blueprint §3.1/§8.2, fila EP-22. Transporte Server Action
// (`verifyComprehensionAction`). Caso especial (Blueprint §3.1/§9): esta
// Server Action NUNCA lanza por "insuficiente" — siempre resuelve con éxito
// y comunica el resultado semántico vía `result.satisfied`. Solo se
// normaliza una excepción real (fallo genuino de la Server Action).
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyComprehensionAction } from "@/features/academy/actions";
import { academyKeys } from "../constants";
import { normalizeAcademyError } from "../utils/normalizeAcademyError";
import type { AcademyErrorHttp, VerifyComprehensionActionResult } from "../types";

interface VerifyComprehensionInput {
  attemptId: string;
  comprehensionResponse: string;
}

export function useVerifyComprehension() {
  const queryClient = useQueryClient();

  return useMutation<VerifyComprehensionActionResult, AcademyErrorHttp, VerifyComprehensionInput>({
    mutationFn: async ({ attemptId, comprehensionResponse }) => {
      try {
        // Ver nota en useStartUnit.ts sobre el estrechamiento de
        // `currentStep: string` (backend) a `UnitStep` (frontend) —
        // aplica aquí a `result.attempt.currentStep`.
        return (await verifyComprehensionAction(
          attemptId,
          comprehensionResponse,
        )) as unknown as VerifyComprehensionActionResult;
      } catch (error) {
        throw normalizeAcademyError(error);
      }
    },
    retry: 0,
    onSuccess: (data) => {
      // Solo se invalida si la verificación fue satisfactoria — el paso
      // real no cambió en el caso `satisfied === false` (Blueprint §8.2).
      if (data.satisfied) {
        queryClient.invalidateQueries({ queryKey: academyKeys.continuation() });
      }
    },
  });
}
