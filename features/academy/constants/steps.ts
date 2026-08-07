// Blueprint §6.2. Orden fijo de los 11 pasos, pasos avanzables sin gate, y
// mapeo slug de URL ↔ enum de dominio. No modificar — espejo exacto del
// backend (UnitStep, Attempt.advanceToReflection()/RevisionPolicy).
import type { UnitStep } from "../types/enums";

export const UNIT_STEP_ORDER: readonly UnitStep[] = [
  "CONTEXTUALIZE",
  "DEFINE_OBJECTIVES",
  "COMPREHEND",
  "OBSERVE",
  "ANALYZE",
  "PRACTICE",
  "PRODUCE",
  "RECEIVE_FEEDBACK",
  "REWRITE",
  "REFLECT",
  "UNLOCK",
] as const;

/** Avanzables vía `advanceStepAction`/EP-21 sin gate; COMPREHEND tiene su
 * propio gate (EP-22/`verifyComprehensionAction`). */
export const FREE_ADVANCE_STEPS: readonly UnitStep[] = [
  "CONTEXTUALIZE",
  "DEFINE_OBJECTIVES",
  "OBSERVE",
  "ANALYZE",
  "PRACTICE",
] as const;

/** `UNLOCK` no tiene slug propio — se resuelve dentro de la pantalla de
 * `REFLECT` (P-10, resumen de cierre). */
export const STEP_TO_URL_SLUG: Record<Exclude<UnitStep, "UNLOCK">, string> = {
  CONTEXTUALIZE: "contextualize",
  DEFINE_OBJECTIVES: "define-objectives",
  COMPREHEND: "comprehend",
  OBSERVE: "observe",
  ANALYZE: "analyze",
  PRACTICE: "practice",
  PRODUCE: "produce",
  RECEIVE_FEEDBACK: "feedback",
  REWRITE: "rewrite",
  REFLECT: "reflect",
};

const URL_SLUG_TO_STEP: Record<string, Exclude<UnitStep, "UNLOCK">> = Object.fromEntries(
  Object.entries(STEP_TO_URL_SLUG).map(([step, slug]) => [slug, step as Exclude<UnitStep, "UNLOCK">]),
);

/** Inverso de `STEP_TO_URL_SLUG` — usado por `AttemptStepContainer` para
 * validar el segmento `step` de la URL contra `currentStep` real (Blueprint
 * §10.1). Retorna `undefined` si el slug no es válido. */
export function stepFromUrlSlug(slug: string): Exclude<UnitStep, "UNLOCK"> | undefined {
  return URL_SLUG_TO_STEP[slug];
}
