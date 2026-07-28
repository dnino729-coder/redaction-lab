// Enum de dominio — las dos únicas acciones de anulación docente
// aprobadas (Domain Model v1.1, Sección 6, A-10, exacto).
export const OverrideAction = {
  FORCE_LOCK: "FORCE_LOCK",
  FORCE_RESTART: "FORCE_RESTART",
} as const;

export type OverrideAction = (typeof OverrideAction)[keyof typeof OverrideAction];
