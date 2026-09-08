export interface LearningGoalResponseDto {
  readonly id: string;
  readonly learningPlanId: string;
  readonly title: string;
  readonly description: string | null;
  readonly priority: string;
  readonly targetDate: string | null;
  readonly completedAt: string | null;
  readonly status: string;
}

// Read Model de `GetLearningGoals` (vertical slice "connect goals and
// objectives") — deliberadamente más delgado que `LearningGoalResponseDto`
// (que expone el goal completo, usado hoy solo internamente por
// `CreateLearningPlanHandler`/`LearningPlanMapper`): la UI real de
// `GoalsAndObjectives.tsx` únicamente necesita id/title/priority/status
// (nunca `description`/`targetDate`/`completedAt`/`learningPlanId`), así
// que no se reutiliza el DTO completo para no exponer datos innecesarios.
export interface LearningGoalSummaryDto {
  readonly id: string;
  readonly title: string;
  readonly priority: string;
  readonly status: string;
}

// `active`/`completed` — ver GetLearningGoalsHandler para la regla exacta
// de clasificación (excluye CANCELLED de ambos grupos, mismo criterio que
// AutoCompletionStatusCalculator ya aplica en el dominio).
export interface LearningGoalsReadModel {
  readonly active: readonly LearningGoalSummaryDto[];
  readonly completed: readonly LearningGoalSummaryDto[];
}

export interface GetLearningGoalsRequestDto {
  readonly studentId: string;
}
