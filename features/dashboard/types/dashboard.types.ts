// Tipos del módulo Dashboard — docs/modules/dashboard.md, secciones 2 y 6.
// `DashboardReadModel` es el único contrato que consumen los componentes de
// presentación (features/dashboard/components); nunca reciben tipos crudos
// de Prisma ni de los repositorios de database/.

/**
 * Variantes del mensaje de bienvenida (bloque 1) — tabla de tono por
 * situación (2.3). `progress-improved`, `high-score` y `struggling` son
 * juicios pedagógicos que decide el Motor Pedagógico Adaptativo (9.7, no
 * implementado en esta fase — "el Dashboard no decide la lógica, solo
 * renderiza la variante indicada"); el Dashboard Service solo calcula por sí
 * mismo las variantes estructurales: `empty-first-visit` (sin historial) y
 * `reactivation` (inactividad prolongada, hecho temporal objetivo, no un
 * juicio pedagógico).
 */
export type WelcomeVariant =
  | "empty-first-visit"
  | "reactivation"
  | "progress-improved"
  | "high-score"
  | "struggling"
  | "ready";

export interface WelcomeBlock {
  variant: WelcomeVariant;
  firstName: string;
  avatarUrl: string | null;
  lastLoginAt: string | null;
}

export interface GoalBlock {
  currentLevel: string | null;
  targetLevel: string | null;
  targetExamDate: string | null;
  daysUntilExam: number | null;
  overallPreparationPercentage: number | null;
  estimatedPerformance: {
    finalScore: number;
    percentage: number;
    passed: boolean;
  } | null;
}

export interface PlanSummaryBlock {
  hasActivePlan: boolean;
  weeklyRecommendedMinutes: number | null;
  weeklyCompletedMinutes: number | null;
  weeklyCompletionPercentage: number | null;
  dailyGoalMinutes: number | null;
  dailyCompletedMinutes: number | null;
}

export interface ContinuationBlock {
  available: boolean;
  submissionId: string | null;
  status: string | null;
  lastDraftWordCount: number | null;
  lastActivityAt: string | null;
}

export interface RecommendationBlock {
  available: boolean;
  recommendationId: string | null;
  text: string | null;
  priority: string | null;
}

export interface EvolutionBlock {
  competencies: Array<{ competencyId: string; competencyName: string; masteryPercentage: number }>;
  studyFrequency: { studyTimeMinutes: number; activeDays: number } | null;
  performance: { averageScore: number; successRate: number } | null;
  analytics: {
    productivityIndex: number;
    engagementIndex: number;
    consistencyIndex: number;
    progressionIndex: number;
  } | null;
  currentStreak: number;
}

export interface EcosystemLink {
  key: string;
  href: string;
}

export interface DashboardReadModel {
  studentId: string;
  welcome: WelcomeBlock;
  goal: GoalBlock;
  plan: PlanSummaryBlock;
  continuation: ContinuationBlock;
  recommendation: RecommendationBlock;
  evolution: EvolutionBlock;
  ecosystems: EcosystemLink[];
  generatedAt: string;
}

/** Estados de carga de la vista completa (sección 6, tabla de estados). */
export type DashboardViewState = "loading" | "ready" | "error" | "stale-refreshing";
