import type { GetStudentUnitHistoryRequestDto } from "../dto/QueryDto";

export class GetStudentUnitHistoryQuery {
  private constructor(public readonly request: GetStudentUnitHistoryRequestDto) {}

  public static fromRequest(request: GetStudentUnitHistoryRequestDto): GetStudentUnitHistoryQuery {
    return new GetStudentUnitHistoryQuery(request);
  }
}
