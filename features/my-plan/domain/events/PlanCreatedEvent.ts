import { DomainEvent, type DomainEventMetadata } from "./DomainEvent";

// PLAN_CREATED — docs/modules/mi-plan.md, 2.9.
// Emisor: Servicio de creación de planes (entidades: aquí, LearningPlan.create()).
// Consumidores: Dashboard (indirecto, vía lectura), Notificaciones.
export interface PlanCreatedPayload {
  readonly studentId: string;
  readonly learningPlanId: string;
}

export class PlanCreatedEvent extends DomainEvent<PlanCreatedPayload> {
  public readonly eventName = "PLAN_CREATED" as const;

  constructor(params: {
    aggregateId: string;
    payload: PlanCreatedPayload;
    occurredAt?: Date;
    metadata?: DomainEventMetadata;
  }) {
    super(params);
  }
}
