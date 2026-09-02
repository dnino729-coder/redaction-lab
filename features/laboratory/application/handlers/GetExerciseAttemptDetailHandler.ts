import type { LaboratoryExerciseReadModelPort } from "../ports/LaboratoryExerciseReadModelPort";
import type { GetExerciseAttemptDetailQuery } from "../queries/GetExerciseAttemptDetailQuery";
import type { ExerciseAttemptDetailResponseDto } from "../dto/ExerciseAttemptDetailResponseDto";
import { validateGetExerciseAttemptDetailRequest } from "../validators/writingExerciseValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";

export class GetExerciseAttemptDetailHandler {
  constructor(private readonly readModel: LaboratoryExerciseReadModelPort) {}

  public async handle(
    query: GetExerciseAttemptDetailQuery,
  ): Promise<ExerciseAttemptDetailResponseDto> {
    const { request } = query;
    validateGetExerciseAttemptDetailRequest(request);

    const attempt = await this.readModel.getAttemptDetail(request.attemptId, request.studentId);
    // Inexistente y "pertenece a otro estudiante" se tratan igual: nunca
    // revelar la existencia de un attempt ajeno (mismo criterio anti-BOLA
    // que AutosaveExerciseDraftHandler/CompleteExerciseAttemptHandler).
    if (!attempt) {
      throw new ResourceNotFoundException(
        "LABORATORY_NOT_FOUND_ATTEMPT",
        "ExerciseAttempt",
        request.attemptId,
      );
    }

    return {
      id: attempt.id,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status,
      wordCount: attempt.wordCount,
      startedAt: attempt.startedAt.toISOString(),
      completedAt: attempt.completedAt?.toISOString() ?? null,
      content: attempt.content,
    };
  }
}
