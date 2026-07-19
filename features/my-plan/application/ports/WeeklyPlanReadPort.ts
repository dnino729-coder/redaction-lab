// Puerto de lectura (CQRS) — `WeeklyPlan` (13.4). Ver justificación
// completa en ports/DailyPlanReadPort.ts (misma ambigüedad, misma
// resolución).
import type { WeeklyPlanReadModel } from "../dto/WeeklyPlanDto";

export interface WeeklyPlanReadPort {
  findByLearningPlanIdAndWeekNumber(
    learningPlanId: string,
    weekNumber: number,
  ): Promise<WeeklyPlanReadModel | null>;
}
