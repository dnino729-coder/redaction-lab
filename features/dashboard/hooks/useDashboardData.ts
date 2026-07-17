"use client";
// useDashboardData — TanStack Query, obtiene el consolidado del Dashboard
// Service (docs/modules/dashboard.md, sección 9). La carga inicial la hace
// el Server Component de la ruta (sección 11: "sin round-trip
// cliente-servidor adicional") y se pasa aquí como `initialData` — este hook
// solo entra en juego para revalidaciones posteriores en el cliente (ej.
// tras descartar una recomendación, sección 8: "cache invalidado/revalidado").
import { useQuery } from "@tanstack/react-query";
import type { DashboardReadModel } from "../types";

async function fetchDashboardReadModel(): Promise<DashboardReadModel> {
  const response = await fetch("/api/dashboard/refresh", { method: "GET" });
  if (!response.ok) {
    throw new Error(`No se pudo actualizar el Dashboard (${response.status})`);
  }
  return response.json() as Promise<DashboardReadModel>;
}

export function useDashboardData(initialData: DashboardReadModel) {
  return useQuery({
    queryKey: ["dashboard", initialData.studentId],
    queryFn: fetchDashboardReadModel,
    initialData,
  });
}
