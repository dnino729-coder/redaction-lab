import type { UpdateStudyScheduleRequestDto } from "../dto/StudyScheduleDto";

export class UpdateStudyScheduleCommand {
  private constructor(public readonly request: UpdateStudyScheduleRequestDto) {}

  public static fromRequest(request: UpdateStudyScheduleRequestDto): UpdateStudyScheduleCommand {
    return new UpdateStudyScheduleCommand(request);
  }
}
