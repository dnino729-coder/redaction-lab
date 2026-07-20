import type { LearningObjectiveModel } from "@prisma/client";
import { LearningObjective } from "@/features/my-plan/domain/entities/LearningObjective";
import { LearningObjectiveId } from "@/features/my-plan/domain/value-objects/LearningObjectiveId";
import { LearningGoalId } from "@/features/my-plan/domain/value-objects/LearningGoalId";
import type { LearningObjectiveStatus } from "@/features/my-plan/domain/enums/LearningObjectiveStatus";

export class LearningObjectivePersistenceMapper {
  public static toDomain(row: LearningObjectiveModel): LearningObjective {
    return LearningObjective.restore({
      id: LearningObjectiveId.create(row.id),
      learningGoalId: LearningGoalId.create(row.learningGoalId),
      title: row.title,
      description: row.description,
      orderNumber: row.orderNumber,
      completedAt: row.completedAt,
      status: row.status as LearningObjectiveStatus,
    });
  }

  public static toPersistenceData(objective: LearningObjective): LearningObjectiveModel {
    return {
      id: objective.id.value,
      learningGoalId: objective.learningGoalId.value,
      title: objective.title,
      description: objective.description,
      orderNumber: objective.orderNumber,
      completedAt: objective.completedAt,
      status: objective.status,
    };
  }
}
