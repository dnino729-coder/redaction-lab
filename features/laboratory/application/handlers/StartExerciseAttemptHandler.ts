import type { WritingExerciseRepository } from "@/features/laboratory/domain/repositories/WritingExerciseRepository";
import type { ExerciseAttemptRepository } from "@/features/laboratory/domain/repositories/ExerciseAttemptRepository";
import type { ExerciseAttemptFactory } from "@/features/laboratory/domain/factories/ExerciseAttemptFactory";
import { WritingExerciseId } from "@/features/laboratory/domain/value-objects/WritingExerciseId";
import type { ExerciseAttempt } from "@/features/laboratory/domain/aggregates/ExerciseAttempt";

import type { StartExerciseAttemptCommand } from "../commands/StartExerciseAttemptCommand";
import type { ExerciseAttemptDetailResponseDto } from "../dto/ExerciseAttemptDetailResponseDto";
import { validateStartExerciseAttemptRequest } from "../validators/writingExerciseValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import { ConflictException } from "../exceptions/ConflictException";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { UuidGenerator } from "../ports/UuidGenerator";
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

export class StartExerciseAttemptHandler {
  constructor(
    private readonly writingExerciseRepository: WritingExerciseRepository,
    private readonly exerciseAttemptRepository: ExerciseAttemptRepository,
    private readonly exerciseAttemptFactory: ExerciseAttemptFactory,
    private readonly unitOfWork: UnitOfWork,
    private readonly uuidGenerator: UuidGenerator,
    private readonly logger: Logger,
  ) {}

  public async handle(command: StartExerciseAttemptCommand): Promise<ExerciseAttemptDetailResponseDto> {
    const { request } = command;
    validateStartExerciseAttemptRequest(request);

    const attempt = await this.unitOfWork.execute(async () => {
      const exercise = await this.writingExerciseRepository.findById(WritingExerciseId.create(request.exerciseId));
      // Un ejercicio de otro estudiante se trata igual que uno inexistente
      // (nunca se revela su existencia — mismo criterio anti-BOLA que Academia).
      if (!exercise || exercise.studentId.value !== request.studentId) {
        throw new ResourceNotFoundException("LABORATORY_NOT_FOUND_EXERCISE", "WritingExercise", request.exerciseId);
      }

      const existingActive = await this.exerciseAttemptRepository.findActiveByExerciseId(exercise.id);
      if (existingActive) {
        throw new ConflictException(
          "LABORATORY_RULE_ATTEMPT_ALREADY_ACTIVE",
          `Ya existe un intento activo para el ejercicio "${request.exerciseId}".`,
        );
      }

      const nextAttemptNumber = await this.exerciseAttemptRepository.getNextAttemptNumber(exercise.id);
      const newAttempt = this.exerciseAttemptFactory.start({
        newId: () => this.uuidGenerator.generate(),
        writingExerciseId: exercise.id.value,
        attemptNumber: nextAttemptNumber,
      });
      await this.exerciseAttemptRepository.save(newAttempt);
      return newAttempt;
    }, request.studentId);

    this.logger.info("StartExerciseAttempt completado", {
      attemptId: attempt.id.value,
      exerciseId: request.exerciseId,
    });
    return toDetailDto(attempt);
  }
}
