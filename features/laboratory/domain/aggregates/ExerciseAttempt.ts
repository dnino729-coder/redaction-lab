import { AggregateRoot } from "../shared/AggregateRoot";
import type { ExerciseAttemptId } from "../value-objects/ExerciseAttemptId";
import type { WritingExerciseId } from "../value-objects/WritingExerciseId";
import type { AttemptNumber } from "../value-objects/AttemptNumber";
import { WordCount } from "../value-objects/WordCount";
import { ExerciseAttemptStatus } from "../enums/ExerciseAttemptStatus";
import { InvalidExerciseAttemptTransitionException } from "../exceptions";

export interface ExerciseAttemptProps {
  writingExerciseId: WritingExerciseId;
  attemptNumber: AttemptNumber;
  status: ExerciseAttemptStatus;
  content: string;
  wordCount: WordCount;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StartExerciseAttemptProps {
  id: ExerciseAttemptId;
  writingExerciseId: WritingExerciseId;
  attemptNumber: AttemptNumber;
}

export class ExerciseAttempt extends AggregateRoot<ExerciseAttemptId> {
  private props: ExerciseAttemptProps;

  private constructor(id: ExerciseAttemptId, props: ExerciseAttemptProps) {
    super(id);
    this.props = props;
  }

  public static start(input: StartExerciseAttemptProps): ExerciseAttempt {
    const now = new Date();
    return new ExerciseAttempt(input.id, {
      writingExerciseId: input.writingExerciseId,
      attemptNumber: input.attemptNumber,
      status: ExerciseAttemptStatus.IN_PROGRESS,
      content: "",
      wordCount: WordCount.zero(),
      startedAt: now,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(id: ExerciseAttemptId, props: ExerciseAttemptProps): ExerciseAttempt {
    return new ExerciseAttempt(id, props);
  }

  public saveDraft(content: string): void {
    if (this.props.status !== ExerciseAttemptStatus.IN_PROGRESS) {
      throw new InvalidExerciseAttemptTransitionException(this.id.value, this.props.status, "saveDraft");
    }
    this.props.content = content;
    this.props.wordCount = WordCount.fromContent(content);
    this.props.updatedAt = new Date();
  }

  public complete(): void {
    if (this.props.status !== ExerciseAttemptStatus.IN_PROGRESS) {
      throw new InvalidExerciseAttemptTransitionException(this.id.value, this.props.status, "complete");
    }
    const now = new Date();
    this.props.status = ExerciseAttemptStatus.COMPLETED;
    this.props.completedAt = now;
    this.props.updatedAt = now;
  }

  public get writingExerciseId(): WritingExerciseId {
    return this.props.writingExerciseId;
  }

  public get attemptNumber(): AttemptNumber {
    return this.props.attemptNumber;
  }

  public get status(): ExerciseAttemptStatus {
    return this.props.status;
  }

  public get content(): string {
    return this.props.content;
  }

  public get wordCount(): WordCount {
    return this.props.wordCount;
  }

  public get startedAt(): Date {
    return this.props.startedAt;
  }

  public get completedAt(): Date | null {
    return this.props.completedAt;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
