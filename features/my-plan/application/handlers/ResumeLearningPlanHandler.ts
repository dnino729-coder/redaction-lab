import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import type { LearningPlanRepository } from "@/features/my-plan/domain/repositories/LearningPlanRepository";

import type { ResumeLearningPlanCommand } from "../commands/ResumeLearningPlanCommand";
import type { LearningPlanResponseDto } from "../dto/LearningPlanDto";
import { LearningPlanMapper } from "../mappers/LearningPlanMapper";
import { validateResumeLearningPlanRequest } from "../validators/learningPlanValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import { ForbiddenException } from "../exceptions/ForbiddenException";
import { ConflictException } from "../exceptions/ConflictException";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { Logger } from "../ports/Logger";
import { InvalidStatusTransitionException } from "@/features/my-plan/domain/exceptions/InvalidStatusTransitionException";

// Caso de uso: ResumeLearningPlan — transición PAUSED -> ACTIVE, grafo
// formalizado en la resolución 18.22, punto 1.
export class ResumeLearningPlanHandler {
  constructor(
    private readonly learningPlanRepository: LearningPlanRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly logger: Logger,
  ) {}

  public async handle(command: ResumeLearningPlanCommand): Promise<LearningPlanResponseDto> {
    const { request } = command;
    validateResumeLearningPlanRequest(request);

    const studentId = StudentId.create(request.studentId);
    const planId = LearningPlanId.create(request.planId);

    await this.unitOfWork.execute(async () => {
      const plan = await this.learningPlanRepository.findById(planId);
      if (!plan) throw new ResourceNotFoundException("LearningPlan", planId.value);
      if (!plan.studentId.equals(studentId)) {
        throw new ForbiddenException(`El estudiante ${studentId.value} no es propietario del plan ${planId.value}.`);
      }

      try {
        plan.resume();
      } catch (error) {
        if (error instanceof InvalidStatusTransitionException) {
          throw new ConflictException(error.message);
        }
        throw error;
      }

      await this.learningPlanRepository.save(plan);
    });

    const plan = await this.learningPlanRepository.findById(planId);
    if (!plan) throw new ResourceNotFoundException("LearningPlan", planId.value);

    this.logger.info("LearningPlan reanudado", { learningPlanId: planId.value });
    return LearningPlanMapper.toResponseDto(plan);
  }
}
