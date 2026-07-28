import type { AcademyUnitRepository } from "@/features/academy/domain/repositories/AcademyUnitRepository";
import { AcademyUnitId } from "@/features/academy/domain/value-objects/AcademyUnitId";
import { MasteryEvaluationService } from "@/features/academy/domain/services/MasteryEvaluationService";

import type { EvaluateMasteryCommand } from "../commands/EvaluateMasteryCommand";
import type { AcademyUnitDetailResponseDto } from "../dto/AcademyUnitDto";
import { AcademyUnitMapper } from "../mappers/AcademyUnitMapper";
import { validateEvaluateMasteryRequest } from "../validators/provisioningValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { Logger } from "../ports/Logger";
import { DomainEventPublisher } from "../services/DomainEventPublisher";

// CMD-08 EvaluateMastery — exclusivamente `SYSTEM`, sin endpoint público
// (Application Layer Spec v1.0). No-elegible es no-op silencioso, nunca
// una excepción expuesta.
export class EvaluateMasteryHandler {
  constructor(
    private readonly academyUnitRepository: AcademyUnitRepository,
    private readonly masteryEvaluationService: MasteryEvaluationService,
    private readonly unitOfWork: UnitOfWork,
    private readonly domainEventPublisher: DomainEventPublisher,
    private readonly logger: Logger,
  ) {}

  public async handle(command: EvaluateMasteryCommand): Promise<AcademyUnitDetailResponseDto> {
    const { request } = command;
    validateEvaluateMasteryRequest(request);

    const unit = await this.unitOfWork.execute(async () => {
      const loaded = await this.academyUnitRepository.findById(AcademyUnitId.create(request.unitId));
      if (!loaded) {
        throw new ResourceNotFoundException("ACADEMY_NOT_FOUND_UNIT", "AcademyUnit", request.unitId);
      }
      const criterion = await this.masteryEvaluationService.evaluate({
        studentId: loaded.studentId.value,
        textType: loaded.textType,
      });
      if (loaded.isEligibleForMastery(criterion)) {
        loaded.markAsMastered();
        await this.academyUnitRepository.save(loaded);
        await this.domainEventPublisher.appendFrom("AcademyUnit", loaded);
        this.logger.info("EvaluateMastery: unidad promovida a MASTERED", { unitId: loaded.id.value });
      }
      return loaded;
    });

    return AcademyUnitMapper.toDetailDto(unit, {
      eligibleForUnlock: false,
      repeatable: unit.state === "COMPLETED" || unit.state === "MASTERED",
    });
  }
}
