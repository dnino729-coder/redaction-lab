"use client";
// Blueprint §8.2, fila EP-15. Transporte REST. `staleTime: 0` — siempre
// fresco, es el estado de "dónde retomo", crítico.
import { useQuery } from "@tanstack/react-query";
import { academyKeys } from "../constants";
import { getContinuation } from "../services";

export function useContinuation() {
  return useQuery({
    queryKey: academyKeys.continuation(),
    queryFn: () => getContinuation(),
    staleTime: 0,
    gcTime: 5 * 60_000,
    retry: 2,
  });
}
