import type { RepeatUnitRequestDto } from "../dto/AttemptDto";

export class RepeatUnitCommand {
  private constructor(public readonly request: RepeatUnitRequestDto) {}

  public static fromRequest(request: RepeatUnitRequestDto): RepeatUnitCommand {
    return new RepeatUnitCommand(request);
  }
}
