import type { CreateWritingExerciseRequestDto } from "../dto/CreateWritingExerciseRequestDto";

export class CreateWritingExerciseCommand {
  private constructor(public readonly request: CreateWritingExerciseRequestDto) {}

  public static fromRequest(request: CreateWritingExerciseRequestDto): CreateWritingExerciseCommand {
    return new CreateWritingExerciseCommand(request);
  }
}
