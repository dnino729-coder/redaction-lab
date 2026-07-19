import type { CompleteLearningTaskRequestDto } from "../dto/LearningTaskDto";

export class CompleteLearningTaskCommand {
  private constructor(public readonly request: CompleteLearningTaskRequestDto) {}

  public static fromRequest(request: CompleteLearningTaskRequestDto): CompleteLearningTaskCommand {
    return new CompleteLearningTaskCommand(request);
  }
}
