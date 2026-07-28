import { DomainException } from "./DomainException";

// EligibleForUnlockSpecification (Domain Model v1.1): UnitSequenceService
// consulta esta Specification antes de emitir UnitUnlockedEvent.
// Corresponde a ACADEMY_RULE_UNLOCK_NOT_ELIGIBLE.
export class UnlockNotEligibleException extends DomainException {
  public constructor(unitId: string) {
    super(
      `AcademyUnit "${unitId}" no es elegible para desbloqueo todavía.`,
      "ACADEMY_RULE_UNLOCK_NOT_ELIGIBLE",
    );
  }
}
