import { ValidationException } from "../exceptions/ValidationException";
import type { ProvisionAcademyUnitsForStudentRequestDto, EvaluateMasteryRequestDto } from "../dto/AcademyUnitDto";
import { requireUuid, collectErrors } from "./primitives";

export function validateProvisionAcademyUnitsForStudentRequest(
  request: ProvisionAcademyUnitsForStudentRequestDto,
): void {
  const errors = collectErrors(requireUuid(request.studentId, "studentId"));
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_INVALID_UUID", errors);
}

export function validateEvaluateMasteryRequest(request: EvaluateMasteryRequestDto): void {
  const errors = collectErrors(requireUuid(request.unitId, "unitId"));
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_INVALID_UUID", errors);
}
