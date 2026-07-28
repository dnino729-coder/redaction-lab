import { RepeatableSpecification } from "../specifications/RepeatableSpecification";
import type { RepeatableContext } from "../specifications/RepeatableSpecification";
import { UnitNotRepeatableException } from "../exceptions/UnitNotRepeatableException";

// Policy (Domain Model v1.1, A-09/RN-11) — permite repetir una unidad ya
// COMPLETED/MASTERED generando un nuevo Attempt, sin alterar su
// UnitState (H-03). Invocada por `AcademyUnit.repeat()` sobre sí misma
// (H-02).
export class RepetitionPolicy {
  private readonly specification = new RepeatableSpecification();

  public assertCanRepeat(unitId: string, context: RepeatableContext): void {
    if (!this.specification.isSatisfiedBy(context)) {
      throw new UnitNotRepeatableException(unitId);
    }
  }
}
