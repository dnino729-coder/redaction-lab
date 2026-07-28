import { DomainException } from "./DomainException";

// RN (Domain Model v1.1): un ModelExample RETIRED no admite nuevas
// operaciones de edición/republicación. Corresponde a
// ACADEMY_CONFLICT_MODEL_EXAMPLE_ALREADY_RETIRED (ConflictError, no
// BusinessRuleViolation — se lanza igualmente como DomainException; la
// capa Application la traduce al código HTTP 409 correspondiente).
export class ModelExampleAlreadyRetiredException extends DomainException {
  public constructor(modelExampleId: string) {
    super(
      `El ModelExample "${modelExampleId}" ya está retirado (RETIRED) y no admite modificaciones.`,
      "ACADEMY_CONFLICT_MODEL_EXAMPLE_ALREADY_RETIRED",
    );
  }
}
