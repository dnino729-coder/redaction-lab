import type { AcademyUnitRepository } from "@/features/academy/domain/repositories/AcademyUnitRepository";
import { AcademyUnitId } from "@/features/academy/domain/value-objects/AcademyUnitId";
import { UnitState } from "@/features/academy/domain/enums/UnitState";
import type { ProductionSubmittedEvent } from "@/features/academy/domain/events/ProductionSubmittedEvent";

import type { UnitOfWork } from "../ports/UnitOfWork";

// Regla de Consistencia Eventual 8.1 — reacciona a `ProductionSubmitted`.
// Sección 9 (tabla de estados): `IN_PROGRESS -> AWAITING_FEEDBACK` en el
// primer envío; `REVISION -> AWAITING_FEEDBACK` en un reenvío tras
// `RevisionStarted` (CMD-05 SubmitRevision).
export class SyncUnitStateOnProductionSubmittedHandler {
  constructor(
    private readonly academyUnitRepository: AcademyUnitRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  public async handle(event: ProductionSubmittedEvent): Promise<void> {
    await this.unitOfWork.execute(async () => {
      const unit = await this.academyUnitRepository.findById(
        AcademyUnitId.create(event.payload.unitId),
      );
      if (!unit) return;
      if (unit.state === UnitState.IN_PROGRESS) {
        unit.advanceToAwaitingFeedback();
      } else if (unit.state === UnitState.REVISION) {
        unit.returnToAwaitingFeedback();
      } else {
        return;
      }
      await this.academyUnitRepository.save(unit);
    });
  }
}
