import { DomainException } from "./DomainException";

// RN-2 (Domain Model v1.1): no se puede avanzar de COMPREHEND a PRODUCE
// sin que el estudiante haya verificado comprensión de la consigna (CMD-17
// VerifyComprehension). Corresponde a ACADEMY_RULE_COMPREHENSION_NOT_VERIFIED.
export class ComprehensionNotVerifiedException extends DomainException {
  public constructor(attemptId: string) {
    super(
      `No se puede iniciar la producción: comprensión de la consigna no verificada para el intento "${attemptId}".`,
      "ACADEMY_RULE_COMPREHENSION_NOT_VERIFIED",
    );
  }
}
