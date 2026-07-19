import type { GetDailyPlanRequestDto } from "../dto/DailyPlanDto";

export class GetDailyPlanQuery {
  private constructor(public readonly request: GetDailyPlanRequestDto) {}

  public static fromRequest(request: GetDailyPlanRequestDto): GetDailyPlanQuery {
    return new GetDailyPlanQuery(request);
  }
}
