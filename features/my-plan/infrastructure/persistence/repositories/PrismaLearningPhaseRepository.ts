import type { LearningPhase } from "@/features/my-plan/domain/entities/LearningPhase";
import type { LearningPhaseId } from "@/features/my-plan/domain/value-objects/LearningPhaseId";
import type { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import type { LearningPhaseRepository } from "@/features/my-plan/domain/repositories/LearningPhaseRepository";

import { withActiveClient } from "../PrismaClientContext";
import { LearningPhasePersistenceMapper } from "../mappers/LearningPhasePersistenceMapper";
import { translatePrismaError } from "@/features/my-plan/infrastructure/exceptions/PrismaExceptionTranslator";

export class PrismaLearningPhaseRepository implements LearningPhaseRepository {
  public async findById(id: LearningPhaseId): Promise<LearningPhase | null> {
    const row = await withActiveClient((client) =>
      client.learningPhase.findUnique({ where: { id: id.value } }),
    );
    return row ? LearningPhasePersistenceMapper.toDomain(row) : null;
  }

  public async findByLearningPlanId(learningPlanId: LearningPlanId): Promise<LearningPhase[]> {
    const rows = await withActiveClient((client) =>
      client.learningPhase.findMany({ where: { learningPlanId: learningPlanId.value } }),
    );
    return rows.map(LearningPhasePersistenceMapper.toDomain);
  }

  public async save(phase: LearningPhase): Promise<void> {
    const data = LearningPhasePersistenceMapper.toPersistenceData(phase);
    try {
      await withActiveClient((client) =>
        client.learningPhase.upsert({ where: { id: data.id }, create: data, update: data }),
      );
    } catch (error) {
      translatePrismaError(error, "LearningPhase", phase.id.value);
    }
  }
}
