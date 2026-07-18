import { DomainEvent, type DomainEventMetadata } from "./DomainEvent";
import type { LearningTaskSource } from "../enums/LearningTaskSource";

// PLAN_TASK_COMPLETED — docs/modules/mi-plan.md, 2.9 / resolución 18.20.10.
// Emisor: Servicio de finalización de tareas (entidades: aquí,
// LearningTask.complete() / LearningTask.completeFromExternalEvent() —
// "Mi Plan emite el evento cada vez que una LearningTask pasa a
// completada, por cualquiera de las dos vías").
// Consumidores: Gamificación (decide XP/racha — Mi Plan nunca las
// calcula), Evolución (indirecto).
export interface PlanTaskCompletedPayload {
  readonly studentId: string;
  readonly learningTaskId: string;
  readonly source: LearningTaskSource;
}

export class PlanTaskCompletedEvent extends DomainEvent<PlanTaskCompletedPayload> {
  public readonly eventName = "PLAN_TASK_COMPLETED" as const;

  constructor(params: {
    aggregateId: string;
    payload: PlanTaskCompletedPayload;
    occurredAt?: Date;
    metadata?: DomainEventMetadata;
  }) {
    super(params);
  }
}
