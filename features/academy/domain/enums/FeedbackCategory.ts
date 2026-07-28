// Enum de dominio — las 10 dimensiones formativas de Retroalimentación
// (Domain Model v1.1, Sección 6/§9.5, A-05). Cada categoría lleva un
// atributo explícito de prioridad (1..10, macro→micro, RN-3/FeedbackPolicy)
// independiente del orden de declaración del enum (corrección v1.1, H-07).
export const FeedbackCategory = {
  COMPREHENSION: "COMPREHENSION",
  COMMUNICATIVE_INTENT: "COMMUNICATIVE_INTENT",
  STRUCTURE: "STRUCTURE",
  COHERENCE: "COHERENCE",
  COHESION: "COHESION",
  ARGUMENTATION: "ARGUMENTATION",
  REGISTER: "REGISTER",
  VOCABULARY: "VOCABULARY",
  GRAMMAR: "GRAMMAR",
  SPELLING: "SPELLING",
} as const;

export type FeedbackCategory = (typeof FeedbackCategory)[keyof typeof FeedbackCategory];

/** Prioridad jerárquica macro→micro (Domain Model v1.1, H-07) — usada por
 * `FeedbackPolicy` para ordenar/validar observaciones, independiente del
 * orden de declaración del enum. */
export const FEEDBACK_CATEGORY_PRIORITY: Readonly<Record<FeedbackCategory, number>> = {
  [FeedbackCategory.COMPREHENSION]: 1,
  [FeedbackCategory.COMMUNICATIVE_INTENT]: 2,
  [FeedbackCategory.STRUCTURE]: 3,
  [FeedbackCategory.COHERENCE]: 4,
  [FeedbackCategory.COHESION]: 5,
  [FeedbackCategory.ARGUMENTATION]: 6,
  [FeedbackCategory.REGISTER]: 7,
  [FeedbackCategory.VOCABULARY]: 8,
  [FeedbackCategory.GRAMMAR]: 9,
  [FeedbackCategory.SPELLING]: 10,
};
