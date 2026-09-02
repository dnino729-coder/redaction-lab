import type { DomainEvent } from "@/features/academy/domain/events/DomainEvent";
import type { OutboxPort } from "../ports/OutboxPort";

interface EventSource {
  pullDomainEvents(): DomainEvent<unknown>[];
}

// Servicio de aplicación — helper delgado sobre `OutboxPort` (mismo
// patrón que `features/my-plan/application/services/DomainEventPublisher.ts`,
// adaptado al Outbox Pattern de Academia, Persistence Layer v1.0 §7:
// el evento se escribe en la misma transacción que persiste el Aggregate,
// nunca se publica directamente al Event Bus desde aquí).
export class DomainEventPublisher {
  constructor(private readonly outboxPort: OutboxPort) {}

  public async appendFrom(aggregateType: string, ...sources: readonly EventSource[]): Promise<void> {
    const events = sources.flatMap((source) => source.pullDomainEvents());
    for (const event of events) {
      await this.outboxPort.append(event, aggregateType);
    }
  }
}
