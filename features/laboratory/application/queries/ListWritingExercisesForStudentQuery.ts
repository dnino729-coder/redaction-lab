export interface ListWritingExercisesForStudentRequestDto {
  readonly studentId: string;
  readonly mode?: string;
}

export class ListWritingExercisesForStudentQuery {
  private constructor(public readonly request: ListWritingExercisesForStudentRequestDto) {}

  public static fromRequest(
    request: ListWritingExercisesForStudentRequestDto,
  ): ListWritingExercisesForStudentQuery {
    return new ListWritingExercisesForStudentQuery(request);
  }
}
