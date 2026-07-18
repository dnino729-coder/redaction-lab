import type { LearningTask } from "../entities/LearningTask";
import type { LearningTaskId } from "../value-objects/LearningTaskId";
import type { LearningPhaseId } from "../value-objects/LearningPhaseId";

export interface LearningTaskRepository {
  findById(id: LearningTaskId): Promise<LearningTask | null>;
  findByLearningPhaseId(learningPhaseId: LearningPhaseId): Promise<LearningTask[]>;
  save(task: LearningTask): Promise<void>;
}
