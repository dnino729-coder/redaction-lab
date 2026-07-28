import { ValidationException } from "../exceptions/ValidationException";
import type {
  StartUnitRequestDto,
  AdvanceStepRequestDto,
  VerifyComprehensionRequestDto,
  AdvanceToReflectionRequestDto,
  CompleteReflectionRequestDto,
  RepeatUnitRequestDto,
} from "../dto/AttemptDto";
import type { AutosaveDraftRequestDto } from "../dto/DraftDto";
import type { SubmitProductionRequestDto, SubmitRevisionRequestDto } from "../dto/VersionDto";
import {
  requireUuid,
  requireNonEmptyString,
  requireString,
  requirePresent,
  requireNonEmptyArray,
  collectErrors,
} from "./primitives";

export function validateStartUnitRequest(request: StartUnitRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.unitId, "unitId"),
    requireUuid(request.studentId, "studentId"),
  );
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_INVALID_UUID", errors);
}

export function validateAdvanceStepRequest(request: AdvanceStepRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.attemptId, "attemptId"),
    requireUuid(request.studentId, "studentId"),
  );
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_INVALID_UUID", errors);
}

export function validateVerifyComprehensionRequest(request: VerifyComprehensionRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.attemptId, "attemptId"),
    requireUuid(request.studentId, "studentId"),
  );
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_INVALID_UUID", errors);
  if (requirePresent(request.comprehensionResponse, "comprehensionResponse") !== null) {
    throw new ValidationException("ACADEMY_VALIDATION_EMPTY_COMPREHENSION_RESPONSE", [
      "comprehensionResponse es obligatorio y no puede estar vacío.",
    ]);
  }
}

export function validateAutosaveDraftRequest(request: AutosaveDraftRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.attemptId, "attemptId"),
    requireUuid(request.studentId, "studentId"),
    requireString(request.content, "content"),
  );
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_MISSING_FIELD", errors);
}

export function validateSubmitProductionRequest(request: SubmitProductionRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.attemptId, "attemptId"),
    requireUuid(request.studentId, "studentId"),
  );
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_INVALID_UUID", errors);
  if (requireNonEmptyString(request.content, "content") !== null) {
    throw new ValidationException("ACADEMY_VALIDATION_CONTENT_EMPTY", [
      "content no puede estar vacío.",
    ]);
  }
}

export function validateSubmitRevisionRequest(request: SubmitRevisionRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.attemptId, "attemptId"),
    requireUuid(request.studentId, "studentId"),
  );
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_INVALID_UUID", errors);
  if (requireNonEmptyString(request.content, "content") !== null) {
    throw new ValidationException("ACADEMY_VALIDATION_CONTENT_EMPTY", [
      "content no puede estar vacío.",
    ]);
  }
}

export function validateAdvanceToReflectionRequest(request: AdvanceToReflectionRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.attemptId, "attemptId"),
    requireUuid(request.studentId, "studentId"),
  );
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_INVALID_UUID", errors);
}

export function validateCompleteReflectionRequest(request: CompleteReflectionRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.attemptId, "attemptId"),
    requireUuid(request.studentId, "studentId"),
    requireNonEmptyArray(request.reflectionAnswers, "reflectionAnswers"),
  );
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_MISSING_FIELD", errors);
}

export function validateRepeatUnitRequest(request: RepeatUnitRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.unitId, "unitId"),
    requireUuid(request.studentId, "studentId"),
  );
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_INVALID_UUID", errors);
}
