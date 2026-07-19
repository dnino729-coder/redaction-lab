// Read Model de `LearningProgress` (13.4) — ver ports/DailyPlanReadPort.ts
// para la justificación (misma resolución, aplicada aquí a
// LearningProgress).
export interface LearningProgressReadModel {
  readonly id: string;
  readonly learningPlanId: string;
  readonly completedTasks: number;
  readonly totalTasks: number;
  readonly completionPercentage: number;
  readonly currentStreak: number;
  readonly updatedAt: string;
}

export interface GetLearningProgressRequestDto {
  readonly studentId: string;
}
