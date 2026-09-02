// Tipos de la capa de presentación de Mi Plan — docs/modules/mi-plan.md,
// Vacío 1 (5 bloques de información). Modela 1:1 los mismos conceptos que
// domain/ (LearningGoal, LearningPhase, LearningTask, StudySession,
// StudySchedule) pero como un read-model plano para UI, sin importar nada
// de domain/application/infrastructure — misma separación que
// DashboardReadModel frente a los repositorios de Dashboard.

export interface PlanSummaryBlock {
  currentLevel: string | null;
  targetLevel: string | null;
  targetExamDate: string | null;
  daysUntilExam: number | null;
  totalStudyHours: number;
  recommendedWeeklyHours: number;
  completionPercentage: number;
}

export interface DailyPlanItem {
  id: string;
  title: string;
  estimatedMinutes: number;
  completed: boolean;
}

export interface WeeklyPlanDay {
  date: string;
  label: string;
  items: DailyPlanItem[];
}

export interface TrainingCalendarBlock {
  daily: DailyPlanItem[];
  weekly: WeeklyPlanDay[];
}

export type LearningGoalStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type GoalPriority = "LOW" | "MEDIUM" | "HIGH";

export interface LearningGoalItem {
  id: string;
  title: string;
  priority: GoalPriority;
  status: LearningGoalStatus;
}

export interface GoalsBlock {
  active: LearningGoalItem[];
  completed: LearningGoalItem[];
}

export interface StudySessionItem {
  id: string;
  date: string;
  durationMinutes: number;
  completed: boolean;
}

export type LearningTaskSource = "SELF_DIRECTED" | "ACADEMY" | "LABORATORY" | "DAILY_TRAINING" | "SIMULATOR";

export interface LearningTaskItem {
  id: string;
  title: string;
  status: LearningGoalStatus;
  source: LearningTaskSource;
  sessions: StudySessionItem[];
}

export interface LearningPhaseItem {
  id: string;
  title: string;
  status: LearningGoalStatus;
  tasks: LearningTaskItem[];
}

export interface PhasesBlock {
  phases: LearningPhaseItem[];
}

export interface StudyScheduleBlock {
  daysPerWeek: number;
  sessionsPerDay: number;
  minutesPerSession: number;
  reminderTime: string | null;
  preferences: string[];
}

export interface MyPlanReadModel {
  studentId: string;
  hasActivePlan: boolean;
  summary: PlanSummaryBlock;
  calendar: TrainingCalendarBlock;
  goals: GoalsBlock;
  phases: PhasesBlock;
  configuration: StudyScheduleBlock;
  generatedAt: string;
}
