import { DomainEvent, type DomainEventMetadata } from "./DomainEvent";
import type { ExternalActivitySource } from "../enums/LearningTaskSource";

// EXTERNAL_ACTIVITY_COMPLETED — docs/modules/mi-plan.md, 2.9 / Vacío 5.
// Emisor: Academia / Laboratorio / Entrenamiento / Simulador (ecosistemas
// externos a Mi Plan, fuera de alcance de este sprint).
// Consumidor: Servicio de finalización de tareas — que, al recibirlo,
// invoca `LearningTask.completeFromExternalEvent()` sobre la tarea
// referenciada (si `learningTaskId` aplica).
export interface ExternalActivityCompletedPayload {
  readonly studentId: string;
  readonly learningTaskId: string | null;
  readonly activityType: ExternalActivitySource;
}

export class ExternalActivityCompletedEvent extends DomainEvent<ExternalActivityCompletedPayload> {
  public readonly eventName = "EXTERNAL_ACTIVITY_COMPLETED" as const;

  constructor(params: {
    aggregateId: string;
    payload: ExternalActivityCompletedPayload;
    occurredAt?: Date;
    metadata?: DomainEventMetadata;
  }) {
    super(params);
  }
}
