import type { LaboratoryExerciseReadModelPort } from "../ports/LaboratoryExerciseReadModelPort";
import type { GetExerciseAttemptHistoryQuery } from "../queries/GetExerciseAttemptHistoryQuery";
import type { ExerciseHistoryResponseDto } from "../dto/ExerciseHistoryResponseDto";
import { validateGetExerciseAttemptHistoryRequest } from "../validators/writingExerciseValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";

export class GetExerciseAttemptHistoryHandler {
  constructor(private readonly readModel: LaboratoryExerciseReadModelPort) {}

  public async handle(query: GetExerciseAttemptHistoryQuery): Promise<ExerciseHistoryResponseDto> {
    const { request } = query;
    validateGetExerciseAttemptHistoryRequest(request);

    const detail = await this.readModel.getExerciseDetail(request.exerciseId, request.studentId);
    if (!detail) {
      throw new ResourceNotFoundException("LABORATORY_NOT_FOUND_EXERCISE", "WritingExercise", request.exerciseId);
    }
    const attempts = await this.readModel.getAttemptHistory(request.exerciseId, request.studentId);

    return {
      exercise: {
        id: detail.id,
        mode: detail.mode,
        textType: detail.textType,
        guidedPrompt: detail.guidedPrompt,
        status: detail.status,
        createdAt: detail.createdAt.toISOString(),
      },
      attempts: attempts.map((attempt) => ({
        id: attempt.id,
        attemptNumber: attempt.attemptNumber,
        status: attempt.status,
        wordCount: attempt.wordCount,
        startedAt: attempt.startedAt.toISOString(),
        completedAt: attempt.completedAt?.toISOString() ?? null,
      })),
    };
  }
}
