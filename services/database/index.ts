// Servicio: database — orquestación de reglas de negocio sobre los
// repositorios de database/ (sección 13). Nunca ejecuta Prisma/SQL
// directamente — siempre delega en database/repositories.
// Ver el límite exacto entre /prisma, database/ y services/database en
// ARCHITECTURE.md, sección 2.1 (hallazgo 9 de la auditoría de infraestructura).
// "Los servicios nunca dependerán de componentes visuales" (sección 5.4).
//
// Expone únicamente las lecturas "núcleo" que necesita el Dashboard
// (identidad, plan activo, continuación de escritura, coach, evaluación,
// consolidado propio). Gamificación y Analíticas tienen su propio servicio
// dedicado (services/gamification, services/analytics — sección 7 del
// diseño del Dashboard), tal como exige la separación de responsabilidades
// del documento consolidado.

import {
  findActiveLearningPlanSummary,
  findActiveRecommendation,
  findCoachContext,
  findContinuationTarget,
  findEstimatedPerformance,
  findStudentDashboard,
  findStudentIdentity,
  saveStudentDashboard,
  withServiceContext,
  withStudentContext,
  type ActiveRecommendation,
  type CoachContextSummary,
  type ContinuationTarget,
  type EstimatedPerformance,
  type LearningPlanSummary,
  type StudentDashboardRecord,
  type StudentDashboardUpsertInput,
  type StudentIdentitySummary,
} from "@/database/repositories";

export interface DashboardCoreData {
  identity: StudentIdentitySummary | null;
  learningPlan: LearningPlanSummary | null;
  continuation: ContinuationTarget | null;
  recommendation: ActiveRecommendation | null;
  coachContext: CoachContextSummary | null;
  estimatedPerformance: EstimatedPerformance | null;
  storedDashboard: StudentDashboardRecord | null;
}

/**
 * Lee, en una única transacción con contexto RLS
 * (prisma/migrations/202607170900_dashboard_rls_policies/migration.sql),
 * todas las fuentes "núcleo" del Dashboard. No combina resultados de forma
 * dependiente entre sí (cada lectura es independiente) — la composición final
 * en un `DashboardReadModel` es responsabilidad del Dashboard Service
 * (features/dashboard/services), no de este servicio compartido.
 */
export async function getDashboardCoreData(studentId: string): Promise<DashboardCoreData> {
  return withStudentContext(studentId, async (tx) => {
    const [identity, learningPlan, continuation, recommendation, coachContext, estimatedPerformance, storedDashboard] =
      await Promise.all([
        findStudentIdentity(tx, studentId),
        findActiveLearningPlanSummary(tx, studentId),
        findContinuationTarget(tx, studentId),
        findActiveRecommendation(tx, studentId),
        findCoachContext(tx, studentId),
        findEstimatedPerformance(tx, studentId),
        findStudentDashboard(tx, studentId),
      ]);

    return {
      identity,
      learningPlan,
      continuation,
      recommendation,
      coachContext,
      estimatedPerformance,
      storedDashboard,
    };
  });
}

/**
 * Persiste el consolidado `student_dashboard` (13.8, MUST: "el Dashboard
 * consolida únicamente información derivada de otras tablas — no almacena
 * información duplicada"). Ver docs/modules/dashboard.md, sección 10:
 * en producción esta escritura la realiza un proceso programado (15.1,
 * Materialized View); en ausencia de ese job en esta fase, el Dashboard
 * Service la invoca tras cada lectura para mantener el espejo actualizado.
 */
export async function persistDashboardConsolidation(
  studentId: string,
  data: StudentDashboardUpsertInput,
): Promise<void> {
  await withServiceContext((tx) => saveStudentDashboard(tx, studentId, data));
}
