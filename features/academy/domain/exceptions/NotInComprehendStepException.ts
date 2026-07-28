import { DomainException } from "./DomainException";

// Application Layer Spec v1.0, CMD-17 VerifyComprehension: el intento no
// se encuentra en el paso COMPREHEND. Corresponde a
// ACADEMY_CONFLICT_NOT_IN_COMPREHEND_STEP.
export class NotInComprehendStepException extends DomainException {
  public constructor(attemptId: string) {
    super(
      `El intento "${attemptId}" no está en el paso COMPREHEND.`,
      "ACADEMY_CONFLICT_NOT_IN_COMPREHEND_STEP",
    );
  }
}
