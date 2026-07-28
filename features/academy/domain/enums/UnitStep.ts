// Enum de dominio — las 11 etapas fijas y ordenadas de una Unidad (A-02),
// Domain Model v1.1 Sección 6, exacta, orden fijo. Gobernado por
// `Attempt` (RN-1); nunca omite pasos ni altera el orden.
export const UnitStep = {
  CONTEXTUALIZE: "CONTEXTUALIZE",
  DEFINE_OBJECTIVES: "DEFINE_OBJECTIVES",
  COMPREHEND: "COMPREHEND",
  OBSERVE: "OBSERVE",
  ANALYZE: "ANALYZE",
  PRACTICE: "PRACTICE",
  PRODUCE: "PRODUCE",
  RECEIVE_FEEDBACK: "RECEIVE_FEEDBACK",
  REWRITE: "REWRITE",
  REFLECT: "REFLECT",
  UNLOCK: "UNLOCK",
} as const;

export type UnitStep = (typeof UnitStep)[keyof typeof UnitStep];

/** Orden oficial de A-02 — usado por `Attempt` para validar que un avance
 * de paso nunca retroceda ni omita etapas (RN-1), salvo el ciclo explícito
 * `REWRITE ⇄ RECEIVE_FEEDBACK` (Domain Model v1.1, Sección 4, invariante
 * de `Attempt`). */
export const UNIT_STEP_ORDER: readonly UnitStep[] = [
  UnitStep.CONTEXTUALIZE,
  UnitStep.DEFINE_OBJECTIVES,
  UnitStep.COMPREHEND,
  UnitStep.OBSERVE,
  UnitStep.ANALYZE,
  UnitStep.PRACTICE,
  UnitStep.PRODUCE,
  UnitStep.RECEIVE_FEEDBACK,
  UnitStep.REWRITE,
  UnitStep.REFLECT,
  UnitStep.UNLOCK,
];

/** Pasos de contenido previos a la Producción, sin puerta de validación
 * propia, avanzados linealmente por CMD-16 AdvanceStep (Application Layer
 * Spec v1.0). `COMPREHEND` se excluye porque tiene su propia puerta
 * (RN-2, CMD-17 VerifyComprehension), no un avance libre. */
export const FREE_ADVANCE_STEPS: readonly UnitStep[] = [
  UnitStep.CONTEXTUALIZE,
  UnitStep.DEFINE_OBJECTIVES,
  UnitStep.OBSERVE,
  UnitStep.ANALYZE,
  UnitStep.PRACTICE,
];
