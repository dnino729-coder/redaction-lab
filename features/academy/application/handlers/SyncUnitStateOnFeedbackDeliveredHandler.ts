import type { AcademyUnitRepository } from "@/features/academy/domain/repositories/AcademyUnitRepository";
import type { AttemptRepository } from "@/features/academy/domain/repositories/AttemptRepository";
import { AttemptId } from "@/features/academy/domain/value-objects/AttemptId";
import { UnitState } from "@/features/academy/domain/enums/UnitState";
import type { FeedbackDeliveredEvent } from "@/features/academy/domain/events/FeedbackDeliveredEvent";

import type { UnitOfWork } from "../ports/UnitOfWork";

// Regla de Consistencia Eventual 8.1 — reacciona a `FeedbackDelivered`
// (CMD-04). Sección 9: `AWAITING_FEEDBACK -> REVISION`.
export class SyncUnitStateOnFeedbackDeliveredHandler {
  constructor(
    private readonly academyUnitRepository: AcademyUnitRepository,
    private readonly attemptRepository: AttemptRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  public async handle(event: FeedbackDeliveredEvent): Promise<void> {
    await this.unitOfWork.execute(async () => {
      const attempt = await this.attemptRepository.findById(
        AttemptId.create(event.payload.attemptId),
      );
      if (!attempt) return;
      const unit = await this.academyUnitRepository.findById(attempt.unitId);
      if (!unit || unit.state !== UnitState.AWAITING_FEEDBACK) return;
      unit.advanceToRevision();
      await this.academyUnitRepository.save(unit);
    });
  }
}
