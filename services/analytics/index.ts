// Servicio: analytics — Analíticas (sección 13.8).
// "Los servicios nunca dependerán de componentes visuales" (sección 5.4).
//
// Alcance de esta fase (implementación del módulo Dashboard): expone
// ÚNICAMENTE lecturas de solo-consulta (competencias, índices de Learning
// Analytics, frecuencia de estudio, rendimiento) para el bloque 6 del
// Dashboard. NO implementa el cálculo de esos índices (eso pertenece al
// futuro módulo de Competencias/Analíticas, 09_learning_analytics) — aquí
// solo se leen los valores ya calculados y persistidos.

import {
  findCompetencySnapshot,
  findLearningAnalytics,
  findPerformanceSnapshot,
  findStudyFrequencySnapshot,
  withStudentContext,
  type CompetencySnapshotItem,
  type LearningAnalyticsSnapshot,
  type PerformanceSnapshot,
  type StudyFrequencySnapshot,
} from "@/database/repositories";

export interface AnalyticsSnapshot {
  competencies: CompetencySnapshotItem[];
  learningAnalytics: LearningAnalyticsSnapshot | null;
  studyFrequency: StudyFrequencySnapshot | null;
  performance: PerformanceSnapshot | null;
}

export async function getAnalyticsSnapshot(studentId: string): Promise<AnalyticsSnapshot> {
  return withStudentContext(studentId, async (tx) => {
    const [competencies, learningAnalytics, studyFrequency, performance] = await Promise.all([
      findCompetencySnapshot(tx, studentId),
      findLearningAnalytics(tx, studentId),
      findStudyFrequencySnapshot(tx, studentId),
      findPerformanceSnapshot(tx, studentId),
    ]);

    return { competencies, learningAnalytics, studyFrequency, performance };
  });
}
