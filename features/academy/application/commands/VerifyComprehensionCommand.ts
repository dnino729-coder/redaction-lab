import type { VerifyComprehensionRequestDto } from "../dto/AttemptDto";

export class VerifyComprehensionCommand {
  private constructor(public readonly request: VerifyComprehensionRequestDto) {}

  public static fromRequest(request: VerifyComprehensionRequestDto): VerifyComprehensionCommand {
    return new VerifyComprehensionCommand(request);
  }
}
