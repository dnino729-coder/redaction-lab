// Consultas Prisma reutilizables — LearningMetric / PerformanceMetric (13.8),
// fuente de "frecuencia de estudio" (bloque 6) y de apoyo al "nivel estimado
// de desempeño" (bloque 2) — ver corrección de auditoría en
// docs/modules/dashboard.md, sección 10. Sin reglas de negocio: solo acceso
// a datos.

import type { StudentScopedClient } from "@/database/repositories/withStudentContext";

export function queryLatestLearningMetric(tx: StudentScopedClient, studentId: string) {
  return tx.learningMetric.findFirst({
    where: { studentId },
    orderBy: { calculatedAt: "desc" },
  });
}

export function queryLatestPerformanceMetric(tx: StudentScopedClient, studentId: string) {
  return tx.performanceMetric.findFirst({
    where: { studentId },
    orderBy: { evaluatedAt: "desc" },
  });
}

export interface LearningMetricSnapshotInput {
  studentId: string;
  studyTimeMinutes: number;
  completedSessions: number;
  completedTasks: number;
  activeDays: number;
  calculatedAt: Date;
}

/**
 * Inserta un nuevo snapshot append-only en `learning_metric` (mismo patrón
 * de "materialización por snapshots" que `learning_metric`/`performance_metric`
 * ya usan — se lee siempre el más reciente vía `queryLatestLearningMetric`,
 * nunca se hace UPDATE de un snapshot anterior). `id` lo genera la base de
 * datos (`gen_random_uuid()`); `calculated_at` no tiene default y lo fija
 * el llamador. Usado por el consumer de Analytics de Academia (Block 2D).
 */
export function insertLearningMetricSnapshot(
  tx: StudentScopedClient,
  input: LearningMetricSnapshotInput,
) {
  return tx.learningMetric.create({
    data: {
      studentId: input.studentId,
      studyTimeMinutes: input.studyTimeMinutes,
      completedSessions: input.completedSessions,
      completedTasks: input.completedTasks,
      activeDays: input.activeDays,
      calculatedAt: input.calculatedAt,
    },
  });
}
