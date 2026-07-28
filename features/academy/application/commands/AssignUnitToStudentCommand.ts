import type { AssignUnitToStudentRequestDto } from "../dto/TeacherRecommendationDto";

export class AssignUnitToStudentCommand {
  private constructor(public readonly request: AssignUnitToStudentRequestDto) {}

  public static fromRequest(request: AssignUnitToStudentRequestDto): AssignUnitToStudentCommand {
    return new AssignUnitToStudentCommand(request);
  }
}
