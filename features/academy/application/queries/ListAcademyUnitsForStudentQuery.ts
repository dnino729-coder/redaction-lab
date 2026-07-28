import type { ListAcademyUnitsForStudentRequestDto } from "../dto/QueryDto";

export class ListAcademyUnitsForStudentQuery {
  private constructor(public readonly request: ListAcademyUnitsForStudentRequestDto) {}

  public static fromRequest(request: ListAcademyUnitsForStudentRequestDto): ListAcademyUnitsForStudentQuery {
    return new ListAcademyUnitsForStudentQuery(request);
  }
}
