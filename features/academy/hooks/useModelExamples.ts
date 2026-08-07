"use client";
// Blueprint §8.2, fila EP-19. Transporte REST. `staleTime: 60s` — único
// endpoint con `Cache-Control` real del backend.
import { useQuery } from "@tanstack/react-query";
import { academyKeys } from "../constants";
import { getModelExamples } from "../services";
import type { TextType } from "../types";

export function useModelExamples(textType?: TextType) {
  return useQuery({
    queryKey: academyKeys.modelExamples(textType),
    queryFn: () => getModelExamples(textType),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    retry: 2,
  });
}
