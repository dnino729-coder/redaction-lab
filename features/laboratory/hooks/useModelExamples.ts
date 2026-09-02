"use client";
// Mismo patrón que features/academy/hooks/useModelExamples.ts —
// `staleTime: 60s` porque el endpoint ya responde con
// `Cache-Control: public, max-age=60`.
import { useQuery } from "@tanstack/react-query";
import { laboratoryKeys } from "../constants";
import { getModelExamples } from "../services";

export function useModelExamples() {
  return useQuery({
    queryKey: laboratoryKeys.modelExamples(),
    queryFn: getModelExamples,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    retry: 2,
  });
}
