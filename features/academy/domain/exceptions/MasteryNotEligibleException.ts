import { DomainException } from "./DomainException";

// MasteryEligibleSpecification (Domain Model v1.1): un Attempt/AcademyUnit
// debe cumplir los criterios agregados de MasteryPolicy antes de poder
// marcarse MASTERED. Corresponde a ACADEMY_RULE_MASTERY_NOT_ELIGIBLE.
export class MasteryNotEligibleException extends DomainException {
  public constructor(unitId: string) {
    super(
      `AcademyUnit "${unitId}" no cumple los criterios de MasteryPolicy todavía.`,
      "ACADEMY_RULE_MASTERY_NOT_ELIGIBLE",
    );
  }
}
