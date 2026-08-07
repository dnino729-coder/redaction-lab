"use client";
// Blueprint §8.2, fila EP-13. Transporte REST.
import { useQuery } from "@tanstack/react-query";
import { academyKeys } from "../constants";
import { getUnits } from "../services";
import type { TextType } from "../types";

export function useUnits(textType?: TextType) {
  return useQuery({
    queryKey: academyKeys.units(textType),
    queryFn: () => getUnits(textType),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 2,
  });
}
