import { DomainEvent } from "./DomainEvent";

export interface FeedbackDeliveredEventPayload {
  attemptId: string;
  versionId: string;
  feedbackId: string;
}

// Domain Event Frozen — Domain Model v1.1, Sección 10: "Habilitar el paso
// Reescribir" (consumido por el Estudiante vía Dashboard/notificación,
// Competencias/Learning Analytics).
export class FeedbackDeliveredEvent extends DomainEvent<FeedbackDeliveredEventPayload> {
  public constructor(aggregateId: string, payload: FeedbackDeliveredEventPayload) {
    super("ACADEMY_FEEDBACK_DELIVERED", aggregateId, payload);
  }
}
