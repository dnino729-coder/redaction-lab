import { Entity } from "../shared/Entity";
import type { VersionId } from "../value-objects/VersionId";
import type { VersionNumber } from "../value-objects/VersionNumber";
import type { DraftContent } from "../value-objects/DraftContent";
import type { Feedback } from "./Feedback";

// Entity (Domain Model v1.1, Sección 4) — snapshot inmutable de una
// Producción (RN-5: "no se permite modificar una versión ya enviada").
// Relación 1:1 opcional con `Feedback` (Persistence Layer v1.0 §3.2) —
// una Version recién creada no tiene Feedback hasta que CMD-04 la
// registra.
interface VersionProps {
  number: VersionNumber;
  content: DraftContent;
  submittedAt: Date;
  feedback: Feedback | null;
}

export class Version extends Entity<VersionId> {
  private props: VersionProps;

  private constructor(id: VersionId, props: VersionProps) {
    super(id);
    this.props = props;
  }

  public static create(params: {
    id: VersionId;
    number: VersionNumber;
    content: DraftContent;
  }): Version {
    return new Version(params.id, {
      number: params.number,
      content: params.content,
      submittedAt: new Date(),
      feedback: null,
    });
  }

  public static reconstitute(params: {
    id: VersionId;
    number: VersionNumber;
    content: DraftContent;
    submittedAt: Date;
    feedback: Feedback | null;
  }): Version {
    return new Version(params.id, {
      number: params.number,
      content: params.content,
      submittedAt: params.submittedAt,
      feedback: params.feedback,
    });
  }

  /** Invocado exclusivamente por `Attempt.recordFeedback()` (Tell-Don't-Ask,
   * H-02) — nunca por Application Layer directamente. */
  public attachFeedback(feedback: Feedback): void {
    if (this.props.feedback !== null) {
      throw new Error(
        `Version: la versión "${this.id.value}" ya tiene una Feedback registrada (RN-3: 1:1).`,
      );
    }
    this.props.feedback = feedback;
  }

  public hasFeedback(): boolean {
    return this.props.feedback !== null;
  }

  public get number(): VersionNumber {
    return this.props.number;
  }

  public get content(): DraftContent {
    return this.props.content;
  }

  public get submittedAt(): Date {
    return this.props.submittedAt;
  }

  public get feedback(): Feedback | null {
    return this.props.feedback;
  }
}
