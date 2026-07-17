// Consultas Prisma reutilizables — Plan de Aprendizaje (13.4). Ver el límite
// exacto entre /prisma, database/ y services/database en ARCHITECTURE.md,
// sección 2.1. Sin reglas de negocio: solo acceso a datos.

import type { StudentScopedClient } from "@/database/repositories/withStudentContext";

/**
 * Regla de negocio del dominio (13.4, MUST): "un estudiante puede tener
 * múltiples planes, pero solo un plan activo" — por eso basta `findFirst`
 * con `status: ACTIVE` para obtener el plan vigente, sin ambigüedad.
 */
export function queryActiveLearningPlan(tx: StudentScopedClient, studentId: string) {
  return tx.learningPlan.findFirst({
    where: { studentId, status: "ACTIVE" },
    include: {
      learningProgress: true,
      dailyPlans: { orderBy: { planDate: "desc" }, take: 1 },
      weeklyPlans: { orderBy: { weekNumber: "desc" }, take: 1 },
    },
  });
}
