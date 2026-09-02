import { Entity } from "./Entity";
import type { DomainEvent } from "../events/DomainEvent";

// Raíz de agregado — extiende `Entity` añadiendo la capacidad de acumular
// Domain Events durante la ejecución de su propio comportamiento. Nunca
// los publica ni los envía a ningún bus — eso es responsabilidad de
// infraestructura (Sprint 6.2, Outbox). Domain Model v1.1, Sección 3:
// solo `AcademyUnit` y `Attempt` son Aggregate Roots que emiten eventos;
// `ModelExample` también extiende esta clase por ser Aggregate Root
// (Domain Model v1.1, AR-3), aunque en la práctica nunca acumula eventos
// (sin Domain Event definido para su ciclo editorial).
//
// Nota técnica: `addDomainEvent`/`pullDomainEvents` usan `DomainEvent<unknown>`
// (no el `DomainEvent` desnudo, que resolvería a
// `DomainEvent<Record<string, unknown>>` por el default del parámetro de
// tipo) porque cada evento concreto declara su propio `Payload` con
// forma cerrada (sin index signature); exigir esa index signature en el
// tipo del parámetro rompería la asignabilidad de todo evento concreto.
// `unknown` (a diferencia de `any`) preserva la verificación de tipos en
// el resto del archivo y sigue aceptando cualquier `DomainEvent<X>`
// concreto, porque `X` siempre es asignable a `unknown`.
export abstract class AggregateRoot<
  TId extends { equals(other: TId): boolean },
> extends Entity<TId> {
  private _domainEvents: DomainEvent<unknown>[] = [];

  protected addDomainEvent(event: DomainEvent<unknown>): void {
    this._domainEvents.push(event);
  }

  /** Extrae y limpia los Domain Events acumulados — Application Layer
   * (Sprint 6.1) los lee tras cada operación y los despacha al Outbox
   * (Sprint 6.2), dentro de la misma transacción que persiste el Aggregate. */
  public pullDomainEvents(): DomainEvent<unknown>[] {
    const events = this._domainEvents;
    this._domainEvents = [];
    return events;
  }
}
