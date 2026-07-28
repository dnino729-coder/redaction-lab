import { DomainException } from "./DomainException";
import type { OverrideAction } from "../enums/OverrideAction";

// TeacherOverridePolicy (Domain Model v1.1): una OverrideAction solo es
// válida para ciertos UnitState/UnitStep. Corresponde a
// ACADEMY_RULE_OVERRIDE_NOT_VALID_FOR_STATE.
export class OverrideNotValidForStateException extends DomainException {
  public constructor(unitId: string, action: OverrideAction) {
    super(
      `La acción de override "${action}" no es válida para el estado actual de la unidad "${unitId}".`,
      "ACADEMY_RULE_OVERRIDE_NOT_VALID_FOR_STATE",
    );
  }
}
