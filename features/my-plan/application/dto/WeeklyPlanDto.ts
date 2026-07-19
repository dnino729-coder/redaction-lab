// Read Model de `WeeklyPlan` (13.4) — ver ports/DailyPlanReadPort.ts para
// la justificación (misma resolución, aplicada aquí a WeeklyPlan).
export interface WeeklyPlanReadModel {
  readonly id: string;
  readonly learningPlanId: string;
  readonly weekNumber: number;
  readonly estimatedMinutes: number;
  readonly completedMinutes: number;
  readonly completionPercentage: number;
}

export interface GetWeeklyPlanRequestDto {
  readonly studentId: string;
  readonly weekNumber: number;
}
