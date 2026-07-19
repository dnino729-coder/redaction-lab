import type { LearningObjective } from "@/features/my-plan/domain/entities/LearningObjective";
import type { LearningObjectiveResponseDto } from "../dto/LearningObjectiveDto";

export class LearningObjectiveMapper {
  public static toResponseDto(objective: LearningObjective): LearningObjectiveResponseDto {
    return {
      id: objective.id.value,
      learningGoalId: objective.learningGoalId.value,
      title: objective.title,
      description: objective.description,
      orderNumber: objective.orderNumber,
      completedAt: objective.completedAt ? objective.completedAt.toISOString() : null,
      status: objective.status,
    };
  }
}
