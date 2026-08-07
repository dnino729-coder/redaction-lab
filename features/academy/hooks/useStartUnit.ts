"use client";
// Blueprint §3.1/§8.2, fila EP-01. Transporte Server Action (`startUnitAction`,
// ya existente en features/academy/actions/unitActions.ts — no modificar).
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startUnitAction } from "@/features/academy/actions";
import { academyKeys } from "../constants";
import { normalizeAcademyError } from "../utils/normalizeAcademyError";
import type { AcademyErrorHttp, AttemptSummaryHttp } from "../types";

export function useStartUnit() {
  const queryClient = useQueryClient();

  return useMutation<AttemptSummaryHttp, AcademyErrorHttp, string>({
    mutationFn: async (unitId: string) => {
      try {
        // `startUnitAction` declara `currentStep: string` (su propio DTO de
        // Response Mapper, sin importar el enum `UnitStep` del frontend) —
        // el backend solo produce valores válidos de `UnitStep` en este
        // campo; se estrecha aquí, en el límite Server Action → hook.
        return (await startUnitAction(unitId)) as unknown as AttemptSummaryHttp;
      } catch (error) {
        throw normalizeAcademyError(error);
      }
    },
    retry: 0,
    onSuccess: (_data, unitId) => {
      queryClient.invalidateQueries({ queryKey: academyKeys.unit(unitId) });
      // Invalida TODAS las variantes de textType de la lista (matching por
      // prefijo) — academyKeys.units() con un solo `textType` no alcanza a
      // las demás variantes cacheadas (React Query hace matching parcial de
      // objeto, no ignora el filtro cuando se omite el argumento).
      queryClient.invalidateQueries({ queryKey: [...academyKeys.all, "units"] });
      queryClient.invalidateQueries({ queryKey: academyKeys.continuation() });
    },
  });
}
