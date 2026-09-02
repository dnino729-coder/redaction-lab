import type {
  Prisma,
  AcademyOutboxAggregateType,
} from "@prisma/client";
import type { OutboxPort } from "@/features/academy/application/ports/OutboxPort";
import type { UuidGenerator } from "@/features/academy/application/ports/UuidGenerator";
import type { DomainEvent } from "@/features/academy/domain/events/DomainEvent";

import { withActiveClient } from "../PrismaClientContext";

// Implementa `OutboxPort` (Application Layer, Sprint 6.1) sobre la tabla
// `academy_outbox` (Persistence Layer Specification v1.0, Sección 7) —
// escribe el evento dentro de la MISMA transacción activa que persiste el
// Aggregate (propagada por `PrismaClientContext`/`PrismaUnitOfWork`, nunca
// abre una transacción propia).
//
// Nota de reconciliación (Categoría D, ya señalada en la auditoría de
// conformidad Sprint 6.1.1): `DomainEvent` (Domain Layer, Frozen) no
// declara un `eventId` propio — la Persistence Layer Specification v1.0
// exige uno "para idempotencia de consumidores". Este adaptador genera el
// `eventId` aquí, en la frontera de Infrastructure (vía `UuidGenerator`,
// puerto ya existente de Application), sin modificar `DomainEvent` ni
// ningún archivo de Domain/Application — es la corrección mínima
// compatible con "no modificar Domain/Application" de este Sprint.
export class PrismaAcademyOutboxPort implements OutboxPort {
  constructor(private readonly uuidGenerator: UuidGenerator) {}

  public async append(event: DomainEvent<unknown>, aggregateType: string): Promise<void> {
    const mappedAggregateType = this.mapAggregateType(aggregateType);
    await withActiveClient((client) =>
      client.academyOutbox.create({
        data: {
          eventId: this.uuidGenerator.generate(),
          eventName: event.eventName,
          aggregateId: event.aggregateId,
          aggregateType: mappedAggregateType,
          payload: this.toJsonPayload(event),
          occurredAt: event.occurredAt,
          status: "PENDING",
        },
      }),
    );
  }

private mapAggregateType(aggregateType: string): AcademyOutboxAggregateType {
    // `AcademyOutboxAggregateType` (Prisma) solo reconoce los dos
    // Aggregates que emiten Domain Events (Domain Model v1.1, Sección 10:
    // `ModelExample` nunca emite ninguno) — `DomainEventPublisher.appendFrom`
    // ya invoca `append()` con el nombre literal del Aggregate origen
    // ("AcademyUnit" | "Attempt"), nunca con otro valor.
    if (aggregateType === "AcademyUnit") return "ACADEMY_UNIT";
    if (aggregateType === "Attempt") return "ATTEMPT";
    throw new Error(`PrismaAcademyOutboxPort: aggregateType "${aggregateType}" no reconocido.`);
  }

  private toJsonPayload(event: DomainEvent<unknown>): Prisma.InputJsonValue {
    return {
      eventName: event.eventName,
      aggregateId: event.aggregateId,
      occurredAt: event.occurredAt.toISOString(),
      payload: event.payload as Prisma.InputJsonValue,
      metadata: event.metadata as Prisma.InputJsonValue,
    };
  }
}
