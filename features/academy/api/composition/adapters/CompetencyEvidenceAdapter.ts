import type {
  CompetencyEvidencePort,
  CompetencyEvidenceSnapshot,
} from "@/features/academy/domain/ports/CompetencyEvidencePort";

// Implementación de `CompetencyEvidencePort` (Domain Layer, puerto ya
// Frozen, documentado explícitamente como "Fuente exacta: PENDIENTE DE
// DECISIÓN DE ARQUITECTURA (Riesgo 2 del Domain Model v1.1, heredado, no
// resuelto por este Sprint)"), consumido por `MasteryEvaluationService`
// para CMD-08 EvaluateMastery — Command explícitamente excluido de
// endpoint público (API Contract v1.3, Sección 4, "Exclusiones
// deliberadas": evaluación automática, ningún caso de uso lo describe como
// acción explícita del estudiante).
//
// Hallazgo de este Sprint (disclosed, no BLOCKER): no existe, en ningún
// documento Frozen ni en el schema real, una fuente de "evidencia de
// competencia" (Learning Analytics) ya construida — el propio Domain Model
// v1.1 deja explícitamente pendiente cuál sería esa fuente.
//
// Resolución: adaptador conservador (fail-closed respecto a `MASTERED`) —
// devuelve una foto de evidencia que nunca satisface
// `MasteryCriterion.isSatisfied()` (`independentEncountersWithoutScaffolding:
// 0 < requiredIndependentEncounters: 1`). Esto es correcto y seguro: sin una
// fuente real de evidencia, jamás se debe otorgar `MASTERED` de forma
// fabricada — se documenta como placeholder explícito, a sustituir cuando
// Platform Core resuelva el Riesgo 2 del Domain Model v1.1.
export class CompetencyEvidenceAdapter implements CompetencyEvidencePort {
  public async getEvidence(): Promise<CompetencyEvidenceSnapshot> {
    return {
      noSustainedCriticalWeakness: true,
      independentEncountersWithoutScaffolding: 0,
      requiredIndependentEncounters: 1,
    };
  }
}
