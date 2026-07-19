import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import { LearningObjectiveId } from "@/features/my-plan/domain/value-objects/LearningObjectiveId";
import type { LearningObjectiveRepository } from "@/features/my-plan/domain/repositories/LearningObjectiveRepository";
import type { LearningGoalRepository } from "@/features/my-plan/domain/repositories/LearningGoalRepository";
import { InvalidStatusTransitionException } from "@/features/my-plan/domain/exceptions/InvalidStatusTransitionException";

import type { UpdateLearningObjectiveCommand } from "../commands/UpdateLearningObjectiveCommand";
import type { LearningObjectiveResponseDto } from "../dto/LearningObjectiveDto";
import { LearningObjectiveMapper } from "../mappers/LearningObjectiveMapper";
import { validateUpdateLearningObjectiveRequest } from "../validators/learningTaskObjectiveValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import { ConflictException } from "../exceptions/ConflictException";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { Clock } from "../ports/Clock";
import type { Logger } from "../ports/Logger";
import { OwnershipVerificationService } from "../services/OwnershipVerificationService";

// Caso de uso: UpdateLearningObjective.
//
// INTERPRETACIÓN DE AMBIGÜEDAD (ver informe de entrega): el dominio
// (Sprint 3.3.2) no expone ningún mutador de campos escalares
// (title/description/orderNumber) para `LearningObjective` — solo expone
// su máquina de estados (`start()`/`complete()`/`revert()`/`cancel()`).
// Añadir un mutador de campos violaría "No modificar Domain Layer". Se
// interpreta "Update" como "transición de estado" — coherente con que no
// exista un caso de uso separado "CompleteLearningObjective" en el
// encargo (a diferencia de `LearningTask`, que sí lo tiene como comando
// propio) y con que `LearningObjective` sea, según 18.21, la única de las
// 4 entidades de transición manual sin campo `source`.
export class UpdateLearningObjectiveHandler {
  constructor(
    private readonly learningObjectiveRepository: LearningObjectiveRepository,
    private readonly learningGoalRepository: LearningGoalRepository,
    private readonly ownershipVerificationService: OwnershipVerificationService,
    private readonly unitOfWork: UnitOfWork,
    private readonly clock: Clock,
    private readonly logger: Logger,
  ) {}

  public async handle(command: UpdateLearningObjectiveCommand): Promise<LearningObjectiveResponseDto> {
    const { request } = command;
    validateUpdateLearningObjectiveRequest(request);

    const studentId = StudentId.create(request.studentId);
    const objectiveId = LearningObjectiveId.create(request.objectiveId);

    await this.unitOfWork.execute(async () => {
      const objective = await this.learningObjectiveRepository.findById(objectiveId);
      if (!objective) throw new ResourceNotFoundException("LearningObjective", objectiveId.value);

      const goal = await this.ownershipVerificationService.verifyObjectiveOwnership(objective, studentId);

      try {
        switch (request.action) {
          case "START":
            objective.start();
            break;
          case "COMPLETE":
            objective.complete(this.clock.now());
            break;
          case "REVERT":
            objective.revert();
            break;
          case "CANCEL":
            objective.cancel();
            break;
        }
      } catch (error) {
        if (error instanceof InvalidStatusTransitionException) {
          throw new ConflictException(error.message);
        }
        throw error;
      }

      await this.learningObjectiveRepository.save(objective);

      // 18.21: LearningGoal.status se calcula a partir de sus
      // LearningObjective — se recalcula tras cualquier transición.
      const siblingObjectives = await this.learningObjectiveRepository.findByLearningGoalId(goal.id);
      goal.recalculateStatus(siblingObjectives.map((sibling) => sibling.status), this.clock.now());
      await this.learningGoalRepository.save(goal);
    });

    const objective = await this.learningObjectiveRepository.findById(objectiveId);
    if (!objective) throw new ResourceNotFoundException("LearningObjective", objectiveId.value);

    this.logger.info("LearningObjective actualizado", {
      learningObjectiveId: objectiveId.value,
      action: request.action,
    });
    return LearningObjectiveMapper.toResponseDto(objective);
  }
}
