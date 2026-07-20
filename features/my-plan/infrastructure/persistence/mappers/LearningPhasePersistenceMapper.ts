import type { LearningPhaseModel } from "@prisma/client";
import { LearningPhase } from "@/features/my-plan/domain/entities/LearningPhase";
import { LearningPhaseId } from "@/features/my-plan/domain/value-objects/LearningPhaseId";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import type { LearningPhaseStatus } from "@/features/my-plan/domain/enums/LearningPhaseStatus";

export class LearningPhasePersistenceMapper {
  public static toDomain(row: LearningPhaseModel): LearningPhase {
    return LearningPhase.restore({
      id: LearningPhaseId.create(row.id),
      learningPlanId: LearningPlanId.create(row.learningPlanId),
      name: row.name,
      phaseOrder: row.phaseOrder,
      startDate: row.startDate,
      endDate: row.endDate,
      completedAt: row.completedAt,
      status: row.status as LearningPhaseStatus,
    });
  }

  public static toPersistenceData(phase: LearningPhase): LearningPhaseModel {
    return {
      id: phase.id.value,
      learningPlanId: phase.learningPlanId.value,
      name: phase.name,
      phaseOrder: phase.phaseOrder,
      startDate: phase.startDate,
      endDate: phase.endDate,
      completedAt: phase.completedAt,
      status: phase.status,
    };
  }
}
