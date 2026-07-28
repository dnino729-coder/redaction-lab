import { DomainException } from "./DomainException";
import type { UnitStep } from "../enums/UnitStep";

// Application Layer Spec v1.0, CMD-16 AdvanceStep: el paso actual no es
// uno de los pasos de contenido libre (`FREE_ADVANCE_STEPS`) previos a la
// Producción. Corresponde a ACADEMY_CONFLICT_STEP_NOT_ELIGIBLE.
export class StepNotEligibleException extends DomainException {
  public constructor(attemptId: string, currentStep: UnitStep) {
    super(
      `El intento "${attemptId}" en el paso "${currentStep}" no es elegible para AdvanceStep.`,
      "ACADEMY_CONFLICT_STEP_NOT_ELIGIBLE",
    );
  }
}
