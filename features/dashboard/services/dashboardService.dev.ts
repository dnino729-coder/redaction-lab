// Dashboard Service (modo desarrollo) — DASHBOARD_DEV_MODE. Aislado a
// propósito de dashboardService.ts: no importa Prisma, Redis, Clerk ni
// ninguna API externa, solo construye un DashboardReadModel simulado en
// memoria para poder visualizar los 7 bloques del Dashboard sin sesión ni
// base de datos. buildEcosystemLinks() se reutiliza de dashboardService.logic
// (lógica pura, misma ausencia de dependencias de infraestructura) para no
// duplicar la lista de espacios como una segunda fuente de verdad.
import { buildEcosystemLinks } from "./dashboardService.logic";
import type { DashboardReadModel } from "../types";

export const DASHBOARD_DEV_MODE_STUDENT_ID = "dev-mode-student";

export function isDashboardDevModeEnabled(): boolean {
  return process.env.DASHBOARD_DEV_MODE === "true";
}

export function buildMockDashboardReadModel(): DashboardReadModel {
  return {
    studentId: DASHBOARD_DEV_MODE_STUDENT_ID,
    welcome: {
      variant: "ready",
      firstName: "Diego",
      avatarUrl: null,
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    },
    goal: {
      currentLevel: "B1",
      targetLevel: "B2",
      targetExamDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 87).toISOString(),
      daysUntilExam: 87,
      overallPreparationPercentage: 42,
      estimatedPerformance: {
        finalScore: 12.5,
        percentage: 62,
        passed: false,
      },
    },
    plan: {
      hasActivePlan: true,
      weeklyRecommendedMinutes: 210,
      weeklyCompletedMinutes: 135,
      weeklyCompletionPercentage: 64,
      dailyGoalMinutes: 30,
      dailyCompletedMinutes: 18,
    },
    continuation: {
      available: true,
      submissionId: "dev-mode-submission",
      status: "DRAFT",
      lastDraftWordCount: 187,
      lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    recommendation: {
      available: true,
      recommendationId: "dev-mode-recommendation",
      text: "Travaille aujourd'hui la cohésion textuelle : tes derniers essais progressent en vocabulaire, mais perdent des points sur les connecteurs logiques.",
      priority: "HIGH",
    },
    evolution: {
      competencies: [
        { competencyId: "writing-quality", competencyName: "Qualité rédactionnelle", masteryPercentage: 58 },
        { competencyId: "organization", competencyName: "Organisation textuelle", masteryPercentage: 66 },
        { competencyId: "grammar", competencyName: "Grammaire", masteryPercentage: 49 },
        { competencyId: "cohesion", competencyName: "Cohésion", masteryPercentage: 41 },
        { competencyId: "vocabulary", competencyName: "Vocabulaire", masteryPercentage: 71 },
      ],
      studyFrequency: { studyTimeMinutes: 540, activeDays: 4 },
      performance: { averageScore: 12.5, successRate: 62 },
      analytics: {
        productivityIndex: 0.7,
        engagementIndex: 0.64,
        consistencyIndex: 0.55,
        progressionIndex: 0.48,
      },
      currentStreak: 4,
    },
    ecosystems: buildEcosystemLinks(),
    generatedAt: new Date().toISOString(),
  };
}
