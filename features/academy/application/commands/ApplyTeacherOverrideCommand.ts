import type { ApplyTeacherOverrideRequestDto } from "../dto/TeacherOverrideDto";

export class ApplyTeacherOverrideCommand {
  private constructor(public readonly request: ApplyTeacherOverrideRequestDto) {}

  public static fromRequest(request: ApplyTeacherOverrideRequestDto): ApplyTeacherOverrideCommand {
    return new ApplyTeacherOverrideCommand(request);
  }
}
