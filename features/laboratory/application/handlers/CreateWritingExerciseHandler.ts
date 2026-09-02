import type { WritingExerciseRepository } from "@/features/laboratory/domain/repositories/WritingExerciseRepository";
import type { WritingExerciseFactory } from "@/features/laboratory/domain/factories/WritingExerciseFactory";
import type { WritingExercise } from "@/features/laboratory/domain/aggregates/WritingExercise";
import type { ExerciseMode } from "@/features/laboratory/domain/enums/ExerciseMode";
import type { WritingExerciseTextType } from "@/features/laboratory/domain/enums/WritingExerciseTextType";

import type { CreateWritingExerciseCommand } from "../commands/CreateWritingExerciseCommand";
import type { WritingExerciseResponseDto } from "../dto/WritingExerciseResponseDto";
import { validateCreateWritingExerciseRequest } from "../validators/writingExerciseValidators";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { UuidGenerator } from "../ports/UuidGenerator";
import type { Logger } from "../ports/Logger";

function toResponseDto(exercise: WritingExercise): WritingExerciseResponseDto {
  return {
    id: exercise.id.value,
    mode: exercise.mode,
    textType: exercise.textType,
    guidedPrompt: exercise.guidedPrompt?.value ?? null,
    status: "NOT_STARTED",
    createdAt: exercise.createdAt.toISOString(),
  };
}

export class CreateWritingExerciseHandler {
  constructor(
    private readonly writingExerciseRepository: WritingExerciseRepository,
    private readonly writingExerciseFactory: WritingExerciseFactory,
    private readonly unitOfWork: UnitOfWork,
    private readonly uuidGenerator: UuidGenerator,
    private readonly logger: Logger,
  ) {}

  public async handle(command: CreateWritingExerciseCommand): Promise<WritingExerciseResponseDto> {
    const { request } = command;
    validateCreateWritingExerciseRequest(request);

    const exercise = await this.unitOfWork.execute(async () => {
      const created = this.writingExerciseFactory.create({
        newId: () => this.uuidGenerator.generate(),
        studentId: request.studentId,
        mode: request.mode as ExerciseMode,
        textType: request.textType as WritingExerciseTextType,
        guidedPrompt: request.guidedPrompt ?? null,
      });
      await this.writingExerciseRepository.save(created);
      return created;
    }, request.studentId);

    this.logger.info("CreateWritingExercise completado", { exerciseId: exercise.id.value });
    return toResponseDto(exercise);
  }
}
