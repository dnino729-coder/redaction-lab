import type { GetStudyScheduleRequestDto } from "../dto/StudyScheduleDto";

export class GetStudyScheduleQuery {
  private constructor(public readonly request: GetStudyScheduleRequestDto) {}

  public static fromRequest(request: GetStudyScheduleRequestDto): GetStudyScheduleQuery {
    return new GetStudyScheduleQuery(request);
  }
}
