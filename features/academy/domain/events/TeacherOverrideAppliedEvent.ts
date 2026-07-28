import { DomainEvent } from "./DomainEvent";

export interface TeacherOverrideAppliedEventPayload {
  teacherId: string; unitId: string; action: string; reason: string;
}

// Domain Event Frozen — Domain Model v1.1, catálogo de 13 eventos.
export class TeacherOverrideAppliedEvent extends DomainEvent<TeacherOverrideAppliedEventPayload> {
  public constructor(aggregateId: string, payload: TeacherOverrideAppliedEventPayload) {
    super("ACADEMY_TEACHER_OVERRIDE_APPLIED", aggregateId, payload);
  }
}
