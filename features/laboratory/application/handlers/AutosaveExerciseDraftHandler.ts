import type { ExerciseAttemptRepository } from "@/features/laboratory/domain/repositories/ExerciseAttemptRepository";
import type { WritingExerciseRepository } from "@/features/laboratory/domain/repositories/WritingExerciseRepository";
import { ExerciseAttemptId } from "@/features/laboratory/domain/value-objects/ExerciseAttemptId";
import type { ExerciseAttempt } from "@/features/laboratory/domain/aggregates/ExerciseAttempt";
import { InvalidExerciseAttemptTransitionException } from "@/features/laboratory/domain/exceptions";

import type { AutosaveExerciseDraftCommand } from "../commands/AutosaveExerciseDraftCommand";
import type { ExerciseAttemptDetailResponseDto } from "../dto/ExerciseAttemptDetailResponseDto";
import { validateAutosaveExerciseDraftRequest } from "../validators/writingExerciseValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import { ConflictException } from "../exceptions/ConflictException";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { Logger } from "../ports/Logger";

function toDetailDto(attempt: ExerciseAttempt): ExerciseAttemptDetailResponseDto {
  return {
    id: attempt.id.value,
    attemptNumber: attempt.attemptNumber.value,
    status: attempt.status,
    wordCount: attempt.wordCount.value,
    startedAt: attempt.startedAt.toISOString(),
    completedAt: attempt.completedAt?.toISOString() ?? null,
    content: attempt.content,
  };
}

export class AutosaveExerciseDraftHandler {
  constructor(
    private readonly exerciseAttemptRepository: ExerciseAttemptRepository,
    private readonly writingExerciseRepository: WritingExerciseRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly logger: Logger,
  ) {}

  public async handle(command: AutosaveExerciseDraftCommand): Promise<ExerciseAttemptDetailResponseDto> {
    const { request } = command;
    validateAutosaveExerciseDraftRequest(request);

    const attempt = await this.unitOfWork.execute(async () => {
      const existing = await this.exerciseAttemptRepository.findById(ExerciseAttemptId.create(request.attemptId));
      if (!existing) {
        throw new ResourceNotFoundException("LABORATORY_NOT_FOUND_ATTEMPT", "ExerciseAttempt", request.attemptId);
      }

      const exercise = await this.writingExerciseRepository.findById(existing.writingExerciseId);
      if (!exercise || exercise.studentId.value !== request.studentId) {
        throw new ResourceNotFoundException("LABORATORY_NOT_FOUND_ATTEMPT", "ExerciseAttempt", request.attemptId);
      }

      try {
        existing.saveDraft(request.content);
      } catch (error) {
        if (error instanceof InvalidExerciseAttemptTransitionException) {
          throw new ConflictException("LABORATORY_RULE_ATTEMPT_NOT_IN_PROGRESS", error.message);
        }
        throw error;
      }

      await this.exerciseAttemptRepository.save(existing);
      return existing;
    }, request.studentId);

    this.logger.info("AutosaveExerciseDraft completado", {
      attemptId: attempt.id.value,
      wordCount: attempt.wordCount.value,
    });
    return toDetailDto(attempt);
  }
}
