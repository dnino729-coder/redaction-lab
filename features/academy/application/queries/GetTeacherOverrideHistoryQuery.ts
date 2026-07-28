import type { GetTeacherOverrideHistoryRequestDto } from "../dto/QueryDto";

export class GetTeacherOverrideHistoryQuery {
  private constructor(public readonly request: GetTeacherOverrideHistoryRequestDto) {}

  public static fromRequest(request: GetTeacherOverrideHistoryRequestDto): GetTeacherOverrideHistoryQuery {
    return new GetTeacherOverrideHistoryQuery(request);
  }
}
