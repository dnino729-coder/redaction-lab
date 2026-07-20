import type { LearningTaskModel } from "@prisma/client";
import { LearningTask } from "@/features/my-plan/domain/entities/LearningTask";
import { LearningTaskId } from "@/features/my-plan/domain/value-objects/LearningTaskId";
import { LearningPhaseId } from "@/features/my-plan/domain/value-objects/LearningPhaseId";
import type { LearningTaskStatus } from "@/features/my-plan/domain/enums/LearningTaskStatus";
import type { LearningTaskDifficulty } from "@/features/my-plan/domain/enums/LearningTaskDifficulty";
import type { LearningTaskSource } from "@/features/my-plan/domain/enums/LearningTaskSource";

export class LearningTaskPersistenceMapper {
  public static toDomain(row: LearningTaskModel): LearningTask {
    return LearningTask.restore({
      id: LearningTaskId.create(row.id),
      learningPhaseId: LearningPhaseId.create(row.learningPhaseId),
      title: row.title,
      description: row.description,
      estimatedMinutes: row.estimatedMinutes,
      difficulty: row.difficulty as LearningTaskDifficulty,
      dueDate: row.dueDate,
      completedAt: row.completedAt,
      status: row.status as LearningTaskStatus,
      source: row.source as LearningTaskSource,
    });
  }

  public static toPersistenceData(task: LearningTask): LearningTaskModel {
    return {
      id: task.id.value,
      learningPhaseId: task.learningPhaseId.value,
      title: task.title,
      description: task.description,
      estimatedMinutes: task.estimatedMinutes,
      difficulty: task.difficulty,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      status: task.status,
      source: task.source,
    };
  }
}
