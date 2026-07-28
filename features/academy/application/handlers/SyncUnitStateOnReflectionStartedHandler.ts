import type { AcademyUnitRepository } from "@/features/academy/domain/repositories/AcademyUnitRepository";
import type { AttemptRepository } from "@/features/academy/domain/repositories/AttemptRepository";
import { AttemptId } from "@/features/academy/domain/value-objects/AttemptId";
import { UnitState } from "@/features/academy/domain/enums/UnitState";
import type { ReflectionStartedEvent } from "@/features/academy/domain/events/ReflectionStartedEvent";

import type { UnitOfWork } from "../ports/UnitOfWork";

// Regla de Consistencia Eventual 8.1 — reacciona a `ReflectionStarted`
// (CMD-06). Sección 9: `REVISION -> REFLECTION`.
export class SyncUnitStateOnReflectionStartedHandler {
  constructor(
    private readonly academyUnitRepository: AcademyUnitRepository,
    private readonly attemptRepository: AttemptRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  public async handle(event: ReflectionStartedEvent): Promise<void> {
    await this.unitOfWork.execute(async () => {
      const attempt = await this.attemptRepository.findById(
        AttemptId.create(event.payload.attemptId),
      );
      if (!attempt) return;
      const unit = await this.academyUnitRepository.findById(attempt.unitId);
      if (!unit || unit.state !== UnitState.REVISION) return;
      unit.advanceToReflectionPhase();
      await this.academyUnitRepository.save(unit);
    });
  }
}
