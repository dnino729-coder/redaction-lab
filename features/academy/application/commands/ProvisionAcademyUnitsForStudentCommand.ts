import type { ProvisionAcademyUnitsForStudentRequestDto } from "../dto/AcademyUnitDto";

export class ProvisionAcademyUnitsForStudentCommand {
  private constructor(public readonly request: ProvisionAcademyUnitsForStudentRequestDto) {}

  public static fromRequest(request: ProvisionAcademyUnitsForStudentRequestDto): ProvisionAcademyUnitsForStudentCommand {
    return new ProvisionAcademyUnitsForStudentCommand(request);
  }
}
