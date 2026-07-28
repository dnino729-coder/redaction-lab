import { DomainException } from "./DomainException";
import type { UnitState } from "../enums/UnitState";

// Transición de estado inválida a nivel de AcademyUnit (LOCKED -> ...).
// Aplica cuando ninguna regla más específica (RN-1..RN-17) tipifica mejor
// el conflicto; ACADEMY_RULE_UNIT_NOT_UNLOCKED es el código habitual que
// el Application Layer traduce a partir de esta excepción.
export class InvalidUnitStateTransitionException extends DomainException {
  public constructor(unitId: string, from: UnitState, to: UnitState) {
    super(
      `AcademyUnit "${unitId}": transición de estado inválida de "${from}" a "${to}".`,
      "ACADEMY_RULE_UNIT_NOT_UNLOCKED",
    );
  }
}
