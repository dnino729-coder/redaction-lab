import type { LearningProgressReadPort } from "@/features/my-plan/application/ports/LearningProgressReadPort";
import type { LearningProgressReadModel } from "@/features/my-plan/application/dto/LearningProgressDto";
import { withActiveClient } from "../persistence/PrismaClientContext";

export class PrismaLearningProgressReadPort implements LearningProgressReadPort {
  public async findByLearningPlanId(learningPlanId: string): Promise<LearningProgressReadModel | null> {
    const row = await withActiveClient((client) =>
      client.learningProgress.findFirst({ where: { learningPlanId } }),
    );
    if (!row) return null;

    return {
      id: row.id,
      learningPlanId: row.learningPlanId,
      completedTasks: row.completedTasks,
      totalTasks: row.totalTasks,
      completionPercentage: row.completionPercentage.toNumber(),
      currentStreak: row.currentStreak,
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
