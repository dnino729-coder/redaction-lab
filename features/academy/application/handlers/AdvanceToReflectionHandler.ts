import type { AttemptRepository } from "@/features/academy/domain/repositories/AttemptRepository";
import { UnitStep } from "@/features/academy/domain/enums/UnitStep";

import type { AdvanceToReflectionCommand } from "../commands/AdvanceToReflectionCommand";
import type { AttemptSummaryResponseDto } from "../dto/AttemptDto";
import { AttemptMapper } from "../mappers/AttemptMapper";
import { validateAdvanceToReflectionRequest } from "../validators/attemptValidators";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { Logger } from "../ports/Logger";
import { DomainEventPublisher } from "../services/DomainEventPublisher";
import { AcademyAuthorizationGuard } from "../services/AcademyAuthorizationGuard";

// CMD-06 AdvanceToReflection — idempotencia semántica: reintento sobre un
// Attempt ya en REFLECT retorna el mismo resultado sin re-ejecutar
// (Application Layer Spec v1.0).
export class AdvanceToReflectionHandler {
  constructor(
    private readonly attemptRepository: AttemptRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly domainEventPublisher: DomainEventPublisher,
    private readonly authorizationGuard: AcademyAuthorizationGuard,
    private readonly logger: Logger,
  ) {}

  public async handle(command: AdvanceToReflectionCommand): Promise<AttemptSummaryResponseDto> {
    const { request } = command;
    validateAdvanceToReflectionRequest(request);

    const attempt = await this.unitOfWork.execute(async () => {
      const loaded = await this.authorizationGuard.assertAttemptOwnership(
        request.attemptId,
        request.studentId,
      );
      if (loaded.currentStep === UnitStep.REFLECT) {
        return loaded;
      }
      loaded.advanceToReflection();
      await this.attemptRepository.save(loaded);
      await this.domainEventPublisher.appendFrom("Attempt", loaded);
      return loaded;
    }, request.studentId);

    this.logger.info("AdvanceToReflection completado", { attemptId: attempt.id.value });
    return AttemptMapper.toSummaryDto(attempt);
  }
}
