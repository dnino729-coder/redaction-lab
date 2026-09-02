import type { AttemptRepository } from "@/features/academy/domain/repositories/AttemptRepository";
import { AttemptId } from "@/features/academy/domain/value-objects/AttemptId";
import { FeedbackId } from "@/features/academy/domain/value-objects/FeedbackId";
import { FeedbackObservation } from "@/features/academy/domain/value-objects/FeedbackObservation";
import type { FeedbackCategory } from "@/features/academy/domain/enums/FeedbackCategory";
import type { FeedbackStrength } from "@/features/academy/domain/enums/FeedbackStrength";

import type { RecordFeedbackDeliveredCommand } from "../commands/RecordFeedbackDeliveredCommand";
import type { FeedbackResponseDto } from "../dto/FeedbackDto";
import { AttemptMapper } from "../mappers/AttemptMapper";
import { validateRecordFeedbackDeliveredRequest } from "../validators/feedbackValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { UuidGenerator } from "../ports/UuidGenerator";
import type { Logger } from "../ports/Logger";
import type { DomainEventPublisher } from "../services/DomainEventPublisher";

// CMD-04 RecordFeedbackDelivered — exclusivamente `AI_SERVICE`/`SYSTEM`
// (Application Layer Spec v1.0: nunca un actor humano; verificación de
// rol delegada a la capa API/Middleware, Sprint 6.3). Idempotencia
// obligatoria por `(attemptId, versionNumber)`.
export class RecordFeedbackDeliveredHandler {
  constructor(
    private readonly attemptRepository: AttemptRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly uuidGenerator: UuidGenerator,
    private readonly domainEventPublisher: DomainEventPublisher,
    private readonly logger: Logger,
  ) {}

  public async handle(command: RecordFeedbackDeliveredCommand): Promise<FeedbackResponseDto> {
    const { request } = command;
    validateRecordFeedbackDeliveredRequest(request);

    return this.unitOfWork.execute(async () => {
      const attempt = await this.attemptRepository.findById(AttemptId.create(request.attemptId));
      if (!attempt) {
        throw new ResourceNotFoundException("ACADEMY_NOT_FOUND_ATTEMPT", "Attempt", request.attemptId);
      }

      const pendingVersion = attempt.versions.find((v) => v.number.value === request.versionNumber);
      if (pendingVersion?.hasFeedback()) {
        // Idempotencia: reintento post-éxito retorna el Feedback ya
        // registrado sin duplicar (Application Layer Spec v1.0, CMD-04).
        return AttemptMapper.toFeedbackDto(pendingVersion.feedback!);
      }

      const observations = request.observations.map((o) =>
        FeedbackObservation.create({
          category: o.category as FeedbackCategory,
          strength: o.strength as FeedbackStrength,
          explanation: o.explanation,
          suggestion: o.suggestion,
        }),
      );
      const feedback = attempt.recordFeedback({
        feedbackId: FeedbackId.create(this.uuidGenerator.generate()),
        observations,
      });
      await this.attemptRepository.save(attempt);
      await this.domainEventPublisher.appendFrom("Attempt", attempt);

      this.logger.info("RecordFeedbackDelivered completado", {
        attemptId: attempt.id.value,
        feedbackId: feedback.id.value,
      });
      return AttemptMapper.toFeedbackDto(feedback);
    });
  }
}
