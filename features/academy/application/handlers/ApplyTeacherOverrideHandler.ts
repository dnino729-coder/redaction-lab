import type { AcademyUnitRepository } from "@/features/academy/domain/repositories/AcademyUnitRepository";
import type { AttemptRepository } from "@/features/academy/domain/repositories/AttemptRepository";
import type { AttemptFactory } from "@/features/academy/domain/factories/AttemptFactory";
import { AcademyUnitId } from "@/features/academy/domain/value-objects/AcademyUnitId";
import { TeacherOverrideId } from "@/features/academy/domain/value-objects/TeacherOverrideId";
import { TeacherOverride } from "@/features/academy/domain/entities/TeacherOverride";
import { OverrideAction } from "@/features/academy/domain/enums/OverrideAction";
import { UnitState } from "@/features/academy/domain/enums/UnitState";

import type { ApplyTeacherOverrideCommand } from "../commands/ApplyTeacherOverrideCommand";
import type { TeacherOverrideResponseDto } from "../dto/TeacherOverrideDto";
import { TeacherOverrideMapper } from "../mappers/TeacherOverrideMapper";
import { validateApplyTeacherOverrideRequest } from "../validators/teacherOverrideValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { UuidGenerator } from "../ports/UuidGenerator";
import type { Logger } from "../ports/Logger";
import type { DomainEventPublisher } from "../services/DomainEventPublisher";
import type { AcademyAuthorizationGuard } from "../services/AcademyAuthorizationGuard";

// CMD-10 ApplyTeacherOverride — RN-13, invariante 10 ("el Attempt activo
// nunca se toca directamente"). `FORCE_RESTART` reutiliza internamente el
// mismo efecto que CMD-09 (`unit.repeat()` + nuevo `Attempt`) cuando el
// origen es COMPLETED/MASTERED. Segunda excepción de punta a punta, sin
// sincronización eventual (Application Layer Spec v1.0).
export class ApplyTeacherOverrideHandler {
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

  public async handle(command: ApplyTeacherOverrideCommand): Promise<TeacherOverrideResponseDto> {
    const { request } = command;
    validateApplyTeacherOverrideRequest(request);

    const unit = await this.academyUnitRepository.findById(AcademyUnitId.create(request.unitId));
    if (!unit) {
      throw new ResourceNotFoundException("ACADEMY_NOT_FOUND_UNIT", "AcademyUnit", request.unitId);
    }
    await this.authorizationGuard.assertTeacherRelationship(request.teacherId, unit.studentId.value);

    const override = await this.unitOfWork.execute(async () => {
      const loaded = await this.academyUnitRepository.findById(AcademyUnitId.create(request.unitId));
      if (!loaded) {
        throw new ResourceNotFoundException("ACADEMY_NOT_FOUND_UNIT", "AcademyUnit", request.unitId);
      }
      const originState = loaded.state;
      const action = request.action as OverrideAction;
      const newOverride = TeacherOverride.create({
        id: TeacherOverrideId.create(this.uuidGenerator.generate()),
        teacherId: request.teacherId,
        action,
        reason: request.reason,
      });

      loaded.applyTeacherOverride(newOverride);

      if (
        action === OverrideAction.FORCE_RESTART &&
        (originState === UnitState.COMPLETED || originState === UnitState.MASTERED)
      ) {
        const previousAttempts = await this.attemptRepository.findAllByUnitId(loaded.id);
        const nextAttemptNumber =
          previousAttempts.reduce((max, a) => Math.max(max, a.attemptNumber), 0) + 1;
        const newAttempt = this.attemptFactory.create({
          newId: () => this.uuidGenerator.generate(),
          unitId: request.unitId,
          studentId: loaded.studentId.value,
          attemptNumber: nextAttemptNumber,
        });
        loaded.repeat(newAttempt.id);
        await this.attemptRepository.save(newAttempt);
      }

      await this.academyUnitRepository.save(loaded);
      await this.domainEventPublisher.appendFrom("AcademyUnit", loaded);
      return newOverride;
    });

    this.logger.info("ApplyTeacherOverride completado", {
      unitId: request.unitId,
      action: request.action,
    });
    return TeacherOverrideMapper.toDto(request.unitId, override);
  }
}
