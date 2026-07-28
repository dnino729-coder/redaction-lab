import { DomainEvent } from "./DomainEvent";

export interface UnitRepeatedEventPayload {
  studentId: string; unitId: string; newAttemptId: string;
}

// Domain Event Frozen — Domain Model v1.1, catálogo de 13 eventos.
export class UnitRepeatedEvent extends DomainEvent<UnitRepeatedEventPayload> {
  public constructor(aggregateId: string, payload: UnitRepeatedEventPayload) {
    super("ACADEMY_UNIT_REPEATED", aggregateId, payload);
  }
}
