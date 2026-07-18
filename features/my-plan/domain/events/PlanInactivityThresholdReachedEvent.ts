import { DomainEvent, type DomainEventMetadata } from "./DomainEvent";

// PLAN_INACTIVITY_THRESHOLD_REACHED — docs/modules/mi-plan.md, 2.9 / Vacío 3.
// Emisor: Servicio de reorganización automática (job, fuera de alcance de
// este sprint). La *decisión* de si el umbral se alcanzó sí es dominio
// puro — ver services/InactivityPolicy.ts — pero construir y despachar
// este evento a partir de esa decisión es responsabilidad del job
// (aplicación), no de este sprint de persistencia de dominio.
// Consumidores: Learning Planner, Coach IA (mensaje de reactivación).
export interface PlanInactivityThresholdReachedPayload {
  readonly studentId: string;
  readonly daysInactive: number;
}

export class PlanInactivityThresholdReachedEvent extends DomainEvent<PlanInactivityThresholdReachedPayload> {
  public readonly eventName = "PLAN_INACTIVITY_THRESHOLD_REACHED" as const;

  constructor(params: {
    aggregateId: string;
    payload: PlanInactivityThresholdReachedPayload;
    occurredAt?: Date;
    metadata?: DomainEventMetadata;
  }) {
    super(params);
  }
}
