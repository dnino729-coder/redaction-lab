// Puerto de lectura (CQRS) — `LearningProgress` (13.4). Ver justificación
// completa en ports/DailyPlanReadPort.ts (misma ambigüedad, misma
// resolución).
import type { LearningProgressReadModel } from "../dto/LearningProgressDto";

export interface LearningProgressReadPort {
  findByLearningPlanId(learningPlanId: string): Promise<LearningProgressReadModel | null>;
}
