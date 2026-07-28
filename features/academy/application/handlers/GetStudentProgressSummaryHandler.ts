import type { GetStudentProgressSummaryQuery } from "../queries/GetStudentProgressSummaryQuery";
import type { StudentProgressSummaryResponseDto } from "../dto/QueryDto";
import { validateGetStudentProgressSummaryRequest } from "../validators/queryValidators";
import type { AcademyReadModelPort } from "../ports/AcademyReadModelPort";
import { AcademyAuthorizationGuard } from "../services/AcademyAuthorizationGuard";

// QRY-07 GetStudentProgressSummary — Profesor, relación docente-estudiante
// verificada (A-10).
export class GetStudentProgressSummaryHandler {
  constructor(
    private readonly readModelPort: AcademyReadModelPort,
    private readonly authorizationGuard: AcademyAuthorizationGuard,
  ) {}

  public async handle(
    query: GetStudentProgressSummaryQuery,
  ): Promise<StudentProgressSummaryResponseDto> {
    const { request } = query;
    validateGetStudentProgressSummaryRequest(request);
    await this.authorizationGuard.assertTeacherRelationship(request.teacherId, request.studentId);
    return this.readModelPort.getStudentProgressSummary(request.studentId);
  }
}
