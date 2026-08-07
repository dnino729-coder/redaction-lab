"use client";
// Blueprint §8.2, fila EP-14. Transporte REST.
import { useQuery } from "@tanstack/react-query";
import { academyKeys } from "../constants";
import { getUnitDetail } from "../services";

export function useUnitDetail(unitId: string) {
  return useQuery({
    queryKey: academyKeys.unit(unitId),
    queryFn: () => getUnitDetail(unitId),
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    retry: 2,
  });
}
