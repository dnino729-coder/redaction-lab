import type { DomainEvent } from "@/features/my-plan/domain/events/DomainEvent";

// Puerto — publicación de Domain Events. Los eventos que el dominio
// acumula (`AggregateRoot.pullDomainEvents()`) se publican únicamente
// desde aquí (Application Layer), nunca desde infraestructura ni desde
// las propias entidades — las entidades solo los acumulan, nunca los
// despachan (ver domain/shared/AggregateRoot.ts). La implementación real
// (cola, bus en memoria, etc.) es infraestructura, fuera de alcance.
export interface EventBus {
  publish(events: readonly DomainEvent[]): Promise<void>;
}
