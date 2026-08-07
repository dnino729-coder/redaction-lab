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
import { getAnalyticsSnapshot, type AnalyticsSnapshot } from "@/services/analytics";
import { getDashboardCoreData, persistDashboardConsolidation } from "@/services/database";
import { getGamificationSnapshot, type GamificationSnapshot } from "@/services/gamification";
import { redis } from "@/lib/redis";
import {
  DASHBOARD_CACHE_KEY_PREFIX,
  DASHBOARD_CACHE_TTL_SECONDS,
} from "../constants/dashboard.constants";
import { buildEcosystemLinks, daysBetween, selectWelcomeVariant } from "./dashboardService.logic";
import type { DashboardReadModel } from "../types";

export { buildEcosystemLinks, daysBetween, selectWelcomeVariant } from "./dashboardService.logic";

// Valores por defecto usados únicamente cuando su propia lectura
// independiente falla (Sprint 10, remediación D1 — Destructive Testing
// Report v1): `getGamificationSnapshot`/`getAnalyticsSnapshot` corren en su
// propia transacción independiente de `getDashboardCoreData` (cada una abre
// su propio `withStudentContext`), por lo que un fallo en una no invalida a
// las otras — se degradan de forma aislada, en vez de tumbar todo el
// Dashboard. `getDashboardCoreData` en sí (sus 7 lecturas internas) sigue
// siendo todo-o-nada porque comparten una única transacción Postgres con
// contexto RLS (`withStudentContext`) — degradarla requeriría separar esa
// transacción, un cambio de seguridad/arquitectura fuera de alcance de esta
// corrección (ver informe de Sprint 10).
const EMPTY_GAMIFICATION_SNAPSHOT: GamificationSnapshot = {
  currentStreak: 0,
  longestStreak: 0,
  levelNumber: 0,
  totalXp: 0,
};

const EMPTY_ANALYTICS_SNAPSHOT: AnalyticsSnapshot = {
  competencies: [],
  learningAnalytics: null,
  studyFrequency: null,
  performance: null,
};

async function buildReadModel(studentId: string): Promise<DashboardReadModel> {
  const [coreResult, gamificationResult, analyticsResult] = await Promise.allSettled([
    getDashboardCoreData(studentId),
    getGamificationSnapshot(studentId),
    getAnalyticsSnapshot(studentId),
  ]);

  // `core` sigue siendo esencial (identidad/plan/continuación alimentan casi
  // todos los bloques) — su fallo continúa propagándose tal como antes, sin
  // cambiar ese comportamiento (fuera del alcance de esta corrección).
  if (coreResult.status === "rejected") {
    console.error("================================");
    console.error("ERROR EN getDashboardCoreData");
    console.error(coreResult.reason);
    console.error("================================");

    throw coreResult.reason;
  }
  const core = coreResult.value;

  if (gamificationResult.status === "rejected") {
    // eslint-disable-next-line no-console -- mismo patrón ya usado en este archivo (persistDashboardConsolidation, más abajo)
    console.error(
      "[dashboard] no se pudo obtener el snapshot de gamificación, se degrada a valores por defecto",
      gamificationResult.reason,
    );
  }
  const gamification =
    gamificationResult.status === "fulfilled"
      ? gamificationResult.value
      : EMPTY_GAMIFICATION_SNAPSHOT;

  if (analyticsResult.status === "rejected") {
    // eslint-disable-next-line no-console -- mismo patrón ya usado en este archivo (persistDashboardConsolidation, más abajo)
    console.error(
      "[dashboard] no se pudo obtener el snapshot de analíticas, se degrada a valores por defecto",
      analyticsResult.reason,
    );
  }
  const analytics =
    analyticsResult.status === "fulfilled" ? analyticsResult.value : EMPTY_ANALYTICS_SNAPSHOT;

  const hasAnyHistory = Boolean(core.continuation || core.learningPlan || core.storedDashboard);

  const daysUntilExam = core.identity?.targetExamDate
    ? daysBetween(new Date(), core.identity.targetExamDate)
    : null;

  const readModel: DashboardReadModel = {
    studentId,
    welcome: {
      variant: selectWelcomeVariant({
        hasAnyHistory,
        lastLoginAt: core.identity?.lastLoginAt ?? null,
      }),
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
