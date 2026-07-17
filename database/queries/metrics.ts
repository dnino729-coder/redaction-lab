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
