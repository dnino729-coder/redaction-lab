import type { GetWeeklyPlanRequestDto } from "../dto/WeeklyPlanDto";

export class GetWeeklyPlanQuery {
  private constructor(public readonly request: GetWeeklyPlanRequestDto) {}

  public static fromRequest(request: GetWeeklyPlanRequestDto): GetWeeklyPlanQuery {
    return new GetWeeklyPlanQuery(request);
  }
}
