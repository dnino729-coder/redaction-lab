// Simulator Service (modo desarrollo) — SIMULATOR_DEV_MODE. Aislado a
// propósito: sin Prisma, Redis, IA ni llamadas HTTP — solo construye un
// SimulatorReadModel simulado en memoria, mismo patrón que los demás
// services/*.dev.ts. Representa un único intento YA COMPLETADO (no una
// máquina de estados funcional) para poder validar visualmente las 7
// pantallas a partir del mismo conjunto de datos. Contenido pedagógico
// redactado primero en francés; producción escrita DELF B2 exclusivamente.
import type { SimulatorReadModel, SimulatorStep } from "../types";

export function isSimulatorDevModeEnabled(): boolean {
  return process.env.SIMULATOR_DEV_MODE === "true";
}

const DEFAULT_STEP: SimulatorStep = "ANALYSIS";

export function buildMockSimulatorReadModel(step?: SimulatorStep): SimulatorReadModel {
  return {
    studentId: "dev-mode-student",
    currentStep: step ?? DEFAULT_STEP,
    overview: {
      attemptsCompleted: 3,
      bestScore: 15.5,
      maxScore: 25,
      history: [
        { id: "h1", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), textType: "LETTER", score: 12, maxScore: 25 },
        { id: "h2", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), textType: "ARTICLE", score: 14, maxScore: 25 },
        { id: "h3", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), textType: "ESSAY", score: 15.5, maxScore: 25 },
      ],
    },
    subjectSelection: {
      subjects: [
        { id: "sub1", title: "Essai argumentatif — le télétravail", textType: "ESSAY", durationMinutes: 60, minWords: 220, maxWords: 250 },
        { id: "sub2", title: "Lettre formelle — réclamation", textType: "LETTER", durationMinutes: 60, minWords: 200, maxWords: 250 },
        { id: "sub3", title: "Article — les réseaux sociaux au travail", textType: "ARTICLE", durationMinutes: 60, minWords: 220, maxWords: 250 },
      ],
    },
    prompt: {
      subjectId: "sub1",
      title: "Essai argumentatif — le télétravail",
      instructions:
        "Vous avez lu un article sur la généralisation du télétravail. Rédigez un essai argumentatif (220 à 250 mots) dans lequel vous exposez les avantages et les inconvénients du télétravail, puis donnez votre opinion personnelle.",
      textType: "ESSAY",
      minWords: 220,
      maxWords: 250,
      totalMinutes: 60,
    },
    planning: {
      recommendedMinutes: 10,
      notes: "Introduction : contexte du télétravail.\nArgument 1 : flexibilité, gain de temps.\nArgument 2 : isolement, difficulté à séparer vie pro/perso.\nConclusion : opinion personnelle nuancée.",
    },
    writing: {
      content:
        "Depuis quelques années, le télétravail s'est largement développé, notamment depuis la crise sanitaire. Cette évolution présente plusieurs avantages, mais elle soulève également des questions importantes.\n\nD'une part, le télétravail offre une plus grande flexibilité aux salariés, qui peuvent mieux organiser leur emploi du temps et éviter les trajets quotidiens. Par ailleurs, cela permet souvent de réduire le stress lié aux transports.\n\nD'autre part, cette pratique peut entraîner un sentiment d'isolement et rendre plus difficile la séparation entre vie professionnelle et vie personnelle. En outre, la communication avec les collègues devient parfois plus compliquée.\n\nEn conclusion, je pense que le télétravail est une avancée positive, à condition qu'il soit encadré par des règles claires afin d'en limiter les effets négatifs.",
      wordCount: 132,
      remainingMinutes: 0,
      totalMinutes: 60,
    },
    submission: {
      wordCount: 132,
      minutesUsed: 58,
      totalMinutes: 60,
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    evaluation: {
      totalScore: 15.5,
      maxScore: 25,
      criteria: [
        { criterion: "Adéquation au sujet", score: 4, maxScore: 5 },
        { criterion: "Cohérence et cohésion", score: 3, maxScore: 5 },
        { criterion: "Richesse lexicale", score: 3.5, maxScore: 5 },
        { criterion: "Correction grammaticale", score: 3, maxScore: 5 },
        { criterion: "Respect de la consigne", score: 2, maxScore: 5 },
      ],
    },
    analysis: {
      rubricDetails: [
        {
          criterion: "Adéquation au sujet",
          levelAchieved: "B2",
          comment: "Le sujet est bien traité, avec des arguments pertinents et une opinion clairement exprimée.",
        },
        {
          criterion: "Cohérence et cohésion",
          levelAchieved: "B1+",
          comment: "Bon usage des connecteurs logiques, mais la transition entre le deuxième argument et la conclusion pourrait être plus fluide.",
        },
        {
          criterion: "Richesse lexicale",
          levelAchieved: "B2",
          comment: "Vocabulaire varié et adapté au registre formel attendu.",
        },
        {
          criterion: "Correction grammaticale",
          levelAchieved: "B1+",
          comment: "Quelques erreurs mineures d'accord, sans gêner la compréhension.",
        },
        {
          criterion: "Respect de la consigne",
          levelAchieved: "B1",
          comment: "Le texte est légèrement en dessous du nombre de mots minimum recommandé (132 sur 220-250).",
        },
      ],
      previousBestScore: 14,
      maxScore: 25,
    },
    generatedAt: new Date().toISOString(),
  };
}
