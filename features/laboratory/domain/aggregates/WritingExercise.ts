import { AggregateRoot } from "../shared/AggregateRoot";
import type { WritingExerciseId } from "../value-objects/WritingExerciseId";
import type { StudentId } from "../value-objects/StudentId";
import type { GuidedPrompt } from "../value-objects/GuidedPrompt";
import { ExerciseMode } from "../enums/ExerciseMode";
import type { WritingExerciseTextType } from "../enums/WritingExerciseTextType";

export interface WritingExerciseProps {
  studentId: StudentId;
  mode: ExerciseMode;
  textType: WritingExerciseTextType;
  guidedPrompt: GuidedPrompt | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWritingExerciseProps {
  id: WritingExerciseId;
  studentId: StudentId;
  mode: ExerciseMode;
  textType: WritingExerciseTextType;
  guidedPrompt: GuidedPrompt | null;
}

export class WritingExercise extends AggregateRoot<WritingExerciseId> {
  private props: WritingExerciseProps;

  private constructor(id: WritingExerciseId, props: WritingExerciseProps) {
    super(id);
    this.props = props;
  }

  public static create(input: CreateWritingExerciseProps): WritingExercise {
    if (input.mode === ExerciseMode.GUIDED && input.guidedPrompt === null) {
      throw new Error("WritingExercise: guidedPrompt es obligatorio cuando mode = GUIDED.");
    }
    if (input.mode === ExerciseMode.AUTONOMOUS && input.guidedPrompt !== null) {
      throw new Error("WritingExercise: guidedPrompt no aplica cuando mode = AUTONOMOUS.");
    }

    const now = new Date();
    return new WritingExercise(input.id, {
      studentId: input.studentId,
      mode: input.mode,
      textType: input.textType,
      guidedPrompt: input.guidedPrompt,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(id: WritingExerciseId, props: WritingExerciseProps): WritingExercise {
    return new WritingExercise(id, props);
  }

  public get studentId(): StudentId {
    return this.props.studentId;
  }

  public get mode(): ExerciseMode {
    return this.props.mode;
  }

  public get textType(): WritingExerciseTextType {
    return this.props.textType;
  }

  public get guidedPrompt(): GuidedPrompt | null {
    return this.props.guidedPrompt;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
