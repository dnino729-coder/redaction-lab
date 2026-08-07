"use client";
// Blueprint §3.1/§8.2, fila EP-21. Transporte Server Action (`advanceStepAction`).
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { advanceStepAction } from "@/features/academy/actions";
import { academyKeys } from "../constants";
import { normalizeAcademyError } from "../utils/normalizeAcademyError";
import type { AcademyErrorHttp, AttemptSummaryHttp } from "../types";

export function useAdvanceStep() {
  const queryClient = useQueryClient();

  return useMutation<AttemptSummaryHttp, AcademyErrorHttp, string>({
    mutationFn: async (attemptId: string) => {
      try {
        // Ver nota en useStartUnit.ts sobre el estrechamiento de
        // `currentStep: string` (backend) a `UnitStep` (frontend).
        return (await advanceStepAction(attemptId)) as unknown as AttemptSummaryHttp;
      } catch (error) {
        throw normalizeAcademyError(error);
      }
    },
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academyKeys.continuation() });
    },
  });
}
