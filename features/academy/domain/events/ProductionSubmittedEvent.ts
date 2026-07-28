import { DomainEvent } from "./DomainEvent";

export interface ProductionSubmittedEventPayload {
  attemptId: string; unitId: string; versionId: string; versionNumber: number;
}

// Domain Event Frozen — Domain Model v1.1, catálogo de 13 eventos.
export class ProductionSubmittedEvent extends DomainEvent<ProductionSubmittedEventPayload> {
  public constructor(aggregateId: string, payload: ProductionSubmittedEventPayload) {
    super("ACADEMY_PRODUCTION_SUBMITTED", aggregateId, payload);
  }
}
