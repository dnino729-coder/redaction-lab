import { EligibleForUnlockSpecification } from "../specifications/EligibleForUnlockSpecification";
import type { EligibleForUnlockContext } from "../specifications/EligibleForUnlockSpecification";
import { UnlockNotEligibleException } from "../exceptions/UnlockNotEligibleException";

// Policy (Domain Model v1.1, RN-6/RN-7) — envuelve
// EligibleForUnlockSpecification aplicando la excepción de dominio
// correspondiente. Invocada por `AcademyUnit` sobre sí misma (H-02:
// ninguna Policy muta el Aggregate directamente ni decide en su lugar).
export class UnlockPolicy {
  private readonly specification = new EligibleForUnlockSpecification();

  public isEligible(context: EligibleForUnlockContext): boolean {
    return this.specification.isSatisfiedBy(context);
  }

  public assertEligible(unitId: string, context: EligibleForUnlockContext): void {
    if (!this.isEligible(context)) {
      throw new UnlockNotEligibleException(unitId);
    }
  }
}
