// Validación sintáctica de entrada — nunca una regla de negocio (eso vive
// en el dominio, Paso 1). Un solo archivo: alcance de este paso limitado
// exclusivamente a Application.
import { ValidationException } from "../exceptions/ValidationException";
import { ExerciseMode } from "@/features/laboratory/domain/enums/ExerciseMode";
import { WritingExerciseTextType } from "@/features/laboratory/domain/enums/WritingExerciseTextType";
import type { CreateWritingExerciseRequestDto } from "../dto/CreateWritingExerciseRequestDto";
import type { AutosaveExerciseDraftRequestDto } from "../dto/AutosaveExerciseDraftRequestDto";
import type { StartExerciseAttemptRequestDto } from "../commands/StartExerciseAttemptCommand";
import type { CompleteExerciseAttemptRequestDto } from "../commands/CompleteExerciseAttemptCommand";
import type { RepeatWritingExerciseRequestDto } from "../commands/RepeatWritingExerciseCommand";
import type { ListWritingExercisesForStudentRequestDto } from "../queries/ListWritingExercisesForStudentQuery";
import type { GetWritingExerciseDetailRequestDto } from "../queries/GetWritingExerciseDetailQuery";
import type { GetExerciseAttemptHistoryRequestDto } from "../queries/GetExerciseAttemptHistoryQuery";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function requireUuid(value: unknown, fieldName: string): string | null {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    return `${fieldName} debe ser un UUID válido (recibido: ${JSON.stringify(value)}).`;
  }
  return null;
}

function requireOneOf<T extends string>(value: unknown, fieldName: string, allowed: readonly T[]): string | null {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    return `${fieldName} debe ser uno de [${allowed.join(", ")}] (recibido: ${JSON.stringify(value)}).`;
  }
  return null;
}

function requireString(value: unknown, fieldName: string): string | null {
  if (typeof value !== "string") {
    return `${fieldName} debe ser un string.`;
  }
  return null;
}

function collectErrors(...errors: ReadonlyArray<string | null>): string[] {
  return errors.filter((error): error is string => error !== null);
}

export function validateCreateWritingExerciseRequest(request: CreateWritingExerciseRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.studentId, "studentId"),
    requireOneOf(request.mode, "mode", Object.values(ExerciseMode)),
    requireOneOf(request.textType, "textType", Object.values(WritingExerciseTextType)),
  );

  if (request.mode === ExerciseMode.GUIDED) {
    if (!request.guidedPrompt || request.guidedPrompt.trim().length === 0) {
      errors.push("guidedPrompt es obligatorio cuando mode = GUIDED.");
    }
  } else if (request.mode === ExerciseMode.AUTONOMOUS && request.guidedPrompt) {
    errors.push("guidedPrompt no aplica cuando mode = AUTONOMOUS.");
  }

  if (errors.length > 0) throw new ValidationException("LABORATORY_VALIDATION_INVALID_REQUEST", errors);
}

export function validateStartExerciseAttemptRequest(request: StartExerciseAttemptRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.exerciseId, "exerciseId"),
    requireUuid(request.studentId, "studentId"),
  );
  if (errors.length > 0) throw new ValidationException("LABORATORY_VALIDATION_INVALID_REQUEST", errors);
}

export function validateAutosaveExerciseDraftRequest(request: AutosaveExerciseDraftRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.attemptId, "attemptId"),
    requireUuid(request.studentId, "studentId"),
    requireString(request.content, "content"),
  );
  if (errors.length > 0) throw new ValidationException("LABORATORY_VALIDATION_INVALID_REQUEST", errors);
}

export function validateCompleteExerciseAttemptRequest(request: CompleteExerciseAttemptRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.attemptId, "attemptId"),
    requireUuid(request.studentId, "studentId"),
  );
  if (errors.length > 0) throw new ValidationException("LABORATORY_VALIDATION_INVALID_REQUEST", errors);
}

export function validateRepeatWritingExerciseRequest(request: RepeatWritingExerciseRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.exerciseId, "exerciseId"),
    requireUuid(request.studentId, "studentId"),
  );
  if (errors.length > 0) throw new ValidationException("LABORATORY_VALIDATION_INVALID_REQUEST", errors);
}

export function validateListWritingExercisesForStudentRequest(
  request: ListWritingExercisesForStudentRequestDto,
): void {
  const errors = collectErrors(
    requireUuid(request.studentId, "studentId"),
    request.mode !== undefined ? requireOneOf(request.mode, "mode", Object.values(ExerciseMode)) : null,
  );
  if (errors.length > 0) throw new ValidationException("LABORATORY_VALIDATION_INVALID_REQUEST", errors);
}

export function validateGetWritingExerciseDetailRequest(request: GetWritingExerciseDetailRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.exerciseId, "exerciseId"),
    requireUuid(request.studentId, "studentId"),
  );
  if (errors.length > 0) throw new ValidationException("LABORATORY_VALIDATION_INVALID_REQUEST", errors);
}

export function validateGetExerciseAttemptHistoryRequest(request: GetExerciseAttemptHistoryRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.exerciseId, "exerciseId"),
    requireUuid(request.studentId, "studentId"),
  );
  if (errors.length > 0) throw new ValidationException("LABORATORY_VALIDATION_INVALID_REQUEST", errors);
}
