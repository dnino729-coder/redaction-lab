import type { LearningTask } from "@/features/my-plan/domain/entities/LearningTask";
import type { LearningTaskResponseDto } from "../dto/LearningTaskDto";

export class LearningTaskMapper {
  public static toResponseDto(task: LearningTask): LearningTaskResponseDto {
    return {
      id: task.id.value,
      learningPhaseId: task.learningPhaseId.value,
      title: task.title,
      description: task.description,
      estimatedMinutes: task.estimatedMinutes,
      difficulty: task.difficulty,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      completedAt: task.completedAt ? task.completedAt.toISOString() : null,
      status: task.status,
      source: task.source,
    };
  }
}
