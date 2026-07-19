import type { DomainEvent } from "@/features/my-plan/domain/events/DomainEvent";
import type { EventBus } from "../ports/EventBus";

// Estructural, no importa `AggregateRoot` directamente: evita tener que
// parametrizar su genérico `TId` con `any` para aceptar "cualquier
// Aggregate Root" — solo necesitamos que exponga `pullDomainEvents()`,
// que es exactamente su único método público relevante aquí.
interface EventSource {
  pullDomainEvents(): DomainEvent[];
}

// Servicio de aplicación — helper delgado sobre `EventBus`. Extrae
// (`pullDomainEvents()`) y publica los eventos acumulados por uno o más
// Aggregate Roots tras una operación. Existe para no repetir el mismo
// `eventBus.publish(aggregate.pullDomainEvents())` en cada Handler.
export class DomainEventPublisher {
  constructor(private readonly eventBus: EventBus) {}

  public async publishFrom(...sources: readonly EventSource[]): Promise<void> {
    const events = sources.flatMap((source) => source.pullDomainEvents());
    if (events.length === 0) return;
    await this.eventBus.publish(events);
  }
}
