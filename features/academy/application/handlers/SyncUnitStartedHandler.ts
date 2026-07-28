import type { AcademyUnitRepository } from "@/features/academy/domain/repositories/AcademyUnitRepository";
import { AcademyUnitId } from "@/features/academy/domain/value-objects/AcademyUnitId";
import { AttemptId } from "@/features/academy/domain/value-objects/AttemptId";
import type { UnitStartedEvent } from "@/features/academy/domain/events/UnitStartedEvent";

import type { UnitOfWork } from "../ports/UnitOfWork";
import { DomainEventPublisher } from "../services/DomainEventPublisher";

// Regla de Consistencia Eventual 8.1 (Domain Model v1.1) — reacciona a
// `UnitStarted` (CMD-01, transacción 1: creación del `Attempt`) para
// transicionar `AcademyUnit` UNLOCKED -> IN_PROGRESS en una segunda
// transacción, siguiendo el mismo patrón ya detallado explícitamente para
// `ReflectionCompleted` (Sección 7.18) — aplicado aquí de forma
// consistente al resto de transiciones que la propia Sección 9 (tabla de
// estados) exige sincronizar, sin introducir ninguna regla de negocio
// nueva.
export class SyncUnitStartedHandler {
  constructor(
    private readonly academyUnitRepository: AcademyUnitRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly domainEventPublisher: DomainEventPublisher,
  ) {}

  public async handle(event: UnitStartedEvent): Promise<void> {
    await this.unitOfWork.execute(async () => {
      const unit = await this.academyUnitRepository.findById(AcademyUnitId.create(event.aggregateId));
      if (!unit) return;
      unit.startAttempt(AttemptId.create(event.payload.attemptId));
      await this.academyUnitRepository.save(unit);
      await this.domainEventPublisher.appendFrom("AcademyUnit", unit);
    });
  }
}
