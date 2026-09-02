import type { AcademyUnitRepository } from "@/features/academy/domain/repositories/AcademyUnitRepository";
import type { AcademyUnitFactory } from "@/features/academy/domain/factories/AcademyUnitFactory";
import type { UnitSequenceService } from "@/features/academy/domain/services/UnitSequenceService";
import { StudentId } from "@/features/academy/domain/value-objects/StudentId";

import type { ProvisionAcademyUnitsForStudentCommand } from "../commands/ProvisionAcademyUnitsForStudentCommand";
import type { AcademyUnitSummaryResponseDto } from "../dto/AcademyUnitDto";
import { AcademyUnitMapper } from "../mappers/AcademyUnitMapper";
import { validateProvisionAcademyUnitsForStudentRequest } from "../validators/provisioningValidators";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { UuidGenerator } from "../ports/UuidGenerator";
import type { Logger } from "../ports/Logger";

// CMD-15 ProvisionAcademyUnitsForStudent — exclusivamente `SYSTEM`, sin
// endpoint público. Idempotente: si el estudiante ya tiene catálogo
// provisionado, retorna el existente sin recrear (Application Layer Spec
// v1.0).
export class ProvisionAcademyUnitsForStudentHandler {
  constructor(
    private readonly academyUnitRepository: AcademyUnitRepository,
    private readonly unitSequenceService: UnitSequenceService,
    private readonly academyUnitFactory: AcademyUnitFactory,
    private readonly unitOfWork: UnitOfWork,
    private readonly uuidGenerator: UuidGenerator,
    private readonly logger: Logger,
  ) {}

  public async handle(
    command: ProvisionAcademyUnitsForStudentCommand,
  ): Promise<AcademyUnitSummaryResponseDto[]> {
    const { request } = command;
    validateProvisionAcademyUnitsForStudentRequest(request);

    const units = await this.unitOfWork.execute(async () => {
      const studentId = StudentId.create(request.studentId);
      const existing = await this.academyUnitRepository.findAllByStudentId(studentId);
      if (existing.length > 0) {
        return existing;
      }

      const curriculum = await this.unitSequenceService.resolveCurriculum();
      const created = curriculum.map((entry) =>
        this.academyUnitFactory.create({
          newId: () => this.uuidGenerator.generate(),
          studentId: request.studentId,
          textType: entry.textType,
          position: entry.position,
          initialState: this.unitSequenceService.determineInitialState(entry.position),
        }),
      );
      for (const unit of created) {
        await this.academyUnitRepository.save(unit);
      }
      return created;
    }, request.studentId);

    this.logger.info("ProvisionAcademyUnitsForStudent completado", {
      studentId: request.studentId,
      unitsCount: units.length,
    });
    return units.map((unit) => AcademyUnitMapper.toSummaryDto(unit));
  }
}
