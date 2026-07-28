import type { StartUnitRequestDto } from "../dto/AttemptDto";

export class StartUnitCommand {
  private constructor(public readonly request: StartUnitRequestDto) {}

  public static fromRequest(request: StartUnitRequestDto): StartUnitCommand {
    return new StartUnitCommand(request);
  }
}
