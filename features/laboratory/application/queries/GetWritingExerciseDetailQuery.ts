export interface GetWritingExerciseDetailRequestDto {
  readonly exerciseId: string;
  readonly studentId: string;
}

export class GetWritingExerciseDetailQuery {
  private constructor(public readonly request: GetWritingExerciseDetailRequestDto) {}

  public static fromRequest(request: GetWritingExerciseDetailRequestDto): GetWritingExerciseDetailQuery {
    return new GetWritingExerciseDetailQuery(request);
  }
}
