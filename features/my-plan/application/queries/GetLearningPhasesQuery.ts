import type { GetLearningPhasesRequestDto } from "../dto/LearningPhaseDto";

export class GetLearningPhasesQuery {
  private constructor(public readonly request: GetLearningPhasesRequestDto) {}

  public static fromRequest(request: GetLearningPhasesRequestDto): GetLearningPhasesQuery {
    return new GetLearningPhasesQuery(request);
  }
}
