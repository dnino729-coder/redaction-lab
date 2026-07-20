import type { LearningGoal } from "@/features/my-plan/domain/entities/LearningGoal";
import type { LearningGoalId } from "@/features/my-plan/domain/value-objects/LearningGoalId";
import type { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import type { LearningGoalRepository } from "@/features/my-plan/domain/repositories/LearningGoalRepository";

import { withActiveClient } from "../PrismaClientContext";
import { LearningGoalPersistenceMapper } from "../mappers/LearningGoalPersistenceMapper";
import { translatePrismaError } from "@/features/my-plan/infrastructure/exceptions/PrismaExceptionTranslator";

export class PrismaLearningGoalRepository implements LearningGoalRepository {
  public async findById(id: LearningGoalId): Promise<LearningGoal | null> {
    const row = await withActiveClient((client) =>
      client.learningGoal.findUnique({ where: { id: id.value } }),
    );
    return row ? LearningGoalPersistenceMapper.toDomain(row) : null;
  }

  public async findByLearningPlanId(learningPlanId: LearningPlanId): Promise<LearningGoal[]> {
    const rows = await withActiveClient((client) =>
      client.learningGoal.findMany({ where: { learningPlanId: learningPlanId.value } }),
    );
    return rows.map(LearningGoalPersistenceMapper.toDomain);
  }

  public async save(goal: LearningGoal): Promise<void> {
    const data = LearningGoalPersistenceMapper.toPersistenceData(goal);
    try {
      await withActiveClient((client) =>
        client.learningGoal.upsert({ where: { id: data.id }, create: data, update: data }),
      );
    } catch (error) {
      translatePrismaError(error, "LearningGoal", goal.id.value);
    }
  }
}
