import type { AutosaveExerciseDraftRequestDto } from "../dto/AutosaveExerciseDraftRequestDto";

export class AutosaveExerciseDraftCommand {
  private constructor(public readonly request: AutosaveExerciseDraftRequestDto) {}

  public static fromRequest(request: AutosaveExerciseDraftRequestDto): AutosaveExerciseDraftCommand {
    return new AutosaveExerciseDraftCommand(request);
  }
}
