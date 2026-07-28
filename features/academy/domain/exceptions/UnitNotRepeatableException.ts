import { DomainException } from "./DomainException";

// RepeatableSpecification (Domain Model v1.1): solo unidades COMPLETED o
// MASTERED, y que cumplan RepetitionPolicy, admiten un nuevo Attempt.
// Corresponde a ACADEMY_RULE_UNIT_NOT_REPEATABLE.
export class UnitNotRepeatableException extends DomainException {
  public constructor(unitId: string) {
    super(
      `AcademyUnit "${unitId}" no es elegible para repetición según RepetitionPolicy.`,
      "ACADEMY_RULE_UNIT_NOT_REPEATABLE",
    );
  }
}
