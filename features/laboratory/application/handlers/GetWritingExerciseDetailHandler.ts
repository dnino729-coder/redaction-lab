import type { LaboratoryExerciseReadModelPort } from "../ports/LaboratoryExerciseReadModelPort";
import type { GetWritingExerciseDetailQuery } from "../queries/GetWritingExerciseDetailQuery";
import type { WritingExerciseResponseDto } from "../dto/WritingExerciseResponseDto";
import { validateGetWritingExerciseDetailRequest } from "../validators/writingExerciseValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";

export class GetWritingExerciseDetailHandler {
  constructor(private readonly readModel: LaboratoryExerciseReadModelPort) {}

  public async handle(query: GetWritingExerciseDetailQuery): Promise<WritingExerciseResponseDto> {
    const { request } = query;
    validateGetWritingExerciseDetailRequest(request);

    const detail = await this.readModel.getExerciseDetail(request.exerciseId, request.studentId);
    if (!detail) {
      throw new ResourceNotFoundException("LABORATORY_NOT_FOUND_EXERCISE", "WritingExercise", request.exerciseId);
    }

    return {
      id: detail.id,
      mode: detail.mode,
      textType: detail.textType,
      guidedPrompt: detail.guidedPrompt,
      status: detail.status,
      createdAt: detail.createdAt.toISOString(),
    };
  }
}
