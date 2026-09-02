import type { AcademyUnitRepository } from "@/features/academy/domain/repositories/AcademyUnitRepository";
import type { AttemptRepository } from "@/features/academy/domain/repositories/AttemptRepository";
import type { AttemptFactory } from "@/features/academy/domain/factories/AttemptFactory";
import { AcademyUnitId } from "@/features/academy/domain/value-objects/AcademyUnitId";
import { UnitState } from "@/features/academy/domain/enums/UnitState";

import type { StartUnitCommand } from "../commands/StartUnitCommand";
import type { AttemptSummaryResponseDto } from "../dto/AttemptDto";
import { AttemptMapper } from "../mappers/AttemptMapper";
import { validateStartUnitRequest } from "../validators/attemptValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import { ConflictException } from "../exceptions/ConflictException";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { UuidGenerator } from "../ports/UuidGenerator";
import type { Logger } from "../ports/Logger";
import type { DomainEventPublisher } from "../services/DomainEventPublisher";
import type { AcademyAuthorizationGuard } from "../services/AcademyAuthorizationGuard";

// CMD-01 StartUnit (Application Layer Spec v1.0). La transición
// `AcademyUnit` UNLOCKED->IN_PROGRESS ocurre en una segunda transacción
// (Regla de Consistencia Eventual 8.1), vía `SyncUnitStartedHandler`
// reaccionando a `UnitStarted` — este Handler solo escribe `Attempt`.
export class StartUnitHandler {
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

  public async handle(command: StartUnitCommand): Promise<AttemptSummaryResponseDto> {
    const { request } = command;
    validateStartUnitRequest(request);
    await this.authorizationGuard.assertUnitOwnership(request.unitId, request.studentId);

    const attempt = await this.unitOfWork.execute(async () => {
      const unit = await this.academyUnitRepository.findById(AcademyUnitId.create(request.unitId));
      if (!unit) {
        throw new ResourceNotFoundException("ACADEMY_NOT_FOUND_UNIT", "AcademyUnit", request.unitId);
      }
      if (unit.state !== UnitState.UNLOCKED) {
        throw new ConflictException(
          "ACADEMY_RULE_UNIT_NOT_UNLOCKED",
          `AcademyUnit "${request.unitId}" no está UNLOCKED.`,
        );
      }
      const existingActive = await this.attemptRepository.findActiveByUnitId(unit.id);
      if (existingActive) {
        throw new ConflictException(
          "ACADEMY_RULE_ATTEMPT_ALREADY_ACTIVE",
          `Ya existe un intento activo para la unidad "${request.unitId}".`,
        );
      }

      const newAttempt = this.attemptFactory.create({
        newId: () => this.uuidGenerator.generate(),
        unitId: request.unitId,
        studentId: request.studentId,
        attemptNumber: 1,
      });
      await this.attemptRepository.save(newAttempt);
      await this.domainEventPublisher.appendFrom("Attempt", newAttempt);
      return newAttempt;
    }, request.studentId);

    this.logger.info("StartUnit completado", { attemptId: attempt.id.value, unitId: request.unitId });
    return AttemptMapper.toSummaryDto(attempt);
  }
}
