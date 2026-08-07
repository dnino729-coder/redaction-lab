"use client";
// Blueprint §8.2, fila EP-09. Transporte REST, Idempotency-Key obligatorio.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createModelExample } from "../services";
import { academyKeys } from "../constants";
import { normalizeAcademyError } from "../utils/normalizeAcademyError";
import { useIdempotencyKey } from "./useIdempotencyKey";
import type { AcademyErrorHttp, ModelExampleHttp, TextType } from "../types";

interface CreateModelExampleInput {
  textType: TextType;
  content: string;
  rating: "EXCELLENT" | "HAS_ERRORS";
  curatorialComment: string;
}

export function useCreateModelExample() {
  const queryClient = useQueryClient();
  const idempotencyKey = useIdempotencyKey();

  return useMutation<ModelExampleHttp, AcademyErrorHttp, CreateModelExampleInput>({
    mutationFn: async (input) => {
      try {
        return await createModelExample(input, idempotencyKey);
      } catch (error) {
        throw normalizeAcademyError(error);
      }
    },
    retry: 0,
    onSuccess: () => {
      // Invalida TODAS las variantes de textType (matching por prefijo) —
      // ver nota en useStartUnit.ts.
      queryClient.invalidateQueries({ queryKey: [...academyKeys.all, "model-examples"] });
    },
  });
}
