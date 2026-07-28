import { MasteryLevel } from "../enums/MasteryLevel";

// Value Object (Domain Model v1.1, Sección 5) — condición evaluada para
// el estado terminal `MASTERED` (RN-8): ausencia de debilidad
// HIGH/CRITICAL sostenida en `COMPLETED` y en al menos un encuentro
// independiente posterior sin andamiaje. Persistence Layer v1.0 Sección 8
// confirma explícitamente que **no se persiste como columna** — es
// evaluado en tiempo de ejecución por `MasteryEvaluationService`, nunca
// almacenado; su resultado se refleja indirectamente en
// `AcademyUnit.state = MASTERED`.
export class MasteryCriterion {
  private constructor(
    private readonly _noSustainedCriticalWeakness: boolean,
    private readonly _independentEncountersWithoutScaffolding: number,
    private readonly _requiredIndependentEncounters: number,
  ) {}

  public static evaluate(params: {
    noSustainedCriticalWeakness: boolean;
    independentEncountersWithoutScaffolding: number;
    requiredIndependentEncounters: number;
  }): MasteryCriterion {
    return new MasteryCriterion(
      params.noSustainedCriticalWeakness,
      params.independentEncountersWithoutScaffolding,
      params.requiredIndependentEncounters,
    );
  }

  /** RN-8 — resultado booleano del criterio, consumido por
   * `MasteryPolicy`/`MasteryEvaluationService`. */
  public isSatisfied(): boolean {
    return (
      this._noSustainedCriticalWeakness &&
      this._independentEncountersWithoutScaffolding >= this._requiredIndependentEncounters
    );
  }

  /** Nivel de dominio derivado (Sección 6) — `SUSTAINED` únicamente
   * cuando el criterio completo se satisface. */
  public toLevel(): MasteryLevel {
    if (this.isSatisfied()) return MasteryLevel.SUSTAINED;
    if (this._independentEncountersWithoutScaffolding > 0) return MasteryLevel.CONSOLIDATING;
    return MasteryLevel.DEVELOPING;
  }
}
