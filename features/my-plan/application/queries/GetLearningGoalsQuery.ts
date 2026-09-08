import type { GetLearningGoalsRequestDto } from "../dto/LearningGoalDto";

export class GetLearningGoalsQuery {
  private constructor(public readonly request: GetLearningGoalsRequestDto) {}

  public static fromRequest(request: GetLearningGoalsRequestDto): GetLearningGoalsQuery {
    return new GetLearningGoalsQuery(request);
  }
}
