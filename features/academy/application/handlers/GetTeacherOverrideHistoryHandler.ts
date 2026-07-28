import type { GetTeacherOverrideHistoryQuery } from "../queries/GetTeacherOverrideHistoryQuery";
import type { TeacherOverrideResponseDto } from "../dto/TeacherOverrideDto";
import { validateGetTeacherOverrideHistoryRequest } from "../validators/queryValidators";
import type { AcademyReadModelPort } from "../ports/AcademyReadModelPort";
import { AcademyAuthorizationGuard } from "../services/AcademyAuthorizationGuard";
import { ForbiddenException } from "../exceptions/ForbiddenException";

// QRY-09 GetTeacherOverrideHistory — sin endpoint de API propio en el API
// Contract v1.3 vigente (Reconciliación Documental, R-04); Query
// invocable internamente (Application Layer Spec v1.0).
export class GetTeacherOverrideHistoryHandler {
  constructor(
    private readonly readModelPort: AcademyReadModelPort,
    private readonly authorizationGuard: AcademyAuthorizationGuard,
  ) {}

  public async handle(query: GetTeacherOverrideHistoryQuery): Promise<TeacherOverrideResponseDto[]> {
    const { request } = query;
    validateGetTeacherOverrideHistoryRequest(request);
    if (request.studentId) {
      await this.authorizationGuard.assertTeacherRelationship(request.teacherId, request.studentId);
    } else if (!request.unitId) {
      throw new ForbiddenException(
        "ACADEMY_FORBIDDEN_NO_TEACHER_RELATIONSHIP",
        "No es posible verificar la relación docente-estudiante sin unitId ni studentId.",
      );
    }
    return this.readModelPort.listTeacherOverrides(request.unitId, request.studentId);
  }
}
