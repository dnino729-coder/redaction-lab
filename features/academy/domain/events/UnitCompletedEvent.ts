import { DomainEvent } from "./DomainEvent";

export interface UnitCompletedEventPayload {
  studentId: string; unitId: string; attemptId: string;
}

// Domain Event Frozen — Domain Model v1.1, catálogo de 13 eventos.
export class UnitCompletedEvent extends DomainEvent<UnitCompletedEventPayload> {
  public constructor(aggregateId: string, payload: UnitCompletedEventPayload) {
    super("ACADEMY_UNIT_COMPLETED", aggregateId, payload);
  }
}
