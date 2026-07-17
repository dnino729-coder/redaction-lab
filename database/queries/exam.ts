// Consultas Prisma reutilizables — Evaluación del DELF (13.6), subconjunto
// leído por el Dashboard (bloque 2, "nivel estimado de desempeño" —
// equivalente a "Niveau estimé" de 10.2; corrección de auditoría,
// docs/modules/dashboard.md sección 10). Sin reglas de negocio: solo acceso
// a datos.

import type { StudentScopedClient } from "@/database/repositories/withStudentContext";

export function queryLatestEvaluatedAttempt(tx: StudentScopedClient, studentId: string) {
  return tx.examAttempt.findFirst({
    where: { studentId, status: "EVALUATED" },
    orderBy: { finishedAt: "desc" },
    include: { evaluationResult: true },
  });
}
