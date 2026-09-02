import type { GetStudentUnitHistoryQuery } from "../queries/GetStudentUnitHistoryQuery";
import type { StudentUnitHistoryResponseDto } from "../dto/QueryDto";
import { validateGetStudentUnitHistoryRequest } from "../validators/queryValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import type { AcademyReadModelPort } from "../ports/AcademyReadModelPort";
import type { AcademyAuthorizationGuard } from "../services/AcademyAuthorizationGuard";

// QRY-10 GetStudentUnitHistory (CU-12) — Profesor, relación
// docente-estudiante verificada.
export class GetStudentUnitHistoryHandler {
  constructor(
    private readonly readModelPort: AcademyReadModelPort,
    private readonly authorizationGuard: AcademyAuthorizationGuard,
  ) {}

  public async handle(query: GetStudentUnitHistoryQuery): Promise<StudentUnitHistoryResponseDto> {
    const { request } = query;
    validateGetStudentUnitHistoryRequest(request);
    await this.authorizationGuard.assertTeacherRelationship(request.teacherId, request.studentId);

    const history = await this.readModelPort.getStudentUnitHistory(request.studentId, request.unitId);
    if (!history) {
      throw new ResourceNotFoundException("ACADEMY_NOT_FOUND_UNIT", "AcademyUnit", request.unitId);
    }
    return history;
  }
}
