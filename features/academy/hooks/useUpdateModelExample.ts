"use client";
// Blueprint §8.2, fila EP-10. Transporte REST.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateModelExample } from "../services";
import { academyKeys } from "../constants";
import { normalizeAcademyError } from "../utils/normalizeAcademyError";
import type { AcademyErrorHttp, ModelExampleHttp } from "../types";

interface UpdateModelExampleInput {
  modelExampleId: string;
  content?: string;
  curatorialComment?: string;
}

export function useUpdateModelExample() {
  const queryClient = useQueryClient();

  return useMutation<ModelExampleHttp, AcademyErrorHttp, UpdateModelExampleInput>({
    mutationFn: async ({ modelExampleId, ...patch }) => {
      try {
        return await updateModelExample(modelExampleId, patch);
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
