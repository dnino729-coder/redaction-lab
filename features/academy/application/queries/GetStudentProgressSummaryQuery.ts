import type { GetStudentProgressSummaryRequestDto } from "../dto/QueryDto";

export class GetStudentProgressSummaryQuery {
  private constructor(public readonly request: GetStudentProgressSummaryRequestDto) {}

  public static fromRequest(request: GetStudentProgressSummaryRequestDto): GetStudentProgressSummaryQuery {
    return new GetStudentProgressSummaryQuery(request);
  }
}
