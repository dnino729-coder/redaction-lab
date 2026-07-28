import { DomainEvent } from "./DomainEvent";

export interface FeedbackRequestedEventPayload {
  attemptId: string; versionId: string;
}

// Domain Event Frozen — Domain Model v1.1, catálogo de 13 eventos.
export class FeedbackRequestedEvent extends DomainEvent<FeedbackRequestedEventPayload> {
  public constructor(aggregateId: string, payload: FeedbackRequestedEventPayload) {
    super("ACADEMY_FEEDBACK_REQUESTED", aggregateId, payload);
  }
}
