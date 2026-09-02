export interface StartExerciseAttemptRequestDto {
  readonly exerciseId: string;
  readonly studentId: string;
}

export class StartExerciseAttemptCommand {
  private constructor(public readonly request: StartExerciseAttemptRequestDto) {}

  public static fromRequest(request: StartExerciseAttemptRequestDto): StartExerciseAttemptCommand {
    return new StartExerciseAttemptCommand(request);
  }
}
