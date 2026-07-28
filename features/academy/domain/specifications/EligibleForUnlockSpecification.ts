import { UnitState } from "../enums/UnitState";

// Specification (Domain Model v1.1, RN-6/RN-7) — una AcademyUnit LOCKED
// es elegible para desbloqueo cuando la Unidad predecesora de la misma
// progresión (por TextType) alcanzó COMPLETED (o, transitivamente,
// MASTERED — invariante 4: MASTERED no genera un segundo desbloqueo, pero
// implica que COMPLETED ya ocurrió). Sin umbral de puntuación (RN-6); el
// Motor Pedagógico nunca puede desbloquear (RN-7, excluido de este
// criterio por diseño — no es un parámetro de esta Specification).
export interface EligibleForUnlockContext {
  currentState: UnitState;
  isFirstInSequence: boolean;
  predecessorState: UnitState | null;
}

export class EligibleForUnlockSpecification {
  public isSatisfiedBy(context: EligibleForUnlockContext): boolean {
    if (context.currentState !== UnitState.LOCKED) {
      return false;
    }
    if (context.isFirstInSequence) {
      return true;
    }
    return (
      context.predecessorState === UnitState.COMPLETED ||
      context.predecessorState === UnitState.MASTERED
    );
  }
}
