"use client";
// Blueprint §3.1/§8.2, fila EP-06. Transporte Server Action (`repeatUnitAction`).
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { repeatUnitAction } from "@/features/academy/actions";
import { academyKeys } from "../constants";
import { normalizeAcademyError } from "../utils/normalizeAcademyError";
import type { AcademyErrorHttp, AttemptSummaryHttp } from "../types";

export function useRepeatUnit() {
  const queryClient = useQueryClient();

  return useMutation<AttemptSummaryHttp, AcademyErrorHttp, string>({
    mutationFn: async (unitId: string) => {
      try {
        // Ver nota en useStartUnit.ts sobre el estrechamiento de
        // `currentStep: string` (backend) a `UnitStep` (frontend).
        return (await repeatUnitAction(unitId)) as unknown as AttemptSummaryHttp;
      } catch (error) {
        throw normalizeAcademyError(error);
      }
    },
    retry: 0,
    onSuccess: (_data, unitId) => {
      queryClient.invalidateQueries({ queryKey: academyKeys.unit(unitId) });
      // Ver nota en useStartUnit.ts sobre invalidación por prefijo.
      queryClient.invalidateQueries({ queryKey: [...academyKeys.all, "units"] });
      queryClient.invalidateQueries({ queryKey: academyKeys.unitAttempts(unitId) });
      queryClient.invalidateQueries({ queryKey: academyKeys.continuation() });
    },
  });
}
