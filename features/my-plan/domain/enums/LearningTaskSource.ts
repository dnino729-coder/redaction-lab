// ENUM de dominio — resolución 18.20.5 (Vacío 5), consolidado en 13.4.
// Determina si una `LearningTask` se completa manualmente (SELF_DIRECTED)
// o exclusivamente vía el evento EXTERNAL_ACTIVITY_COMPLETED (cualquier
// otro valor) — ver entities/LearningTask.ts.
export const LearningTaskSource = {
  SELF_DIRECTED: "SELF_DIRECTED",
  ACADEMY: "ACADEMY",
  LABORATORY: "LABORATORY",
  DAILY_TRAINING: "DAILY_TRAINING",
  SIMULATOR: "SIMULATOR",
} as const;

export type LearningTaskSource =
  (typeof LearningTaskSource)[keyof typeof LearningTaskSource];

/** Los 4 ecosistemas externos capaces de emitir EXTERNAL_ACTIVITY_COMPLETED
 * (todo `LearningTaskSource` salvo `SELF_DIRECTED`, que se completa dentro
 * de Mi Plan). Usado por events/ExternalActivityCompletedEvent.ts. */
export type ExternalActivitySource = Exclude<LearningTaskSource, "SELF_DIRECTED">;
