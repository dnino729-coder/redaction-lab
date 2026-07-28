import type { AdvanceToReflectionRequestDto } from "../dto/AttemptDto";

export class AdvanceToReflectionCommand {
  private constructor(public readonly request: AdvanceToReflectionRequestDto) {}

  public static fromRequest(request: AdvanceToReflectionRequestDto): AdvanceToReflectionCommand {
    return new AdvanceToReflectionCommand(request);
  }
}
