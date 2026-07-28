import type { AcademyUnitRepository } from "@/features/academy/domain/repositories/AcademyUnitRepository";
import { AcademyUnitId } from "@/features/academy/domain/value-objects/AcademyUnitId";
import { AttemptId } from "@/features/academy/domain/value-objects/AttemptId";
import type { ReflectionCompletedEvent } from "@/features/academy/domain/events/ReflectionCompletedEvent";

import type { UnitOfWork } from "../ports/UnitOfWork";
import type { Logger } from "../ports/Logger";
import type { MiPlanTaskLookupPort } from "@/features/academy/domain/ports/MiPlanTaskLookupPort";
import { DomainEventPublisher } from "../services/DomainEventPublisher";

// CMD-07 CompleteReflection — **transacción 2** (Application Layer Spec
// v1.0, Sección 7.18): reacciona a `ReflectionCompleted` (publicado desde
// la transacción 1, `CompleteReflectionHandler`) en una transacción
// independiente, bajo contexto de sistema. Suscrito por Infrastructure
// (Event Bus, Sprint 6.2) — este Handler solo define la orquestación de
// Application Layer, no el mecanismo de suscripción en sí.
export class CompleteUnitOnReflectionCompletedHandler {
  constructor(
    private readonly academyUnitRepository: AcademyUnitRepository,
    private readonly miPlanTaskLookupPort: MiPlanTaskLookupPort,
    private readonly unitOfWork: UnitOfWork,
    private readonly domainEventPublisher: DomainEventPublisher,
    private readonly logger: Logger,
  ) {}

  public async handle(event: ReflectionCompletedEvent): Promise<void> {
    await this.unitOfWork.execute(async () => {
      const unit = await this.academyUnitRepository.findById(
        AcademyUnitId.create(event.payload.unitId),
      );
      if (!unit) return;

      const linkedMiPlanTaskId = await this.miPlanTaskLookupPort.findLinkedTaskId(
        event.payload.studentId,
        event.payload.unitId,
      );
      unit.completeFromAttempt({
        attemptId: AttemptId.create(event.payload.attemptId),
        linkedMiPlanTaskId,
      });
      await this.academyUnitRepository.save(unit);
      await this.domainEventPublisher.appendFrom("AcademyUnit", unit);

      const nextUnit = await this.academyUnitRepository.findByStudentTextTypeAndPosition(
        unit.studentId,
        unit.textType,
        unit.position + 1,
      );
      if (nextUnit) {
        const eligible = nextUnit.isEligibleForUnlock({
          isFirstInSequence: false,
          predecessorState: unit.state,
        });
        if (eligible) {
          nextUnit.unlock({ isFirstInSequence: false, predecessorState: unit.state });
          await this.academyUnitRepository.save(nextUnit);
          await this.domainEventPublisher.appendFrom("AcademyUnit", nextUnit);
        }
      }

      this.logger.info("CompleteReflection (transacción 2) completado", {
        unitId: unit.id.value,
        nextUnitUnlocked: nextUnit ? nextUnit.state === "UNLOCKED" : false,
      });
    });
  }
}
