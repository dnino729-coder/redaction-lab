import { DomainEvent } from "./DomainEvent";

export interface ExternalActivityCompletedEventPayload {
  studentId: string; unitId: string; activityRef: string;
}

// Domain Event Frozen — Domain Model v1.1, catálogo de 13 eventos.
export class ExternalActivityCompletedEvent extends DomainEvent<ExternalActivityCompletedEventPayload> {
  public constructor(aggregateId: string, payload: ExternalActivityCompletedEventPayload) {
    super("ACADEMY_EXTERNAL_ACTIVITY_COMPLETED", aggregateId, payload);
  }
}
