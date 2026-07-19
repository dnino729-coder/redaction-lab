import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import type { LearningPlanRepository } from "@/features/my-plan/domain/repositories/LearningPlanRepository";

import type { GetLearningProgressQuery } from "../queries/GetLearningProgressQuery";
import type { LearningProgressReadModel } from "../dto/LearningProgressDto";
import { validateGetLearningProgressRequest } from "../validators/readModelQueryValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import type { LearningProgressReadPort } from "../ports/LearningProgressReadPort";
import type { Logger } from "../ports/Logger";

// Caso de uso: GetLearningProgress (Query, CQRS) — misma resolución de
// GetDailyPlanHandler, aplicada a `LearningProgress`.
export class GetLearningProgressHandler {
  constructor(
    private readonly learningPlanRepository: LearningPlanRepository,
    private readonly learningProgressReadPort: LearningProgressReadPort,
    private readonly logger: Logger,
  ) {}

  public async handle(query: GetLearningProgressQuery): Promise<LearningProgressReadModel> {
    const { request } = query;
    validateGetLearningProgressRequest(request);

    const studentId = StudentId.create(request.studentId);
    const plan = await this.learningPlanRepository.findActiveByStudentId(studentId);
    if (!plan) throw new ResourceNotFoundException("LearningPlan (activo)", studentId.value);

    const progress = await this.learningProgressReadPort.findByLearningPlanId(plan.id.value);
    if (!progress) throw new ResourceNotFoundException("LearningProgress", plan.id.value);

    this.logger.debug("GetLearningProgress resuelto", { studentId: studentId.value });
    return progress;
  }
}
