import type { DomainEvent } from "@/features/academy/domain/events/DomainEvent";

// Puerto — publicación de Domain Events (Outbox, Sprint 6.2). Los
// Handlers de Application Layer nunca publican directamente: escriben al
// Outbox dentro de la misma transacción (ver `OutboxPort`); este puerto
// se reserva para la publicación efectiva tras el poller de
// infraestructura, fuera de alcance de este Sprint.
export interface EventBus {
  publish(events: readonly DomainEvent<unknown>[]): Promise<void>;
}
