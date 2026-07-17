// Repositorio: Competencias y Analíticas de Aprendizaje (13.8), subconjunto
// para el bloque 6 (Evolución). Envuelve database/queries con una interfaz
// orientada a entidad; no contiene reglas de negocio — ver ARCHITECTURE.md,
// sección 2.1.

import { queryLearningAnalytics, queryStudentCompetencies } from "@/database/queries/competency";
import type { StudentScopedClient } from "./withStudentContext";

export interface CompetencySnapshotItem {
  competencyId: string;
  competencyName: string;
  masteryPercentage: number;
  currentLevel: string;
  targetLevel: string;
}

export interface LearningAnalyticsSnapshot {
  productivityIndex: number;
  engagementIndex: number;
  consistencyIndex: number;
  progressionIndex: number;
}

export async function findCompetencySnapshot(
  tx: StudentScopedClient,
  studentId: string,
): Promise<CompetencySnapshotItem[]> {
  const competencies = await queryStudentCompetencies(tx, studentId);

  return competencies.map((competency) => ({
    competencyId: competency.competencyId,
    competencyName: competency.competency.name,
    masteryPercentage: Number(competency.masteryPercentage),
    currentLevel: competency.currentLevel,
    targetLevel: competency.targetLevel,
  }));
}

export async function findLearningAnalytics(
  tx: StudentScopedClient,
  studentId: string,
): Promise<LearningAnalyticsSnapshot | null> {
  const analytics = await queryLearningAnalytics(tx, studentId);
  if (!analytics) return null;

  return {
    productivityIndex: Number(analytics.productivityIndex),
    engagementIndex: Number(analytics.engagementIndex),
    consistencyIndex: Number(analytics.consistencyIndex),
    progressionIndex: Number(analytics.progressionIndex),
  };
}
