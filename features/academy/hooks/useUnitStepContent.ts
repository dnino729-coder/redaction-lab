"use client";
// Academy Content v1 (Bloque 3A). El locale se obtiene con `useLocale()`
// (next-intl) y se envía explícito en el query string — decisión ya
// aprobada: las rutas `/api/*` no pasan por el middleware de next-intl
// (`middleware.ts` no se toca), así que este es el único mecanismo
// fiable, sin depender de cookie/Accept-Language (mismo tipo de
// desincronización ya diagnosticado en la investigación CORS/Safari de
// esta sesión). Mismo `staleTime`/`gcTime` que `useModelExamples` — único
// otro contenido editorial de Academia con caché HTTP real.
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { academyKeys } from "../constants";
import { getUnitStepContent } from "../services";
import type { UnitStep } from "../types";

export function useUnitStepContent(unitId: string, step: UnitStep) {
  const locale = useLocale();

  return useQuery({
    queryKey: academyKeys.unitStepContent(unitId, step, locale),
    queryFn: () => getUnitStepContent(unitId, step, locale),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    retry: 2,
  });
}
