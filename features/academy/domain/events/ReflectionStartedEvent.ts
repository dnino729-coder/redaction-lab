import { DomainEvent } from "./DomainEvent";

export interface ReflectionStartedEventPayload {
  attemptId: string;
}

// Domain Event Frozen — Domain Model v1.1, catálogo de 13 eventos.
export class ReflectionStartedEvent extends DomainEvent<ReflectionStartedEventPayload> {
  public constructor(aggregateId: string, payload: ReflectionStartedEventPayload) {
    super("ACADEMY_REFLECTION_STARTED", aggregateId, payload);
  }
}
