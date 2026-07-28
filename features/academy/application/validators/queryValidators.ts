import { ValidationException } from "../exceptions/ValidationException";
import { TextType } from "@/features/academy/domain/enums/TextType";
import type {
  ListAcademyUnitsForStudentRequestDto,
  GetAcademyUnitDetailRequestDto,
  GetContinuationStateRequestDto,
  GetAttemptHistoryRequestDto,
  GetVersionFeedbackRequestDto,
  ListModelExamplesByTextTypeRequestDto,
  GetStudentProgressSummaryRequestDto,
  GetTeacherOverrideHistoryRequestDto,
  GetStudentUnitHistoryRequestDto,
} from "../dto/QueryDto";
import { requireUuid, requireOneOf, requireIntegerAtLeast, collectErrors } from "./primitives";

const TEXT_TYPES = Object.values(TextType);

export function validateListAcademyUnitsForStudentRequest(
  request: ListAcademyUnitsForStudentRequestDto,
): void {
  const errors = collectErrors(requireUuid(request.studentId, "studentId"));
  if (request.textType !== undefined) {
    const textTypeError = requireOneOf(request.textType, "textType", TEXT_TYPES);
    if (textTypeError !== null) errors.push(textTypeError);
  }
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_INVALID_UUID", errors);
}

// Sprint 6.3.2 (remediacion H-01): valida tambien `studentId` (ownership).
export function validateGetAcademyUnitDetailRequest(request: GetAcademyUnitDetailRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.unitId, "unitId"),
    requireUuid(request.studentId, "studentId"),
  );
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_INVALID_UUID", errors);
}

export function validateGetContinuationStateRequest(request: GetContinuationStateRequestDto): void {
  const errors = collectErrors(requireUuid(request.studentId, "studentId"));
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_INVALID_UUID", errors);
}

// Sprint 6.3.2 (remediacion H-01): valida tambien `studentId` (ownership).
export function validateGetAttemptHistoryRequest(request: GetAttemptHistoryRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.unitId, "unitId"),
    requireUuid(request.studentId, "studentId"),
  );
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_INVALID_UUID", errors);
}

// Sprint 6.3.2 (remediacion H-01): valida tambien `studentId` (ownership).
export function validateGetVersionFeedbackRequest(request: GetVersionFeedbackRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.attemptId, "attemptId"),
    requireIntegerAtLeast(request.versionNumber, "versionNumber", 1),
    requireUuid(request.studentId, "studentId"),
  );
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_MISSING_FIELD", errors);
}

export function validateListModelExamplesByTextTypeRequest(
  request: ListModelExamplesByTextTypeRequestDto,
): void {
  const textTypeError = requireOneOf(request.textType, "textType", TEXT_TYPES);
  if (textTypeError !== null) {
    throw new ValidationException("ACADEMY_VALIDATION_INVALID_TEXT_TYPE", [textTypeError]);
  }
}

export function validateGetStudentProgressSummaryRequest(
  request: GetStudentProgressSummaryRequestDto,
): void {
  const errors = collectErrors(
    requireUuid(request.studentId, "studentId"),
    requireUuid(request.teacherId, "teacherId"),
  );
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_INVALID_UUID", errors);
}

export function validateGetTeacherOverrideHistoryRequest(
  request: GetTeacherOverrideHistoryRequestDto,
): void {
  const errors = collectErrors(requireUuid(request.teacherId, "teacherId"));
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_INVALID_UUID", errors);
  if (request.unitId === undefined && request.studentId === undefined) {
    throw new ValidationException("ACADEMY_VALIDATION_MISSING_FIELD", [
      "al menos uno de unitId/studentId debe estar presente.",
    ]);
  }
}

export function validateGetStudentUnitHistoryRequest(request: GetStudentUnitHistoryRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.teacherId, "teacherId"),
    requireUuid(request.studentId, "studentId"),
    requireUuid(request.unitId, "unitId"),
  );
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_INVALID_UUID", errors);
}
