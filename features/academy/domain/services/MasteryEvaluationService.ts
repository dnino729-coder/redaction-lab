import { MasteryCriterion } from "../value-objects/MasteryCriterion";
import type { CompetencyEvidencePort } from "../ports/CompetencyEvidencePort";

// Domain Service (Domain Model v1.1, RN-8) — construye el
// `MasteryCriterion` de una AcademyUnit COMPLETED a partir de la
// evidencia externa de competencia (`CompetencyEvidencePort`). El
// resultado se entrega a `AcademyUnit.isEligibleForMastery()`, que es
// quien decide y aplica la transición sobre sí misma (H-02) —
// `MasteryEvaluationService` nunca muta el Aggregate.
export class MasteryEvaluationService {
  public constructor(
    private readonly competencyEvidencePort: CompetencyEvidencePort,
  ) {}

  public async evaluate(params: {
    studentId: string;
    textType: string;
  }): Promise<MasteryCriterion> {
    const evidence = await this.competencyEvidencePort.getEvidence(
      params.studentId,
      params.textType,
    );
    return MasteryCriterion.evaluate({
      noSustainedCriticalWeakness: evidence.noSustainedCriticalWeakness,
      independentEncountersWithoutScaffolding: evidence.independentEncountersWithoutScaffolding,
      requiredIndependentEncounters: evidence.requiredIndependentEncounters,
    });
  }
}
