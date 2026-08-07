"use client";
// Blueprint §8.2, fila EP-11. Transporte REST. Retiro lógico (status→RETIRED),
// nunca borrado físico (confirmado en código de `modelExamplesHandlers.ts`).
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { retireModelExample } from "../services";
import { academyKeys } from "../constants";
import { normalizeAcademyError } from "../utils/normalizeAcademyError";
import type { AcademyErrorHttp, ModelExampleHttp } from "../types";

export function useRetireModelExample() {
  const queryClient = useQueryClient();

  return useMutation<ModelExampleHttp, AcademyErrorHttp, string>({
    mutationFn: async (modelExampleId: string) => {
      try {
        return await retireModelExample(modelExampleId);
      } catch (error) {
        throw normalizeAcademyError(error);
      }
    },
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...academyKeys.all, "model-examples"] });
    },
  });
}
