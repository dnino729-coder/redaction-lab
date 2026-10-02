// Servicio: dashboard-cache — único punto de invalidación de la caché Redis
// del Dashboard accesible desde fuera de `features/dashboard` (sección 5.4:
// "Ninguna feature accede a otra feature directamente: pasar por
// services/"). La lectura cacheada (`getDashboardReadModel`) permanece en
// `features/dashboard/services/dashboardService.ts` — solo la invalidación
// necesita cruzar el límite de features (la invocan los Command Handlers de
// otros módulos tras una mutación que afecta datos leídos por el Dashboard).

import { redis } from "@/lib/redis";

/** Prefijo de clave de caché Redis del Dashboard — fuente única de verdad. */
export const DASHBOARD_CACHE_KEY_PREFIX = "dashboard:read-model:";

/** Invalida la caché del Dashboard de un estudiante tras una mutación que cambia su estado visible. */
export async function invalidateDashboardCache(studentId: string): Promise<void> {
  try {
    await redis.del(`${DASHBOARD_CACHE_KEY_PREFIX}${studentId}`);
    console.log("[dashboard] dashboard_cache_invalidated", { studentId });
  } catch {
    // No crítico: la próxima carga natural del TTL reflejará el cambio.
  }
}
