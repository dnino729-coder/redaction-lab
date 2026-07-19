import type { GetLearningProgressRequestDto } from "../dto/LearningProgressDto";

export class GetLearningProgressQuery {
  private constructor(public readonly request: GetLearningProgressRequestDto) {}

  public static fromRequest(request: GetLearningProgressRequestDto): GetLearningProgressQuery {
    return new GetLearningProgressQuery(request);
  }
}
