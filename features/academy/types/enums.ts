// Enums de Academia — espejo 1:1 del frontend (Blueprint §6). Nunca redefinir
// los enums de dominio/aplicación del backend (features/academy/domain,
// features/academy/application) — estos tipos son la copia de solo-lectura
// que el frontend consume desde las respuestas HTTP/Server Actions.

/** Blueprint §6.1 — única fuente de verdad de progreso (Invariante 6 del
 * Domain Model). Nunca inferir progreso a partir de `UnitStep`. */
export type UnitState =
  | "LOCKED"
  | "UNLOCKED"
  | "IN_PROGRESS"
  | "AWAITING_FEEDBACK"
  | "REVISION"
  | "REFLECTION"
  | "COMPLETED"
  | "MASTERED";

/** Blueprint §6.2 — 11 pasos. El orden (`UNIT_STEP_ORDER`) y los slugs de URL
 * viven en `constants/steps.ts`, no aquí (separación tipo vs. constante). */
export type UnitStep =
  | "CONTEXTUALIZE"
  | "DEFINE_OBJECTIVES"
  | "COMPREHEND"
  | "OBSERVE"
  | "ANALYZE"
  | "PRACTICE"
  | "PRODUCE"
  | "RECEIVE_FEEDBACK"
  | "REWRITE"
  | "REFLECT"
  | "UNLOCK";

/** Blueprint §6.3 */
export type TextType = "LETTER" | "ARTICLE" | "ESSAY" | "EMAIL" | "REPORT";

/** Blueprint §6.4 */
export type FeedbackStrength = "STRENGTH" | "WEAKNESS";
export type OverrideAction = "FORCE_LOCK" | "FORCE_RESTART";
export type ModelExampleRating = "EXCELLENT" | "HAS_ERRORS";
export type ModelExampleStatus = "ACTIVE" | "RETIRED";

/** Blueprint §6.5 — 10 categorías, macro→micro. */
export type FeedbackCategory =
  | "COMPREHENSION"
  | "COMMUNICATIVE_INTENT"
  | "STRUCTURE"
  | "COHERENCE"
  | "COHESION"
  | "ARGUMENTATION"
  | "REGISTER"
  | "VOCABULARY"
  | "GRAMMAR"
  | "SPELLING";

/** Blueprint §6.5 — usado por `FeedbackObservationItem` para ordenar
 * observaciones client-side (el backend no envía `priority`, gap disclosed
 * en Blueprint §5.5). Co-ubicado aquí junto al enum que describe, no en
 * constants/ (única decisión de ubicación no fijada literalmente por el
 * Blueprint — ver informe AFR-006). */
export const FEEDBACK_CATEGORY_PRIORITY: Record<FeedbackCategory, number> = {
  COMPREHENSION: 1,
  COMMUNICATIVE_INTENT: 2,
  STRUCTURE: 3,
  COHERENCE: 4,
  COHESION: 5,
  ARGUMENTATION: 6,
  REGISTER: 7,
  VOCABULARY: 8,
  GRAMMAR: 9,
  SPELLING: 10,
};
