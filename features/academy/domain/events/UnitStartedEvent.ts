import { DomainEvent } from "./DomainEvent";

export interface UnitStartedEventPayload {
  studentId: string; unitId: string; attemptId: string;
}

// Domain Event Frozen — Domain Model v1.1, catálogo de 13 eventos.
export class UnitStartedEvent extends DomainEvent<UnitStartedEventPayload> {
  public constructor(aggregateId: string, payload: UnitStartedEventPayload) {
    super("ACADEMY_UNIT_STARTED", aggregateId, payload);
  }
}
