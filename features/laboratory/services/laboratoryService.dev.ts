// Laboratory Service (modo desarrollo) — LABORATORY_DEV_MODE. Aislado a
// propósito: no importa Prisma, Redis, IA ni domain/application/
// infrastructure, solo construye un LaboratoryReadModel simulado en
// memoria — mismo patrón que myPlanService.dev.ts/dashboardService.dev.ts.
// Contenido pedagógico redactado primero en francés (regla pedagógica
// global de Redaction Lab); actividades limitadas exclusivamente a
// producción escrita — nunca comprensión oral/escrita ni producción oral.
import type { LaboratoryReadModel } from "../types";

export function isLaboratoryDevModeEnabled(): boolean {
  return process.env.LABORATORY_DEV_MODE === "true";
}

export function buildMockLaboratoryReadModel(): LaboratoryReadModel {
  return {
    studentId: "dev-mode-student",
    summary: {
      currentLevel: "B1",
      targetLevel: "B2",
      textsCompleted: 6,
      currentStreak: 3,
      lastTextType: "LETTER",
      completionPercentage: 38,
    },
    modelAnalysis: {
      models: [
        { id: "m1", title: "Lettre formelle — demande de renseignements", textType: "LETTER", read: true },
        { id: "m2", title: "Article — les réseaux sociaux au travail", textType: "ARTICLE", read: true },
        { id: "m3", title: "Essai argumentatif — le télétravail", textType: "ESSAY", read: false },
        { id: "m4", title: "Courriel professionnel — réclamation", textType: "EMAIL", read: false },
      ],
    },
    writingWorkshop: {
      exercises: [
        { id: "w1", title: "Lettre formelle guidée — réclamation", mode: "GUIDED", textType: "LETTER", status: "COMPLETED", wordCount: 210 },
        { id: "w2", title: "Article guidé — les réseaux sociaux", mode: "GUIDED", textType: "ARTICLE", status: "IN_PROGRESS", wordCount: 95 },
        { id: "w3", title: "Essai autonome — le télétravail", mode: "AUTONOMOUS", textType: "ESSAY", status: "NOT_STARTED", wordCount: null },
      ],
    },
    feedback: {
      items: [
        {
          id: "f1",
          exerciseTitle: "Lettre formelle guidée — réclamation",
          category: "GRAMMAR",
          comment: "Attention à l'accord du participe passé avec avoir : « les documents que j'ai envoyé » → « envoyés ».",
          reviewed: true,
        },
        {
          id: "f2",
          exerciseTitle: "Lettre formelle guidée — réclamation",
          category: "COHESION",
          comment: "Utilise davantage de connecteurs logiques entre les paragraphes (« par ailleurs », « en outre »).",
          reviewed: false,
        },
      ],
    },
    revision: {
      topics: [
        { id: "r1", title: "Accord du participe passé", type: "GRAMMAR", masteryPercentage: 55 },
        { id: "r2", title: "Connecteurs logiques", type: "GRAMMAR", masteryPercentage: 40 },
        { id: "r3", title: "Vocabulaire de la réclamation", type: "LEXICAL", masteryPercentage: 70 },
      ],
    },
    selfAssessment: {
      history: [
        {
          id: "sa1",
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          exerciseTitle: "Lettre formelle guidée — réclamation",
          criteria: [
            { label: "Structure claire (introduction, corps, conclusion)", met: true },
            { label: "Registre formel respecté", met: true },
            { label: "Connecteurs logiques utilisés", met: false },
          ],
        },
      ],
    },
    generatedAt: new Date().toISOString(),
  };
}
