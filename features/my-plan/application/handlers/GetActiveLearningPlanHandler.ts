import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import type { LearningPlanRepository } from "@/features/my-plan/domain/repositories/LearningPlanRepository";

import type { GetActiveLearningPlanQuery } from "../queries/GetActiveLearningPlanQuery";
import type { LearningPlanResponseDto } from "../dto/LearningPlanDto";
import { LearningPlanMapper } from "../mappers/LearningPlanMapper";
import { validateGetActiveLearningPlanRequest } from "../validators/learningPlanValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import type { Logger } from "../ports/Logger";

// Caso de uso: GetActiveLearningPlan (Query, CQRS) — 13.4 MUST: "un
// estudiante puede tener múltiples planes, pero solo un plan activo".
// Lectura pura: sin UnitOfWork (no hay escritura que envolver en
// transacción).
export class GetActiveLearningPlanHandler {
  constructor(
    private readonly learningPlanRepository: LearningPlanRepository,
    private readonly logger: Logger,
  ) {}

  public async handle(query: GetActiveLearningPlanQuery): Promise<LearningPlanResponseDto> {
    const { request } = query;
    validateGetActiveLearningPlanRequest(request);

    const studentId = StudentId.create(request.studentId);
    const plan = await this.learningPlanRepository.findActiveByStudentId(studentId);
    if (!plan) throw new ResourceNotFoundException("LearningPlan (activo)", studentId.value);

    this.logger.debug("GetActiveLearningPlan resuelto", { studentId: studentId.value });
    return LearningPlanMapper.toResponseDto(plan);
  }
}
