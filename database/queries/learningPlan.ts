// Consultas Prisma reutilizables — Plan de Aprendizaje (13.4). Ver el límite
// exacto entre /prisma, database/ y services/database en ARCHITECTURE.md,
// sección 2.1. Sin reglas de negocio: solo acceso a datos.

import type { StudentScopedClient } from "@/database/repositories/withStudentContext";

/**
 * Regla de negocio del dominio (13.4, MUST): "un estudiante puede tener
 * múltiples planes, pero solo un plan activo". La semántica de "plan
 * vigente" ya fue corregida en My Plan (ver
 * features/my-plan/infrastructure/persistence/repositories/PrismaLearningPlanRepository.ts,
 * findCurrentByStudentId) para incluir ACTIVE y PAUSED — un plan pausado
 * sigue siendo el plan actual del estudiante, nunca "sin plan". Esta
 * consulta replica exactamente ese mismo filtro (ACTIVE|PAUSED, excluye
 * COMPLETED/CANCELLED por ser estados terminales) para que Dashboard deje
 * de tratar un plan PAUSED como inexistente. No se renombra la función ni
 * sus consumers (`findActiveLearningPlanSummary`, `hasActivePlan`) — fuera
 * de alcance de este fix, ver auditoría "Dashboard current-plan
 * inconsistency audit".
 */
export function queryActiveLearningPlan(tx: StudentScopedClient, studentId: string) {
  return tx.learningPlan.findFirst({
    where: { studentId, status: { in: ["ACTIVE", "PAUSED"] } },
    include: {
      learningProgress: true,
      dailyPlans: { orderBy: { planDate: "desc" }, take: 1 },
      weeklyPlans: { orderBy: { weekNumber: "desc" }, take: 1 },
    },
  });
}
