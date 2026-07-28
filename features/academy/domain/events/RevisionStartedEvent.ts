import { DomainEvent } from "./DomainEvent";

export interface RevisionStartedEventPayload {
  attemptId: string; previousVersionId: string;
}

// Domain Event Frozen — Domain Model v1.1, catálogo de 13 eventos.
export class RevisionStartedEvent extends DomainEvent<RevisionStartedEventPayload> {
  public constructor(aggregateId: string, payload: RevisionStartedEventPayload) {
    super("ACADEMY_REVISION_STARTED", aggregateId, payload);
  }
}
