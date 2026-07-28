import { DomainEvent } from "./DomainEvent";

export interface ReflectionCompletedEventPayload {
  attemptId: string; unitId: string; studentId: string; comprehensionVerified: boolean;
}

// Domain Event Frozen — Domain Model v1.1, catálogo de 13 eventos.
export class ReflectionCompletedEvent extends DomainEvent<ReflectionCompletedEventPayload> {
  public constructor(aggregateId: string, payload: ReflectionCompletedEventPayload) {
    super("ACADEMY_REFLECTION_COMPLETED", aggregateId, payload);
  }
}
