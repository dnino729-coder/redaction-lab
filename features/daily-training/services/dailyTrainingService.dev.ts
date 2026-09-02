// Daily Training Service (modo desarrollo) — DAILY_TRAINING_DEV_MODE.
// Aislado a propósito: no importa Prisma, Redis, IA ni domain/application/
// infrastructure — mismo patrón que los demás services/*.dev.ts. Contenido
// pedagógico redactado primero en francés; actividades limitadas
// exclusivamente a producción escrita.
import type { DailyTrainingReadModel } from "../types";

export function isDailyTrainingDevModeEnabled(): boolean {
  return process.env.DAILY_TRAINING_DEV_MODE === "true";
}

export function buildMockDailyTrainingReadModel(): DailyTrainingReadModel {
  return {
    studentId: "dev-mode-student",
    summary: {
      currentStreak: 5,
      challengesCompletedToday: 0,
      challengesCompletedThisWeek: 4,
      dailyGoalPercentage: 0,
    },
    dailyChallenge: {
      id: "dc1",
      title: "Défi du jour — phrase de transition",
      prompt: "Rédige une phrase qui relie une opinion à un exemple concret, en utilisant « par exemple » ou « notamment ».",
      type: "SENTENCE",
      estimatedMinutes: 5,
      status: "PENDING",
    },
    quickDrills: {
      drills: [
        { id: "qd1", title: "Complète la phrase avec le bon connecteur", level: "EASY", estimatedMinutes: 3, completed: true },
        { id: "qd2", title: "Réécris la phrase au discours plus formel", level: "INTERMEDIATE", estimatedMinutes: 4, completed: false },
        { id: "qd3", title: "Rédige un paragraphe argumentatif court", level: "ADVANCED", estimatedMinutes: 8, completed: false },
      ],
    },
    history: {
      days: [
        { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), completed: true },
        { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), completed: true },
        { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), completed: true },
        { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), completed: true },
        { date: new Date().toISOString(), completed: false },
      ],
      weeklyStreak: 4,
    },
    focus: {
      items: [
        { category: "GRAMMAR", practiceFrequency: 62 },
        { category: "LEXICAL", practiceFrequency: 48 },
        { category: "COHESION", practiceFrequency: 35 },
        { category: "CONNECTORS", practiceFrequency: 70 },
        { category: "TEXT_ORGANIZATION", practiceFrequency: 40 },
      ],
    },
    goals: {
      dailyChallengeGoal: 1,
      weeklyMinutesGoal: 60,
      suggestedDailyChallengeGoal: 2,
    },
    generatedAt: new Date().toISOString(),
  };
}
