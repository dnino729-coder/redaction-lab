// Clase base de todo Domain Event de Academia — copia exacta del patrón
// ya en producción en features/my-plan/domain/events/DomainEvent.ts.
// Application Layer (Sprint 6.1) los recolecta vía
// AggregateRoot.pullDomainEvents() y los serializa al Outbox (Sprint 6.2)
// dentro de la misma transacción que persiste el Aggregate — nunca se
// publican directamente desde el dominio.
export abstract class DomainEvent<TPayload = Record<string, unknown>> {
  public readonly occurredAt: Date;

  protected constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly payload: TPayload,
    public readonly metadata: Record<string, unknown> = {},
  ) {
    this.occurredAt = new Date();
  }
}
