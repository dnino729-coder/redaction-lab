import { DomainException } from "./DomainException";

// RN (Domain Model v1.1): ciertos comandos (p. ej. RequestFeedback)
// requieren que exista una Version pendiente de evaluación. Corresponde a
// ACADEMY_RULE_NO_PENDING_VERSION.
export class NoPendingVersionException extends DomainException {
  public constructor(attemptId: string) {
    super(
      `El intento "${attemptId}" no tiene una versión pendiente.`,
      "ACADEMY_RULE_NO_PENDING_VERSION",
    );
  }
}
