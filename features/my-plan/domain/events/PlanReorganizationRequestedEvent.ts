import { DomainEvent, type DomainEventMetadata } from "./DomainEvent";
import type { ReprogrammingReason } from "../enums/ReprogrammingReason";

// PLAN_REORGANIZATION_REQUESTED — docs/modules/mi-plan.md, 2.9 / Vacío 2.
// Emisor: Servicio de reprogramación (servicio de aplicación, fuera de
// alcance de este sprint — este archivo solo define la forma del evento,
// para que ese servicio futuro lo construya).
// Consumidor: Learning Planner.
export interface PlanReorganizationRequestedPayload {
  readonly studentId: string;
  readonly learningPlanId: string;
  readonly reason: ReprogrammingReason;
}

export class PlanReorganizationRequestedEvent extends DomainEvent<PlanReorganizationRequestedPayload> {
  public readonly eventName = "PLAN_REORGANIZATION_REQUESTED" as const;

  constructor(params: {
    aggregateId: string;
    payload: PlanReorganizationRequestedPayload;
    occurredAt?: Date;
    metadata?: DomainEventMetadata;
  }) {
    super(params);
  }
}
