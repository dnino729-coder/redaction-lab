import type { CompleteReflectionRequestDto } from "../dto/AttemptDto";

export class CompleteReflectionCommand {
  private constructor(public readonly request: CompleteReflectionRequestDto) {}

  public static fromRequest(request: CompleteReflectionRequestDto): CompleteReflectionCommand {
    return new CompleteReflectionCommand(request);
  }
}
