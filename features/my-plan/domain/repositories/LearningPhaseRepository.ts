import type { LearningPhase } from "../entities/LearningPhase";
import type { LearningPhaseId } from "../value-objects/LearningPhaseId";
import type { LearningPlanId } from "../value-objects/LearningPlanId";

export interface LearningPhaseRepository {
  findById(id: LearningPhaseId): Promise<LearningPhase | null>;
  findByLearningPlanId(learningPlanId: LearningPlanId): Promise<LearningPhase[]>;
  save(phase: LearningPhase): Promise<void>;
}
