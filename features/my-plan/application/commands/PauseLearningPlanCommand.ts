import type { PauseLearningPlanRequestDto } from "../dto/LearningPlanDto";

export class PauseLearningPlanCommand {
  private constructor(public readonly request: PauseLearningPlanRequestDto) {}

  public static fromRequest(request: PauseLearningPlanRequestDto): PauseLearningPlanCommand {
    return new PauseLearningPlanCommand(request);
  }
}
