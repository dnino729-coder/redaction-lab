import { UnitState } from "../enums/UnitState";

// Specification (Domain Model v1.1, A-09) — una AcademyUnit admite
// repetición (nuevo Attempt) cuando su estado es COMPLETED o MASTERED
// (RN-11: repetir no revierte el estado ni reemite el evento de
// finalización).
export interface RepeatableContext {
  currentState: UnitState;
}

export class RepeatableSpecification {
  public isSatisfiedBy(context: RepeatableContext): boolean {
    return (
      context.currentState === UnitState.COMPLETED ||
      context.currentState === UnitState.MASTERED
    );
  }
}
