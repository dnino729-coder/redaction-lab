import type { UpdateLearningObjectiveRequestDto } from "../dto/LearningObjectiveDto";

export class UpdateLearningObjectiveCommand {
  private constructor(public readonly request: UpdateLearningObjectiveRequestDto) {}

  public static fromRequest(request: UpdateLearningObjectiveRequestDto): UpdateLearningObjectiveCommand {
    return new UpdateLearningObjectiveCommand(request);
  }
}
