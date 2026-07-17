"use client";
// useDashboardStore — wrapper del store de Zustand (docs/modules/dashboard.md,
// sección 9). Re-exporta el store global tipado para que los componentes de
// esta feature no importen `@/stores/dashboardStore` directamente (mantiene
// el punto de entrada dentro de features/dashboard/hooks, consistente con el
// resto de hooks del módulo).
export { useDashboardStore } from "@/stores/dashboardStore";
