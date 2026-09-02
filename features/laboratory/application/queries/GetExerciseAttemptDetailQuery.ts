export interface GetExerciseAttemptDetailRequestDto {
  readonly attemptId: string;
  readonly studentId: string;
}

export class GetExerciseAttemptDetailQuery {
  private constructor(public readonly request: GetExerciseAttemptDetailRequestDto) {}

  public static fromRequest(
    request: GetExerciseAttemptDetailRequestDto,
  ): GetExerciseAttemptDetailQuery {
    return new GetExerciseAttemptDetailQuery(request);
  }
}
