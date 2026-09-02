export interface GetExerciseAttemptHistoryRequestDto {
  readonly exerciseId: string;
  readonly studentId: string;
}

export class GetExerciseAttemptHistoryQuery {
  private constructor(public readonly request: GetExerciseAttemptHistoryRequestDto) {}

  public static fromRequest(request: GetExerciseAttemptHistoryRequestDto): GetExerciseAttemptHistoryQuery {
    return new GetExerciseAttemptHistoryQuery(request);
  }
}
