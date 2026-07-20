import type { LearningObjective } from "@/features/my-plan/domain/entities/LearningObjective";
import type { LearningObjectiveId } from "@/features/my-plan/domain/value-objects/LearningObjectiveId";
import type { LearningGoalId } from "@/features/my-plan/domain/value-objects/LearningGoalId";
import type { LearningObjectiveRepository } from "@/features/my-plan/domain/repositories/LearningObjectiveRepository";

import { withActiveClient } from "../PrismaClientContext";
import { LearningObjectivePersistenceMapper } from "../mappers/LearningObjectivePersistenceMapper";
import { translatePrismaError } from "@/features/my-plan/infrastructure/exceptions/PrismaExceptionTranslator";

export class PrismaLearningObjectiveRepository implements LearningObjectiveRepository {
  public async findById(id: LearningObjectiveId): Promise<LearningObjective | null> {
    const row = await withActiveClient((client) =>
      client.learningObjective.findUnique({ where: { id: id.value } }),
    );
    return row ? LearningObjectivePersistenceMapper.toDomain(row) : null;
  }

  public async findByLearningGoalId(learningGoalId: LearningGoalId): Promise<LearningObjective[]> {
    const rows = await withActiveClient((client) =>
      client.learningObjective.findMany({ where: { learningGoalId: learningGoalId.value } }),
    );
    return rows.map(LearningObjectivePersistenceMapper.toDomain);
  }

  public async save(objective: LearningObjective): Promise<void> {
    const data = LearningObjectivePersistenceMapper.toPersistenceData(objective);
    try {
      await withActiveClient((client) =>
        client.learningObjective.upsert({ where: { id: data.id }, create: data, update: data }),
      );
    } catch (error) {
      translatePrismaError(error, "LearningObjective", objective.id.value);
    }
  }
}
