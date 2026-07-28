import { UnitState } from "../enums/UnitState";

// Specification (Domain Model v1.1, RN-8) — una AcademyUnit COMPLETED es
// elegible para MASTERED cuando `MasteryCriterion.isSatisfied()` es
// verdadero (ausencia de debilidad HIGH/CRITICAL sostenida + al menos un
// encuentro independiente posterior sin andamiaje).
export interface MasteryEligibleContext {
  currentState: UnitState;
  criterionSatisfied: boolean;
}

export class MasteryEligibleSpecification {
  public isSatisfiedBy(context: MasteryEligibleContext): boolean {
    if (context.currentState !== UnitState.COMPLETED) {
      return false;
    }
    return context.criterionSatisfied;
  }
}
