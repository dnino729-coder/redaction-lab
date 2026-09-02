export interface CompleteExerciseAttemptRequestDto {
  readonly attemptId: string;
  readonly studentId: string;
}

export class CompleteExerciseAttemptCommand {
  private constructor(public readonly request: CompleteExerciseAttemptRequestDto) {}

  public static fromRequest(request: CompleteExerciseAttemptRequestDto): CompleteExerciseAttemptCommand {
    return new CompleteExerciseAttemptCommand(request);
  }
}
