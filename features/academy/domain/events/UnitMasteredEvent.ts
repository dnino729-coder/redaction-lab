import { DomainEvent } from "./DomainEvent";

export interface UnitMasteredEventPayload {
  studentId: string;
  unitId: string;
}

// Domain Event Frozen — Domain Model v1.1, Sección 10: "Señalar dominio
// sostenido, sin efecto sobre Mi Plan" (consumido por Gamificación,
// Dashboard, Competencias).
export class UnitMasteredEvent extends DomainEvent<UnitMasteredEventPayload> {
  public constructor(aggregateId: string, payload: UnitMasteredEventPayload) {
    super("ACADEMY_UNIT_MASTERED", aggregateId, payload);
  }
}
