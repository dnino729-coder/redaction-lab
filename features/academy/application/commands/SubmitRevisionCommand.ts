import type { SubmitRevisionRequestDto } from "../dto/VersionDto";

export class SubmitRevisionCommand {
  private constructor(public readonly request: SubmitRevisionRequestDto) {}

  public static fromRequest(request: SubmitRevisionRequestDto): SubmitRevisionCommand {
    return new SubmitRevisionCommand(request);
  }
}
