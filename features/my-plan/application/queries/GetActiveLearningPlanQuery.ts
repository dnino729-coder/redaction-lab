import type { GetActiveLearningPlanRequestDto } from "../dto/LearningPlanDto";

export class GetActiveLearningPlanQuery {
  private constructor(public readonly request: GetActiveLearningPlanRequestDto) {}

  public static fromRequest(request: GetActiveLearningPlanRequestDto): GetActiveLearningPlanQuery {
    return new GetActiveLearningPlanQuery(request);
  }
}
