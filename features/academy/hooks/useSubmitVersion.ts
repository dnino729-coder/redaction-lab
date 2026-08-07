"use client";
// Blueprint §3.1/§8.2, fila EP-03. Transporte Server Action
// (`submitVersionAction`, que bifurca internamente producción/reescritura
// según el número de versiones ya existentes — el frontend siempre invoca la
// misma función, sin decidir la bifurcación él mismo).
//
// Nota de implementación (no fijada literalmente por el Blueprint): la
// invalidación de `academyKeys.unit(unitId)` (Blueprint §8.2) requiere el
// `unitId`, que `VersionHttp` no incluye — se recibe como parte del input,
// ya que `AttemptStepContainer` lo conoce (por la ruta o por
// `useContinuation()`), en vez de inventar un campo nuevo en la respuesta.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitVersionAction } from "@/features/academy/actions";
import { academyKeys } from "../constants";
import { normalizeAcademyError } from "../utils/normalizeAcademyError";
import type { AcademyErrorHttp, VersionHttp } from "../types";

interface SubmitVersionInput {
  attemptId: string;
  unitId: string;
  content: string;
}

export function useSubmitVersion() {
  const queryClient = useQueryClient();

  return useMutation<VersionHttp, AcademyErrorHttp, SubmitVersionInput>({
    mutationFn: async ({ attemptId, content }) => {
      try {
        return await submitVersionAction(attemptId, content);
      } catch (error) {
        throw normalizeAcademyError(error);
      }
    },
    retry: 0,
    onSuccess: (data, { attemptId, unitId }) => {
      queryClient.invalidateQueries({ queryKey: academyKeys.unit(unitId) });
      queryClient.invalidateQueries({ queryKey: academyKeys.continuation() });
      if (data.feedbackStatus === "READY") {
        queryClient.invalidateQueries({
          queryKey: academyKeys.feedback(attemptId, data.versionNumber),
        });
      }
    },
  });
}
