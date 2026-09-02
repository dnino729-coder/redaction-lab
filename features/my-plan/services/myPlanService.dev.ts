// Mi Plan Service (modo desarrollo) — MY_PLAN_DEV_MODE. Aislado a propósito:
// no importa Prisma, Redis, IA ni nada de domain/application/infrastructure,
// solo construye un MyPlanReadModel simulado en memoria — mismo patrón que
// features/dashboard/services/dashboardService.dev.ts.
import type { MyPlanReadModel } from "../types";

export function isMyPlanDevModeEnabled(): boolean {
  return process.env.MY_PLAN_DEV_MODE === "true";
}

export function buildMockMyPlanReadModel(): MyPlanReadModel {
  return {
    studentId: "dev-mode-student",
    hasActivePlan: true,
    summary: {
      currentLevel: "B1",
      targetLevel: "B2",
      targetExamDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 87).toISOString(),
      daysUntilExam: 87,
      totalStudyHours: 42.5,
      recommendedWeeklyHours: 3.5,
      completionPercentage: 42,
    },
    calendar: {
      daily: [
        { id: "d1", title: "Analyse d'un modèle — lettre formelle", estimatedMinutes: 20, completed: true },
        { id: "d2", title: "Production guidée — lettre formelle", estimatedMinutes: 30, completed: false },
      ],
      weekly: [
        { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), label: "Lundi", items: [
          { id: "w1", title: "Révision grammaticale", estimatedMinutes: 15, completed: true },
        ] },
        { date: new Date().toISOString(), label: "Mardi", items: [
          { id: "w2", title: "Production guidée — lettre formelle", estimatedMinutes: 30, completed: false },
        ] },
        { date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(), label: "Mercredi", items: [
          { id: "w3", title: "Autoévaluation", estimatedMinutes: 20, completed: false },
        ] },
      ],
    },
    goals: {
      active: [
        { id: "g1", title: "Maîtriser la lettre formelle", priority: "HIGH", status: "IN_PROGRESS" },
        { id: "g2", title: "Enrichir le vocabulaire d'opinion", priority: "MEDIUM", status: "NOT_STARTED" },
      ],
      completed: [
        { id: "g3", title: "Reconnaître les temps du subjonctif", priority: "MEDIUM", status: "COMPLETED" },
      ],
    },
    phases: {
      phases: [
        {
          id: "ph1",
          title: "Phase 1 — Fondamentaux de la lettre formelle",
          status: "COMPLETED",
          tasks: [
            {
              id: "t1",
              title: "Structure d'une lettre formelle",
              status: "COMPLETED",
              source: "SELF_DIRECTED",
              sessions: [
                { id: "s1", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), durationMinutes: 25, completed: true },
              ],
            },
          ],
        },
        {
          id: "ph2",
          title: "Phase 2 — Argumentation écrite",
          status: "IN_PROGRESS",
          tasks: [
            {
              id: "t2",
              title: "Révision grammaticale — connecteurs logiques",
              status: "IN_PROGRESS",
              source: "ACADEMY",
              sessions: [
                { id: "s2", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), durationMinutes: 30, completed: true },
              ],
            },
            {
              id: "t3",
              title: "Production guidée — lettre formelle",
              status: "NOT_STARTED",
              source: "SELF_DIRECTED",
              sessions: [],
            },
          ],
        },
      ],
    },
    configuration: {
      daysPerWeek: 5,
      sessionsPerDay: 1,
      minutesPerSession: 30,
      reminderTime: "19:00",
      preferences: ["Pas de séances tôt le matin", "Week-ends allégés"],
    },
    generatedAt: new Date().toISOString(),
  };
}
