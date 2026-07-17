// Constantes del módulo Dashboard (UPPER_SNAKE_CASE — sección 13.13).

/**
 * Umbral de inactividad para el estado `reactivation` del mensaje de
 * bienvenida (sección 3: "si han pasado varios días sin actividad"). El
 * documento fuente no fija un número exacto de días — se elige 5 como
 * interpretación razonable de "varios días" (más que un fin de semana,
 * menos de una semana laboral completa), documentado explícitamente para no
 * ocultar una decisión no especificada en el documento.
 */
export const REACTIVATION_THRESHOLD_DAYS = 5;

/** Presupuesto de rendimiento (sección 1: "responder en menos de 5 segundos"). */
export const DASHBOARD_RESPONSE_BUDGET_MS = 5000;

/** TTL de caché Redis del consolidado del Dashboard (sección 15.1). */
export const DASHBOARD_CACHE_TTL_SECONDS = 60;

/** Prefijo de clave de caché Redis — evita colisiones con otros módulos. */
export const DASHBOARD_CACHE_KEY_PREFIX = "dashboard:read-model:";

/**
 * Los 8 espacios restantes accesibles desde el Dashboard (bloque 7, sección
 * 15: "Desde el Dashboard se accede a los 8 espacios restantes"). Se deriva
 * de `NAVIGATION_ITEMS` (config/navigation.ts) excluyendo la clave
 * "dashboard" — nunca se duplica la lista de espacios como una segunda
 * fuente de verdad.
 */
export const DASHBOARD_NAV_KEY = "dashboard";
