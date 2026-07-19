import type { LearningGoal } from "@/features/my-plan/domain/entities/LearningGoal";
import type { LearningGoalResponseDto } from "../dto/LearningGoalDto";

export class LearningGoalMapper {
  public static toResponseDto(goal: LearningGoal): LearningGoalResponseDto {
    return {
      id: goal.id.value,
      learningPlanId: goal.learningPlanId.value,
      title: goal.title,
      description: goal.description,
      priority: goal.priority,
      targetDate: goal.targetDate ? goal.targetDate.toISOString() : null,
      completedAt: goal.completedAt ? goal.completedAt.toISOString() : null,
      status: goal.status,
    };
  }
}
