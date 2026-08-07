"use client";
// Blueprint §8.2, fila EP-12. Transporte REST. No consumido por ninguna de
// las 15 pantallas de Academia (Blueprint §22) — se expone aquí por si
// `dashboard` lo requiere en el futuro (consumidor no determinado hoy,
// Blueprint §21, resolución AFR-F04).
import { useQuery } from "@tanstack/react-query";
import { academyKeys } from "../constants";
import { getMyProgressSummary } from "../services";

export function useProgressSummary() {
  return useQuery({
    queryKey: academyKeys.myProgress(),
    queryFn: () => getMyProgressSummary(),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 2,
  });
}
