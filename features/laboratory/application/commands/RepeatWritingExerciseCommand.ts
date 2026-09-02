export interface RepeatWritingExerciseRequestDto {
  readonly exerciseId: string;
  readonly studentId: string;
}

export class RepeatWritingExerciseCommand {
  private constructor(public readonly request: RepeatWritingExerciseRequestDto) {}

  public static fromRequest(request: RepeatWritingExerciseRequestDto): RepeatWritingExerciseCommand {
    return new RepeatWritingExerciseCommand(request);
  }
}
