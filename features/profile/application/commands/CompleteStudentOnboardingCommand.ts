import type { CompleteStudentOnboardingRequestDto } from "../dto/CompleteStudentOnboardingDto";

export class CompleteStudentOnboardingCommand {
  private constructor(public readonly request: CompleteStudentOnboardingRequestDto) {}

  public static fromRequest(
    request: CompleteStudentOnboardingRequestDto,
  ): CompleteStudentOnboardingCommand {
    return new CompleteStudentOnboardingCommand(request);
  }
}
