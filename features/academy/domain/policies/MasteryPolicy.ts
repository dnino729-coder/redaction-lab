import { MasteryEligibleSpecification } from "../specifications/MasteryEligibleSpecification";
import type { MasteryEligibleContext } from "../specifications/MasteryEligibleSpecification";

// Policy (Domain Model v1.1, RN-8) — decide si una AcademyUnit COMPLETED
// puede promoverse a MASTERED. CMD-08 EvaluateMastery (Application Layer
// Spec v1.0) trata la no-elegibilidad como no-op silencioso, no como
// excepción — por eso esta Policy expone únicamente una consulta
// booleana, invocada por `AcademyUnit.isEligibleForMastery()` sobre sí
// misma (H-02).
export class MasteryPolicy {
  private readonly specification = new MasteryEligibleSpecification();

  public isEligible(context: MasteryEligibleContext): boolean {
    return this.specification.isSatisfiedBy(context);
  }
}
