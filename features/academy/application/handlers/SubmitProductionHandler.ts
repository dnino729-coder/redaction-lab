import type { AttemptRepository } from "@/features/academy/domain/repositories/AttemptRepository";
import { VersionId } from "@/features/academy/domain/value-objects/VersionId";
import { DraftContent } from "@/features/academy/domain/value-objects/DraftContent";

import type { SubmitProductionCommand } from "../commands/SubmitProductionCommand";
import type { VersionResponseDto } from "../dto/VersionDto";
import { AttemptMapper } from "../mappers/AttemptMapper";
import { validateSubmitProductionRequest } from "../validators/attemptValidators";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { UuidGenerator } from "../ports/UuidGenerator";
import type { Logger } from "../ports/Logger";
import type { FeedbackGatewayPort } from "../ports/FeedbackGatewayPort";
import { DomainEventPublisher } from "../services/DomainEventPublisher";
import { AcademyAuthorizationGuard } from "../services/AcademyAuthorizationGuard";

// CMD-02 SubmitProduction (Application Layer Spec v1.0). El
// `FeedbackGatewayPort` se invoca **fuera** de la transacción de
// escritura del `Attempt` (ninguna transacción permanece abierta durante
// una llamada de red externa).
export class SubmitProductionHandler {
  constructor(
    private readonly attemptRepository: AttemptRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly uuidGenerator: UuidGenerator,
    private readonly feedbackGatewayPort: FeedbackGatewayPort,
    private readonly domainEventPublisher: DomainEventPublisher,
    private readonly authorizationGuard: AcademyAuthorizationGuard,
    private readonly logger: Logger,
  ) {}

  public async handle(command: SubmitProductionCommand): Promise<VersionResponseDto> {
    const { request } = command;
    validateSubmitProductionRequest(request);
    await this.authorizationGuard.assertAttemptOwnership(request.attemptId, request.studentId);

    const { attemptId, version } = await this.unitOfWork.execute(async () => {
      const attempt = await this.authorizationGuard.assertAttemptOwnership(
        request.attemptId,
        request.studentId,
      );
      const content = DraftContent.create(request.content);
      const createdVersion = attempt.submitProduction(
        VersionId.create(this.uuidGenerator.generate()),
        content,
      );
      await this.attemptRepository.save(attempt);
      await this.domainEventPublisher.appendFrom("Attempt", attempt);
      return { attemptId: attempt.id.value, version: createdVersion };
    }, request.studentId);

    const gatewayResult = await this.feedbackGatewayPort.requestFeedback({
      attemptId,
      versionId: version.id.value,
    });

    this.logger.info("SubmitProduction completado", { attemptId, versionId: version.id.value });
    return AttemptMapper.toVersionDto(attemptId, version, gatewayResult.status);
  }
}
