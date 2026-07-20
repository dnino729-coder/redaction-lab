import type { LearningTask } from "@/features/my-plan/domain/entities/LearningTask";
import type { LearningTaskId } from "@/features/my-plan/domain/value-objects/LearningTaskId";
import type { LearningPhaseId } from "@/features/my-plan/domain/value-objects/LearningPhaseId";
import type { LearningTaskRepository } from "@/features/my-plan/domain/repositories/LearningTaskRepository";

import { withActiveClient } from "../PrismaClientContext";
import { LearningTaskPersistenceMapper } from "../mappers/LearningTaskPersistenceMapper";
import { translatePrismaError } from "@/features/my-plan/infrastructure/exceptions/PrismaExceptionTranslator";

export class PrismaLearningTaskRepository implements LearningTaskRepository {
  public async findById(id: LearningTaskId): Promise<LearningTask | null> {
    const row = await withActiveClient((client) =>
      client.learningTask.findUnique({ where: { id: id.value } }),
    );
    return row ? LearningTaskPersistenceMapper.toDomain(row) : null;
  }

  public async findByLearningPhaseId(learningPhaseId: LearningPhaseId): Promise<LearningTask[]> {
    const rows = await withActiveClient((client) =>
      client.learningTask.findMany({ where: { learningPhaseId: learningPhaseId.value } }),
    );
    return rows.map(LearningTaskPersistenceMapper.toDomain);
  }

  public async save(task: LearningTask): Promise<void> {
    const data = LearningTaskPersistenceMapper.toPersistenceData(task);
    try {
      await withActiveClient((client) =>
        client.learningTask.upsert({ where: { id: data.id }, create: data, update: data }),
      );
    } catch (error) {
      translatePrismaError(error, "LearningTask", task.id.value);
    }
  }
}
