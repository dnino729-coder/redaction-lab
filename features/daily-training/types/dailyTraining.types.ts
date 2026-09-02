// Tipos de la capa de presentación de Entrenamiento — 6 bloques (diseño
// pedagógico aprobado). Read-model plano para UI, sin importar domain/
// application/infrastructure — misma separación que los demás módulos.

export interface TrainingSummaryBlock {
  currentStreak: number;
  challengesCompletedToday: number;
  challengesCompletedThisWeek: number;
  dailyGoalPercentage: number;
}

export type ChallengeType = "SENTENCE" | "PARAGRAPH" | "TIMED_SHORT_TEXT";
export type ChallengeStatus = "PENDING" | "COMPLETED";

export interface DailyChallengeBlock {
  id: string;
  title: string;
  prompt: string;
  type: ChallengeType;
  estimatedMinutes: number;
  status: ChallengeStatus;
}

export type DrillLevel = "EASY" | "INTERMEDIATE" | "ADVANCED";

export interface QuickDrillItem {
  id: string;
  title: string;
  level: DrillLevel;
  estimatedMinutes: number;
  completed: boolean;
}

export interface QuickDrillsBlock {
  drills: QuickDrillItem[];
}

export interface ChallengeHistoryDay {
  date: string;
  completed: boolean;
}

export interface ChallengeHistoryBlock {
  days: ChallengeHistoryDay[];
  weeklyStreak: number;
}

export type TrainingFocusCategory = "GRAMMAR" | "LEXICAL" | "COHESION" | "CONNECTORS" | "TEXT_ORGANIZATION";

export interface TrainingFocusItem {
  category: TrainingFocusCategory;
  practiceFrequency: number;
}

export interface TrainingFocusBlock {
  items: TrainingFocusItem[];
}

export interface TrainingGoalsBlock {
  dailyChallengeGoal: number;
  weeklyMinutesGoal: number;
  suggestedDailyChallengeGoal: number;
}

export interface DailyTrainingReadModel {
  studentId: string;
  summary: TrainingSummaryBlock;
  dailyChallenge: DailyChallengeBlock;
  quickDrills: QuickDrillsBlock;
  history: ChallengeHistoryBlock;
  focus: TrainingFocusBlock;
  goals: TrainingGoalsBlock;
  generatedAt: string;
}
