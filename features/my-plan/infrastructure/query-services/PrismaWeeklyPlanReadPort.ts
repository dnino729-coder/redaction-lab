import type { WeeklyPlanReadPort } from "@/features/my-plan/application/ports/WeeklyPlanReadPort";
import type { WeeklyPlanReadModel } from "@/features/my-plan/application/dto/WeeklyPlanDto";
import { withActiveClient } from "../persistence/PrismaClientContext";

export class PrismaWeeklyPlanReadPort implements WeeklyPlanReadPort {
  public async findByLearningPlanIdAndWeekNumber(
    learningPlanId: string,
    weekNumber: number,
  ): Promise<WeeklyPlanReadModel | null> {
    const row = await withActiveClient((client) =>
      client.weeklyPlan.findFirst({ where: { learningPlanId, weekNumber } }),
    );
    if (!row) return null;

    return {
      id: row.id,
      learningPlanId: row.learningPlanId,
      weekNumber: row.weekNumber,
      estimatedMinutes: row.estimatedMinutes,
      completedMinutes: row.completedMinutes,
      completionPercentage: row.completionPercentage.toNumber(),
    };
  }
}
