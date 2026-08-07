"use client";
// Blueprint §8.2, fila EP-16. Transporte REST.
import { useQuery } from "@tanstack/react-query";
import { academyKeys } from "../constants";
import { getUnitAttempts } from "../services";

export function useUnitAttempts(unitId: string) {
  return useQuery({
    queryKey: academyKeys.unitAttempts(unitId),
    queryFn: () => getUnitAttempts(unitId),
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    retry: 2,
  });
}
