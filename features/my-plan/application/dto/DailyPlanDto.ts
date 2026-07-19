// Read Model de `DailyPlan` (13.4) — ver ports/DailyPlanReadPort.ts para
// la justificación de por qué esta consulta no pasa por el Domain Layer.
export interface DailyPlanReadModel {
  readonly id: string;
  readonly learningPlanId: string;
  readonly planDate: string;
  readonly estimatedMinutes: number;
  readonly completedMinutes: number;
  readonly completionPercentage: number;
}

export interface GetDailyPlanRequestDto {
  readonly studentId: string;
  readonly date: string;
}
