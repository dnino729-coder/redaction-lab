// ENUM de dominio — Vacío 2 / docs/modules/mi-plan.md, sección 2.9: el
// motivo que dispara una solicitud de reprogramación (evento
// `PLAN_REORGANIZATION_REQUESTED`) es siempre uno de los dos datos
// disparadores explícitamente descritos ("el estudiante modifica un dato
// disparador (fecha del examen o disponibilidad)"). No se añade ningún
// tercer motivo no mencionado en la documentación.
export const ReprogrammingReason = {
  EXAM_DATE_CHANGED: "EXAM_DATE_CHANGED",
  AVAILABILITY_CHANGED: "AVAILABILITY_CHANGED",
} as const;

export type ReprogrammingReason =
  (typeof ReprogrammingReason)[keyof typeof ReprogrammingReason];
