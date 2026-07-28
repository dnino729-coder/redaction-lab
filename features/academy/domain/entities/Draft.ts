import { Entity } from "../shared/Entity";
import { DraftId } from "../value-objects/DraftId";
import { DraftContent } from "../value-objects/DraftContent";

// Entity (Domain Model v1.1) — el borrador mutable, en curso, de un
// Attempt antes de convertirse en una Version inmutable al enviarse
// (CMD-04 SaveDraft / CMD-05 SubmitProduction). Un Attempt posee como
// máximo un Draft activo a la vez.
interface DraftProps {
  content: DraftContent;
  updatedAt: Date;
}

export class Draft extends Entity<DraftId> {
  private props: DraftProps;

  private constructor(id: DraftId, props: DraftProps) {
    super(id);
    this.props = props;
  }

  public static create(params: { id: DraftId; content: DraftContent }): Draft {
    return new Draft(params.id, { content: params.content, updatedAt: new Date() });
  }

  public static reconstitute(params: {
    id: DraftId;
    content: DraftContent;
    updatedAt: Date;
  }): Draft {
    return new Draft(params.id, {
      content: params.content,
      updatedAt: params.updatedAt,
    });
  }

  public updateContent(content: DraftContent): void {
    this.props.content = content;
    this.props.updatedAt = new Date();
  }

  public get content(): DraftContent {
    return this.props.content;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
