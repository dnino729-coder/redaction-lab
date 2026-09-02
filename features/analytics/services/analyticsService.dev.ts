// Evolution Service (modo desarrollo) — ANALYTICS_DEV_MODE. Aislado a
// propósito: sin Prisma, Redis, IA ni llamadas HTTP — solo construye un
// EvolutionReadModel simulado en memoria, mismo patrón que los demás
// services/*.dev.ts. Contenido pedagógico redactado primero en francés;
// producción escrita DELF B2 exclusivamente.
import type { EvolutionReadModel } from "../types";

export function isAnalyticsDevModeEnabled(): boolean {
  return process.env.ANALYTICS_DEV_MODE === "true";
}

export function buildMockEvolutionReadModel(): EvolutionReadModel {
  return {
    studentId: "dev-mode-student",
    overview: {
      currentLevel: "B1",
      targetLevel: "B2",
      averageRecentScore: 14.3,
      maxScore: 25,
      strongestCompetency: "Vocabulaire",
      weakestCompetency: "Respect de la consigne",
    },
    competencies: {
      competencies: [
        { category: "GRAMMAR", trend: "UP", changePercentage: 8 },
        { category: "LEXICAL", trend: "UP", changePercentage: 12 },
        { category: "COHESION", trend: "STABLE", changePercentage: 0 },
        { category: "CONNECTORS", trend: "DOWN", changePercentage: -5 },
        { category: "TEXT_ORGANIZATION", trend: "UP", changePercentage: 4 },
      ],
    },
    productions: {
      productions: [
        { id: "p1", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), textType: "LETTER", score: 12, maxScore: 25, status: "EVALUATED" },
        { id: "p2", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), textType: "ARTICLE", score: 14, maxScore: 25, status: "EVALUATED" },
        { id: "p3", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), textType: "ESSAY", score: 15.5, maxScore: 25, status: "EVALUATED" },
        { id: "p4", date: new Date().toISOString(), textType: "EMAIL", score: 0, maxScore: 25, status: "PENDING" },
      ],
    },
    errors: {
      errors: [
        { category: "GRAMMAR", description: "Accord du participe passé avec l'auxiliaire avoir", frequencyPercentage: 45 },
        { category: "CONNECTORS", description: "Répétition du connecteur « et » au lieu de varier (« par ailleurs », « en outre »)", frequencyPercentage: 38 },
        { category: "TEXT_ORGANIZATION", description: "Absence de paragraphe de conclusion distinct", frequencyPercentage: 22 },
      ],
    },
    performance: {
      latestScore: 15.5,
      bestScore: 15.5,
      maxScore: 25,
      recentAttempts: [
        { id: "a1", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), score: 12, maxScore: 25 },
        { id: "a2", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), score: 14, maxScore: 25 },
        { id: "a3", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), score: 15.5, maxScore: 25 },
      ],
    },
    recommendations: {
      mainWeakness: "Respect de la consigne (longueur et structure attendues)",
      priority: "HIGH",
      nextAction: "Reprends l'atelier d'écriture guidée sur la lettre formelle pour t'entraîner à respecter le nombre de mots imposé.",
      destination: "LABORATORY",
    },
    generatedAt: new Date().toISOString(),
  };
}
