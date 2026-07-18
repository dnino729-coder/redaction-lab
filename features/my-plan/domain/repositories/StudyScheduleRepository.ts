import type { StudySchedule } from "../entities/StudySchedule";
import type { StudyScheduleId } from "../value-objects/StudyScheduleId";
import type { LearningPlanId } from "../value-objects/LearningPlanId";

export interface StudyScheduleRepository {
  findById(id: StudyScheduleId): Promise<StudySchedule | null>;
  /** Relación 1:1 con LearningPlan (13.4) — a lo sumo un resultado. */
  findByLearningPlanId(learningPlanId: LearningPlanId): Promise<StudySchedule | null>;
  save(schedule: StudySchedule): Promise<void>;
}
