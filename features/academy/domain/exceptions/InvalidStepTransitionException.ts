import { DomainException } from "./DomainException";
import type { UnitStep } from "../enums/UnitStep";

// RN-1 (Domain Model v1.1): el paso (`UnitStep`) de un Attempt solo puede
// avanzar en el orden fijo de los 11 pasos oficiales (A-02): CONTEXTUALIZE
// -> DEFINE_OBJECTIVES -> COMPREHEND -> OBSERVE -> ANALYZE -> PRACTICE ->
// PRODUCE -> RECEIVE_FEEDBACK -> REWRITE -> REFLECT -> UNLOCK (con el
// ciclo explícito REWRITE ⇄ RECEIVE_FEEDBACK). Corresponde a
// ACADEMY_RULE_INVALID_STEP_FOR_COMMAND en el catálogo de errores.
export class InvalidStepTransitionException extends DomainException {
  public constructor(from: UnitStep, to: UnitStep) {
    super(
      `Transición de paso inválida: no se puede pasar de "${from}" a "${to}".`,
      "ACADEMY_RULE_INVALID_STEP_FOR_COMMAND",
    );
  }
}
