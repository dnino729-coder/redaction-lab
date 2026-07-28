import { DomainException } from "./DomainException";

// RN (Domain Model v1.1): un estudiante no puede tener dos Attempts
// simultáneamente activos sobre la misma AcademyUnit. Corresponde a
// ACADEMY_RULE_ATTEMPT_ALREADY_ACTIVE.
export class AttemptAlreadyActiveException extends DomainException {
  public constructor(unitId: string) {
    super(
      `Ya existe un intento activo para la unidad "${unitId}".`,
      "ACADEMY_RULE_ATTEMPT_ALREADY_ACTIVE",
    );
  }
}
