// ENUM de dominio — resolución 18.21, punto 1. Valores idénticos para
// LearningGoalStatus/LearningObjectiveStatus/LearningPhaseStatus/
// LearningTaskStatus por coherencia (13.13: "mantener una única convención
// en todo el proyecto"), pero modelado como tipo TypeScript propio de
// LearningObjectiveStatus para no permitir mezclar estados entre entidades distintas.
// Vocabulario reutilizado de ExamAttemptStatus/LearningPlanStatus (18.21).
export const LearningObjectiveStatus = {
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type LearningObjectiveStatus = (typeof LearningObjectiveStatus)[keyof typeof LearningObjectiveStatus];
