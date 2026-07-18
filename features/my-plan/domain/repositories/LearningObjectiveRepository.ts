import type { LearningObjective } from "../entities/LearningObjective";
import type { LearningObjectiveId } from "../value-objects/LearningObjectiveId";
import type { LearningGoalId } from "../value-objects/LearningGoalId";

export interface LearningObjectiveRepository {
  findById(id: LearningObjectiveId): Promise<LearningObjective | null>;
  findByLearningGoalId(learningGoalId: LearningGoalId): Promise<LearningObjective[]>;
  save(objective: LearningObjective): Promise<void>;
}
