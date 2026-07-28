import type { SubmitProductionRequestDto } from "../dto/VersionDto";

export class SubmitProductionCommand {
  private constructor(public readonly request: SubmitProductionRequestDto) {}

  public static fromRequest(request: SubmitProductionRequestDto): SubmitProductionCommand {
    return new SubmitProductionCommand(request);
  }
}
