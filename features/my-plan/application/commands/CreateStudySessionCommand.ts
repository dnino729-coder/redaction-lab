import type { CreateStudySessionRequestDto } from "../dto/StudySessionDto";

export class CreateStudySessionCommand {
  private constructor(public readonly request: CreateStudySessionRequestDto) {}

  public static fromRequest(request: CreateStudySessionRequestDto): CreateStudySessionCommand {
    return new CreateStudySessionCommand(request);
  }
}
