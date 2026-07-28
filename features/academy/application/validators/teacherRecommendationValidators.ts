import { ValidationException } from "../exceptions/ValidationException";
import type { AssignUnitToStudentRequestDto } from "../dto/TeacherRecommendationDto";
import { requireUuid, collectErrors } from "./primitives";

export function validateAssignUnitToStudentRequest(request: AssignUnitToStudentRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.unitId, "unitId"),
    requireUuid(request.studentId, "studentId"),
    requireUuid(request.teacherId, "teacherId"),
  );
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_INVALID_UUID", errors);
}
