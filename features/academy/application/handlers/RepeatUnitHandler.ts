import type { AcademyUnitRepository } from "@/features/academy/domain/repositories/AcademyUnitRepository";
import type { AttemptRepository } from "@/features/academy/domain/repositories/AttemptRepository";
import { AcademyUnitId } from "@/features/academy/domain/value-objects/AcademyUnitId";
import { AttemptFactory } from "@/features/academy/domain/factories/AttemptFactory";

import type { RepeatUnitCommand } from "../commands/RepeatUnitCommand";
import type { AttemptSummaryResponseDto } from "../dto/AttemptDto";
import { AttemptMapper } from "../mappers/AttemptMapper";
import { validateRepeatUnitRequest } from "../validators/attemptValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { UuidGenerator } from "../ports/UuidGenerator";
import type { Logger } from "../ports/Logger";
import { DomainEventPublisher } from "../services/DomainEventPublisher";
import { AcademyAuthorizationGuard } from "../services/AcademyAuthorizationGuard";

// CMD-09 RepeatUnit — H-03: `UnitState` no cambia. Única transacción
// (junto con CMD-10), sin sincronización eventual (Application Layer
// Spec v1.0).
export class RepeatUnitHandler {
  constructor(
    private readonly academyUnitRepository: AcademyUnitRepository,
    private readonly attemptRepository: AttemptRepository,
    private readonly attemptFactory: AttemptFactory,
    private readonly unitOfWork: UnitOfWork,
    private readonly uuidGenerator: UuidGenerator,
    private readonly domainEventPublisher: DomainEventPublisher,
    private readonly authorizationGuard: AcademyAuthorizationGuard,
    private readonly logger: Logger,
  ) {}

  public async handle(command: RepeatUnitCommand): Promise<AttemptSummaryResponseDto> {
    const { request } = command;
    validateRepeatUnitRequest(request);
    await this.authorizationGuard.assertUnitOwnership(request.unitId, request.studentId);

    const newAttempt = await this.unitOfWork.execute(async () => {
      const unit = await this.academyUnitRepository.findById(AcademyUnitId.create(request.unitId));
      if (!unit) {
        throw new ResourceNotFoundException("ACADEMY_NOT_FOUND_UNIT", "AcademyUnit", request.unitId);
      }

      const previousAttempts = await this.attemptRepository.findAllByUnitId(unit.id);
      const nextAttemptNumber =
        previousAttempts.reduce((max, a) => Math.max(max, a.attemptNumber), 0) + 1;

      const attempt = this.attemptFactory.create({
        newId: () => this.uuidGenerator.generate(),
        unitId: request.unitId,
        studentId: request.studentId,
        attemptNumber: nextAttemptNumber,
      });

      unit.repeat(attempt.id);
      await this.academyUnitRepository.save(unit);
      await this.attemptRepository.save(attempt);
      await this.domainEventPublisher.appendFrom("AcademyUnit", unit);
      return attempt;
    }, request.studentId);

    this.logger.info("RepeatUnit completado", { unitId: request.unitId, attemptId: newAttempt.id.value });
    return AttemptMapper.toSummaryDto(newAttempt);
  }
}
