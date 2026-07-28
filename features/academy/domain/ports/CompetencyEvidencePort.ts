// Puerto de dominio — evidencia externa de competencia (Learning
// Analytics / Competencias), consultada por `MasteryEvaluationService`
// para construir el `MasteryCriterion` de RN-8 (CMD-08 EvaluateMastery,
// Application Layer Spec v1.0). Fuente exacta: PENDIENTE DE DECISIÓN DE
// ARQUITECTURA (Riesgo 2 del Domain Model v1.1, heredado, no resuelto por
// este Sprint).
export interface CompetencyEvidenceSnapshot {
  readonly noSustainedCriticalWeakness: boolean;
  readonly independentEncountersWithoutScaffolding: number;
  readonly requiredIndependentEncounters: number;
}

export interface CompetencyEvidencePort {
  getEvidence(studentId: string, textType: string): Promise<CompetencyEvidenceSnapshot>;
}
