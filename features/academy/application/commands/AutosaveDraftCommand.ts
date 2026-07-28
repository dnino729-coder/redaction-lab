import type { AutosaveDraftRequestDto } from "../dto/DraftDto";

export class AutosaveDraftCommand {
  private constructor(public readonly request: AutosaveDraftRequestDto) {}

  public static fromRequest(request: AutosaveDraftRequestDto): AutosaveDraftCommand {
    return new AutosaveDraftCommand(request);
  }
}
