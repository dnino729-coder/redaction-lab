// Clase base de los 5 Domain Events oficiales de Mi Plan
// (docs/modules/mi-plan.md, sección 2.9 / resolución 18.20.10). Cada
// evento concreto declara: `eventName` (nombre), `payload` (datos propios
// del evento), `occurredAt` (timestamp), `metadata` (información adicional
// no funcional) y `aggregateId` (identidad de la entidad que lo originó).
//
// Este archivo modela únicamente la *forma* del evento — no existe aquí
// ningún bus, cola, ni mecanismo de publicación: eso es infraestructura
// (el propio ARCHITECTURE.md documenta que el "Motor de Orquestación" que
// entregaría estos eventos aún no existe), explícitamente fuera de
// alcance de este sprint ("Domain Events: ... No implementar
// infraestructura de eventos. Solo el modelo de dominio.").
//
// **Política única de `occurredAt`** (cierre del hallazgo 2 de la
// auditoría del Sprint 3.3.2): `occurredAt` es siempre el instante de
// construcción del propio evento (por defecto `new Date()`, ver
// constructor). Ninguna entidad de este dominio pasa un valor explícito
// — antes de este cierre, `LearningTask` sí lo hacía (usaba
// `completedAt` como `occurredAt`) mientras que `LearningPlan` usaba el
// valor por defecto; ambos coincidían en la práctica porque 18.21 exige
// que `completed_at` sea siempre "el instante actual del servidor" en el
// momento de la transición, pero eran dos mecanismos distintos para el
// mismo resultado. Se unifica en uno solo. El parámetro `occurredAt`
// sigue existiendo en el constructor únicamente para permitir inyectar un
// valor fijo desde pruebas unitarias, no para que un emisor de dominio lo
// use en operación normal.
export interface DomainEventMetadata {
  readonly [key: string]: unknown;
}

export abstract class DomainEvent<TPayload = unknown> {
  public abstract readonly eventName: string;
  public readonly aggregateId: string;
  public readonly payload: TPayload;
  public readonly occurredAt: Date;
  public readonly metadata: DomainEventMetadata;

  protected constructor(params: {
    aggregateId: string;
    payload: TPayload;
    occurredAt?: Date;
    metadata?: DomainEventMetadata;
  }) {
    this.aggregateId = params.aggregateId;
    this.payload = params.payload;
    this.occurredAt = params.occurredAt ?? new Date();
    this.metadata = params.metadata ?? {};
  }
}
