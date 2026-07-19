import type { ResumeLearningPlanRequestDto } from "../dto/LearningPlanDto";

export class ResumeLearningPlanCommand {
  private constructor(public readonly request: ResumeLearningPlanRequestDto) {}

  public static fromRequest(request: ResumeLearningPlanRequestDto): ResumeLearningPlanCommand {
    return new ResumeLearningPlanCommand(request);
  }
}
