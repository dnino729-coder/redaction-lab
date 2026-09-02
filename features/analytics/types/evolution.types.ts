// Tipos de la capa de presentación de Évolution (ruta real /analytics) — 6
// bloques (diseño pedagógico aprobado). Dashboard analítico: los 6 bloques
// coexisten siempre visibles, a diferencia de Simulator (sesión secuencial).

export interface EvolutionOverviewBlock {
  currentLevel: string | null;
  targetLevel: string | null;
  averageRecentScore: number;
  maxScore: number;
  strongestCompetency: string;
  weakestCompetency: string;
}

export type CompetencyCategory = "GRAMMAR" | "LEXICAL" | "COHESION" | "CONNECTORS" | "TEXT_ORGANIZATION";
export type CompetencyTrend = "UP" | "DOWN" | "STABLE";

export interface CompetencyEvolutionItem {
  category: CompetencyCategory;
  trend: CompetencyTrend;
  changePercentage: number;
}

export interface CompetencyEvolutionBlock {
  competencies: CompetencyEvolutionItem[];
}

export type ProductionTextType = "LETTER" | "ARTICLE" | "ESSAY" | "EMAIL" | "REPORT";
export type ProductionStatus = "EVALUATED" | "PENDING";

export interface ProductionHistoryItem {
  id: string;
  date: string;
  textType: ProductionTextType;
  score: number;
  maxScore: number;
  status: ProductionStatus;
}

export interface ProductionHistoryBlock {
  productions: ProductionHistoryItem[];
}

export interface RecurrentErrorItem {
  category: CompetencyCategory;
  description: string;
  frequencyPercentage: number;
}

export interface ErrorAnalysisBlock {
  errors: RecurrentErrorItem[];
}

export interface RecentAttemptScore {
  id: string;
  date: string;
  score: number;
  maxScore: number;
}

export interface PerformanceComparisonBlock {
  latestScore: number;
  bestScore: number;
  maxScore: number;
  recentAttempts: RecentAttemptScore[];
}

export type RecommendationPriority = "LOW" | "MEDIUM" | "HIGH";
export type RecommendationDestination = "LABORATORY" | "DAILY_TRAINING";

export interface PersonalizedRecommendationBlock {
  mainWeakness: string;
  priority: RecommendationPriority;
  nextAction: string;
  destination: RecommendationDestination;
}

export interface EvolutionReadModel {
  studentId: string;
  overview: EvolutionOverviewBlock;
  competencies: CompetencyEvolutionBlock;
  productions: ProductionHistoryBlock;
  errors: ErrorAnalysisBlock;
  performance: PerformanceComparisonBlock;
  recommendations: PersonalizedRecommendationBlock;
  generatedAt: string;
}
