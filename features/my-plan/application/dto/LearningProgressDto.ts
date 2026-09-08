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

// Input del lado de escritura (ports/LearningProgressWritePort.ts) —
// deliberadamente sin `id`/`updatedAt` (los asigna la propia fila de
// Postgres, `gen_random_uuid()`/`@updatedAt`) y sin `studentId` (el
// llamante ya resolvió y verificó `learningPlanId`, ver
// GenerateInitialPlanStructureHandler.ts/CompleteLearningTaskHandler.ts).
export interface LearningProgressWriteInputDto {
  readonly learningPlanId: string;
  readonly completedTasks: number;
  readonly totalTasks: number;
  readonly completionPercentage: number;
  readonly currentStreak: number;
}
