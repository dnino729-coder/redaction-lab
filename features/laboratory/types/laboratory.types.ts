// Tipos de la capa de presentación de Laboratorio — 6 bloques (Fase 2/3
// aprobadas). Read-model plano para UI, sin importar domain/application/
// infrastructure — misma separación que MyPlanReadModel/DashboardReadModel.

export interface LabSummaryBlock {
  currentLevel: string | null;
  targetLevel: string | null;
  textsCompleted: number;
  currentStreak: number;
  lastTextType: string | null;
  completionPercentage: number;
}

export type ModelTextType = "LETTER" | "ARTICLE" | "ESSAY" | "EMAIL" | "REPORT";

export interface ModelTextItem {
  id: string;
  title: string;
  textType: ModelTextType;
  read: boolean;
}

export interface ModelAnalysisBlock {
  models: ModelTextItem[];
}

export type WritingExerciseMode = "GUIDED" | "AUTONOMOUS";
export type WritingExerciseStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface WritingExerciseItem {
  id: string;
  title: string;
  mode: WritingExerciseMode;
  textType: ModelTextType;
  status: WritingExerciseStatus;
  wordCount: number | null;
}

export interface WritingWorkshopBlock {
  exercises: WritingExerciseItem[];
}

export type FeedbackCategory = "GRAMMAR" | "LEXICAL" | "COHESION" | "STRUCTURE";

export interface FeedbackItem {
  id: string;
  exerciseTitle: string;
  category: FeedbackCategory;
  comment: string;
  reviewed: boolean;
}

export interface FeedbackBlock {
  items: FeedbackItem[];
}

export type RevisionTopicType = "GRAMMAR" | "LEXICAL";

export interface RevisionTopicItem {
  id: string;
  title: string;
  type: RevisionTopicType;
  masteryPercentage: number;
}

export interface RevisionBlock {
  topics: RevisionTopicItem[];
}

export interface SelfAssessmentCriterion {
  label: string;
  met: boolean;
}

export interface SelfAssessmentItem {
  id: string;
  date: string;
  exerciseTitle: string;
  criteria: SelfAssessmentCriterion[];
}

export interface SelfAssessmentBlock {
  history: SelfAssessmentItem[];
}

export interface LaboratoryReadModel {
  studentId: string;
  summary: LabSummaryBlock;
  modelAnalysis: ModelAnalysisBlock;
  writingWorkshop: WritingWorkshopBlock;
  feedback: FeedbackBlock;
  revision: RevisionBlock;
  selfAssessment: SelfAssessmentBlock;
  generatedAt: string;
}
