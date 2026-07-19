import type { CancelLearningPlanRequestDto } from "../dto/LearningPlanDto";

export class CancelLearningPlanCommand {
  private constructor(public readonly request: CancelLearningPlanRequestDto) {}

  public static fromRequest(request: CancelLearningPlanRequestDto): CancelLearningPlanCommand {
    return new CancelLearningPlanCommand(request);
  }
}
