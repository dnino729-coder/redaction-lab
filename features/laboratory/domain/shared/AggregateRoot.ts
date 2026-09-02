import { Entity } from "./Entity";
import type { DomainEvent } from "../events/DomainEvent";

// Ninguno de los 6 casos de uso aprobados de Laboratoire publica eventos
// (sin outbox ni suscriptor entre módulos en este alcance) — la capacidad
// queda disponible por paridad estructural, sin ninguna subclase de
// DomainEvent creada todavía (evita código especulativo).
export abstract class AggregateRoot<
  TId extends { equals(other: TId): boolean },
> extends Entity<TId> {
  private _domainEvents: DomainEvent<unknown>[] = [];

  protected addDomainEvent(event: DomainEvent<unknown>): void {
    this._domainEvents.push(event);
  }

  public pullDomainEvents(): DomainEvent<unknown>[] {
    const events = this._domainEvents;
    this._domainEvents = [];
    return events;
  }
}
