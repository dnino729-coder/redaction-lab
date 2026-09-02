import { Entity } from "../shared/Entity";
import type { FeedbackId } from "../value-objects/FeedbackId";
import type { VersionId } from "../value-objects/VersionId";
import type { FeedbackObservation } from "../value-objects/FeedbackObservation";

// Entity (Domain Model v1.1, Sección 4) — retroalimentación formativa
// asociada 1:1 a la `Version` que evalúa (Coach IA o Profesor, CMD-04
// RecordFeedbackDelivered). Compuesta de 1..N `FeedbackObservation`
// (Persistence Layer v1.0 §1: tabla `feedback_observation`, colección de
// VOs). Se genera exactamente una vez por Version evaluada; nunca se
// edita a sí misma (A-05).
interface FeedbackProps {
  versionId: VersionId;
  observations: FeedbackObservation[];
  deliveredAt: Date;
}

export class Feedback extends Entity<FeedbackId> {
  private readonly props: FeedbackProps;

  private constructor(id: FeedbackId, props: FeedbackProps) {
    super(id);
    this.props = props;
  }

  public static create(params: {
    id: FeedbackId;
    versionId: VersionId;
    observations: FeedbackObservation[];
  }): Feedback {
    if (params.observations.length === 0) {
      throw new Error("Feedback: debe contener al menos una FeedbackObservation.");
    }
    return new Feedback(params.id, {
      versionId: params.versionId,
      observations: params.observations,
      deliveredAt: new Date(),
    });
  }

  public static reconstitute(params: {
    id: FeedbackId;
    versionId: VersionId;
    observations: FeedbackObservation[];
    deliveredAt: Date;
  }): Feedback {
    return new Feedback(params.id, {
      versionId: params.versionId,
      observations: params.observations,
      deliveredAt: params.deliveredAt,
    });
  }

  public get versionId(): VersionId {
    return this.props.versionId;
  }

  public get observations(): readonly FeedbackObservation[] {
    return this.props.observations;
  }

  public get deliveredAt(): Date {
    return this.props.deliveredAt;
  }
}
