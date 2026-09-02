// Tipos de la capa de presentación de Simulador — diseño pedagógico
// aprobado. A diferencia de los demás módulos, SimulatorReadModel modela
// una SESIÓN de examen (currentStep decide qué pantalla se muestra), no un
// dashboard de bloques simultáneos.

export type SimulatorStep =
  | "SUBJECT_SELECTION"
  | "PROMPT"
  | "PLANNING"
  | "WRITING"
  | "SUBMISSION"
  | "EVALUATION"
  | "ANALYSIS";

export type ExamTextType = "LETTER" | "ARTICLE" | "ESSAY" | "EMAIL" | "REPORT";

export interface ExamAttemptHistoryItem {
  id: string;
  date: string;
  textType: ExamTextType;
  score: number;
  maxScore: number;
}

export interface SimulatorOverviewBlock {
  attemptsCompleted: number;
  bestScore: number;
  maxScore: number;
  history: ExamAttemptHistoryItem[];
}

export interface ExamSubjectItem {
  id: string;
  title: string;
  textType: ExamTextType;
  durationMinutes: number;
  minWords: number;
  maxWords: number;
}

export interface SubjectSelectionBlock {
  subjects: ExamSubjectItem[];
}

export interface ExamPromptBlock {
  subjectId: string;
  title: string;
  instructions: string;
  textType: ExamTextType;
  minWords: number;
  maxWords: number;
  totalMinutes: number;
}

export interface PlanningBlock {
  recommendedMinutes: number;
  notes: string;
}

export interface WritingBlock {
  content: string;
  wordCount: number;
  remainingMinutes: number;
  totalMinutes: number;
}

export interface SubmissionBlock {
  wordCount: number;
  minutesUsed: number;
  totalMinutes: number;
  submittedAt: string | null;
}

export interface EvaluationCriterionScore {
  criterion: string;
  score: number;
  maxScore: number;
}

export interface EvaluationBlock {
  totalScore: number;
  maxScore: number;
  criteria: EvaluationCriterionScore[];
}

export interface RubricLevelDetail {
  criterion: string;
  levelAchieved: string;
  comment: string;
}

export interface AnalysisBlock {
  rubricDetails: RubricLevelDetail[];
  previousBestScore: number | null;
  maxScore: number;
}

export interface SimulatorReadModel {
  studentId: string;
  currentStep: SimulatorStep;
  overview: SimulatorOverviewBlock;
  subjectSelection: SubjectSelectionBlock;
  prompt: ExamPromptBlock;
  planning: PlanningBlock;
  writing: WritingBlock;
  submission: SubmissionBlock;
  evaluation: EvaluationBlock;
  analysis: AnalysisBlock;
  generatedAt: string;
}
