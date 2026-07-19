import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import type { LearningPlanRepository } from "@/features/my-plan/domain/repositories/LearningPlanRepository";

import type { CancelLearningPlanCommand } from "../commands/CancelLearningPlanCommand";
import type { LearningPlanResponseDto } from "../dto/LearningPlanDto";
import { LearningPlanMapper } from "../mappers/LearningPlanMapper";
import { validateCancelLearningPlanRequest } from "../validators/learningPlanValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import { ForbiddenException } from "../exceptions/ForbiddenException";
import { ConflictException } from "../exceptions/ConflictException";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { Clock } from "../ports/Clock";
import type { Logger } from "../ports/Logger";
import { InvalidStatusTransitionException } from "@/features/my-plan/domain/exceptions/InvalidStatusTransitionException";

// Caso de uso: CancelLearningPlan — transición ACTIVE|PAUSED -> CANCELLED,
// grafo formalizado en la resolución 18.22, punto 1. `endDate` se toma
// siempre del puerto `Clock` (nunca `new Date()` directo, nunca un valor
// proporcionado por el cliente) — mismo criterio que 18.21 exige para
// `completed_at`: lo asigna siempre el servidor en el instante de la
// transición, nunca un valor externo.
export class CancelLearningPlanHandler {
  constructor(
    private readonly learningPlanRepository: LearningPlanRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly clock: Clock,
    private readonly logger: Logger,
  ) {}

  public async handle(command: CancelLearningPlanCommand): Promise<LearningPlanResponseDto> {
    const { request } = command;
    validateCancelLearningPlanRequest(request);

    const studentId = StudentId.create(request.studentId);
    const planId = LearningPlanId.create(request.planId);

    await this.unitOfWork.execute(async () => {
      const plan = await this.learningPlanRepository.findById(planId);
      if (!plan) throw new ResourceNotFoundException("LearningPlan", planId.value);
      if (!plan.studentId.equals(studentId)) {
        throw new ForbiddenException(`El estudiante ${studentId.value} no es propietario del plan ${planId.value}.`);
      }

      try {
        plan.cancel(this.clock.now());
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

    this.logger.info("LearningPlan cancelado", { learningPlanId: planId.value });
    return LearningPlanMapper.toResponseDto(plan);
  }
}
