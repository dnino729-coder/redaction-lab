// Repositorio: LearningMetric / PerformanceMetric (13.8), fuente de
// "frecuencia de estudio" (bloque 6). Envuelve database/queries con una
// interfaz orientada a entidad; no contiene reglas de negocio — ver
// ARCHITECTURE.md, sección 2.1.

import { queryLatestLearningMetric, queryLatestPerformanceMetric } from "@/database/queries/metrics";
import type { StudentScopedClient } from "./withStudentContext";

export interface StudyFrequencySnapshot {
  studyTimeMinutes: number;
  completedSessions: number;
  completedTasks: number;
  activeDays: number;
}

export interface PerformanceSnapshot {
  averageScore: number;
  successRate: number;
}

export async function findStudyFrequencySnapshot(
  tx: StudentScopedClient,
  studentId: string,
): Promise<StudyFrequencySnapshot | null> {
  const metric = await queryLatestLearningMetric(tx, studentId);
  if (!metric) return null;

  return {
    studyTimeMinutes: metric.studyTimeMinutes,
    completedSessions: metric.completedSessions,
    completedTasks: metric.completedTasks,
    activeDays: metric.activeDays,
  };
}

export async function findPerformanceSnapshot(
  tx: StudentScopedClient,
  studentId: string,
): Promise<PerformanceSnapshot | null> {
  const metric = await queryLatestPerformanceMetric(tx, studentId);
  if (!metric) return null;

  return {
    averageScore: Number(metric.averageScore),
    successRate: Number(metric.successRate),
  };
}
