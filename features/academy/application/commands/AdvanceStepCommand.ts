import type { AdvanceStepRequestDto } from "../dto/AttemptDto";

export class AdvanceStepCommand {
  private constructor(public readonly request: AdvanceStepRequestDto) {}

  public static fromRequest(request: AdvanceStepRequestDto): AdvanceStepCommand {
    return new AdvanceStepCommand(request);
  }
}
