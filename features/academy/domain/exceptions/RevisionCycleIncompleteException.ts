import { DomainException } from "./DomainException";

// RN-4 (Domain Model v1.1): no se puede iniciar Reflection mientras el
// ciclo Feedback -> Revision no se haya cerrado con una nueva Version.
// Corresponde a ACADEMY_RULE_REVISION_CYCLE_INCOMPLETE.
export class RevisionCycleIncompleteException extends DomainException {
  public constructor(attemptId: string) {
    super(
      `El ciclo de revisión del intento "${attemptId}" no está completo.`,
      "ACADEMY_RULE_REVISION_CYCLE_INCOMPLETE",
    );
  }
}
