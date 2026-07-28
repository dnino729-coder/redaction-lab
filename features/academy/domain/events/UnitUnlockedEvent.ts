import { DomainEvent } from "./DomainEvent";

export interface UnitUnlockedEventPayload {
  studentId: string; unitId: string;
}

// Domain Event Frozen — Domain Model v1.1, catálogo de 13 eventos.
export class UnitUnlockedEvent extends DomainEvent<UnitUnlockedEventPayload> {
  public constructor(aggregateId: string, payload: UnitUnlockedEventPayload) {
    super("ACADEMY_UNIT_UNLOCKED", aggregateId, payload);
  }
}
