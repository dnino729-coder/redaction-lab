// Enum de dominio — elaboración del criterio de dominio ya aprobado en
// A-07 (Domain Model v1.1, Sección 6). El tercer valor se renombra de
// `MASTERED` (v1.0) a `SUSTAINED` (corrección v1.1, H-05) para eliminar
// la colisión literal con `UnitState.MASTERED` — el criterio que
// representa (evidencia de competencia sostenida) no cambia.
export const MasteryLevel = {
  DEVELOPING: "DEVELOPING",
  CONSOLIDATING: "CONSOLIDATING",
  SUSTAINED: "SUSTAINED",
} as const;

export type MasteryLevel = (typeof MasteryLevel)[keyof typeof MasteryLevel];
