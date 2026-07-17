// Dashboard Service — única fachada que agrega todas las lecturas del
// módulo en una sola respuesta consolidada (docs/modules/dashboard.md,
// sección 7: "Un 'Dashboard Service' actúa como única fachada... este es el
// único punto de entrada de datos del módulo"). Combina:
//   - services/database (identidad, plan, continuación, coach, evaluación)
//   - services/gamification (racha, nivel, XP)
//   - services/analytics (competencias, índices, frecuencia, rendimiento)
// Nunca importa nada de otra feature (regla de aislamiento, sección 5.4) ni
// llama directamente a Prisma/Redis sin pasar por services/ (sección 7).

import type { DelfLevel } from "@prisma/client";
import { getAnalyticsSnapshot } from "@/services/analytics";
import { getDashboardCoreData, persistDashboardConsolidation } from "@/services/database";
import { getGamificationSnapshot } from "@/services/gamification";
import { redis } from "@/lib/redis";
import { DASHBOARD_CACHE_KEY_PREFIX, DASHBOARD_CACHE_TTL_SECONDS } from "../constants/dashboard.constants";
import { buildEcosystemLinks, daysBetween, selectWelcomeVariant } from "./dashboardService.logic";
import type { DashboardReadModel } from "../types";

export { buildEcosystemLinks, daysBetween, selectWelcomeVariant } from "./dashboardService.logic";

async function buildReadModel(studentId: string): Promise<DashboardReadModel> {
  const [core, gamification, analytics] = await Promise.all([
    getDashboardCoreData(studentId),
    getGamificationSnapshot(studentId),
    getAnalyticsSnapshot(studentId),
  ]);

  const hasAnyHistory = Boolean(core.continuation || core.learningPlan || core.storedDashboard);

  const daysUntilExam = core.identity?.targetExamDate
    ? daysBetween(new Date(), core.identity.targetExamDate)
    : null;

  const readModel: DashboardReadModel = {
    studentId,
    welcome: {
      variant: selectWelcomeVariant({ hasAnyHistory, lastLoginAt: core.identity?.lastLoginAt ?? null }),
      firstName: core.identity?.firstName ?? "",
      avatarUrl: core.identity?.avatarUrl ?? null,
      lastLoginAt: core.identity?.lastLoginAt?.toISOString() ?? null,
    },
    goal: {
      currentLevel: core.identity?.currentLevel ?? null,
      targetLevel: core.identity?.targetLevel ?? null,
      targetExamDate: core.identity?.targetExamDate?.toISOString() ?? null,
      daysUntilExam,
      overallPreparationPercentage: core.learningPlan?.completionPercentage ?? null,
      estimatedPerformance: core.estimatedPerformance
        ? {
            finalScore: core.estimatedPerformance.finalScore,
            percentage: core.estimatedPerformance.percentage,
            passed: core.estimatedPerformance.passed,
          }
        : null,
    },
    plan: {
      hasActivePlan: Boolean(core.learningPlan),
      weeklyRecommendedMinutes: core.learningPlan?.weeklyRecommendedMinutes ?? null,
      weeklyCompletedMinutes: core.learningPlan?.weeklyCompletedMinutes ?? null,
      weeklyCompletionPercentage: core.learningPlan?.weeklyCompletionPercentage ?? null,
      dailyGoalMinutes: core.learningPlan?.dailyGoalMinutes ?? null,
      dailyCompletedMinutes: core.learningPlan?.dailyCompletedMinutes ?? null,
    },
    continuation: {
      available: Boolean(core.continuation),
      submissionId: core.continuation?.submissionId ?? null,
      status: core.continuation?.status ?? null,
      lastDraftWordCount: core.continuation?.lastDraftWordCount ?? null,
      lastActivityAt: core.continuation?.updatedAt?.toISOString() ?? null,
    },
    recommendation: {
      available: Boolean(core.recommendation),
      recommendationId: core.recommendation?.recommendationId ?? null,
      text: core.recommendation?.recommendation ?? null,
      priority: core.recommendation?.priority ?? null,
    },
    evolution: {
      competencies: analytics.competencies.map((item) => ({
        competencyId: item.competencyId,
        competencyName: item.competencyName,
        masteryPercentage: item.masteryPercentage,
      })),
      studyFrequency: analytics.studyFrequency
        ? {
            studyTimeMinutes: analytics.studyFrequency.studyTimeMinutes,
            activeDays: analytics.studyFrequency.activeDays,
          }
        : null,
      performance: analytics.performance,
      analytics: analytics.learningAnalytics,
      currentStreak: gamification.currentStreak,
    },
    ecosystems: buildEcosystemLinks(),
    generatedAt: new Date().toISOString(),
  };

  // Materialización del consolidado (15.1) — ver services/database,
  // persistDashboardConsolidation. No bloquea la respuesta al estudiante si
  // falla: se registra pero no interrumpe la lectura ya obtenida (14.7:
  // "mensajes de error tranquilos, nunca alarmantes" — un fallo al persistir
  // el espejo no debe convertirse en un error visible para el estudiante).
  if (readModel.goal.currentLevel) {
    persistDashboardConsolidation(studentId, {
      currentLevel: readModel.goal.currentLevel as DelfLevel,
      totalXp: gamification.totalXp,
      completedActivities: core.learningPlan?.completedTasks ?? 0,
      completedPlans: core.storedDashboard?.completedPlans ?? 0,
      currentStreak: gamification.currentStreak,
    }).catch((error) => {
      // eslint-disable-next-line no-console -- sin lógica de logging estructurado todavía (fuera de alcance de este módulo)
      console.error("[dashboard] no se pudo persistir el consolidado student_dashboard", error);
    });
  }

  return readModel;
}

/**
 * Punto de entrada único del módulo Dashboard (sección 7). Cachea en Redis
 * (15.1) para cumplir el presupuesto de rendimiento de <5s (sección 1) sin
 * recalcular agregados en cada carga.
 */
export async function getDashboardReadModel(studentId: string): Promise<DashboardReadModel> {
  const cacheKey = `${DASHBOARD_CACHE_KEY_PREFIX}${studentId}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as DashboardReadModel;
    }
  } catch {
    // Redis no disponible: se degrada a lectura directa sin caché — nunca
    // bloquea la carga del Dashboard por un fallo de infraestructura de
    // caché (14.7).
  }

  const readModel = await buildReadModel(studentId);

  try {
    await redis.set(cacheKey, JSON.stringify(readModel), "EX", DASHBOARD_CACHE_TTL_SECONDS);
  } catch {
    // Ídem: un fallo al escribir en caché no debe impedir devolver los datos ya obtenidos.
  }

  return readModel;
}

/** Invalida la caché tras una interacción que cambia el estado visible (sección 8). */
export async function invalidateDashboardCache(studentId: string): Promise<void> {
  try {
    await redis.del(`${DASHBOARD_CACHE_KEY_PREFIX}${studentId}`);
  } catch {
    // No crítico: la próxima carga natural del TTL reflejará el cambio.
  }
}
