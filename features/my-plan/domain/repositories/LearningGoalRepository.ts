import type { LearningGoal } from "../entities/LearningGoal";
import type { LearningGoalId } from "../value-objects/LearningGoalId";
import type { LearningPlanId } from "../value-objects/LearningPlanId";

export interface LearningGoalRepository {
  findById(id: LearningGoalId): Promise<LearningGoal | null>;
  findByLearningPlanId(learningPlanId: LearningPlanId): Promise<LearningGoal[]>;
  save(goal: LearningGoal): Promise<void>;
}
