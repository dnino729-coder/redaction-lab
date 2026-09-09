import type { FinishStudySessionRequestDto } from "../dto/StudySessionDto";

export class FinishStudySessionCommand {
  private constructor(public readonly request: FinishStudySessionRequestDto) {}

  public static fromRequest(request: FinishStudySessionRequestDto): FinishStudySessionCommand {
    return new FinishStudySessionCommand(request);
  }
}
