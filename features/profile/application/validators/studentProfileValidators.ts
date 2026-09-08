import { ValidationException } from "../exceptions/ValidationException";
import type { CompleteStudentOnboardingRequestDto } from "../dto/CompleteStudentOnboardingDto";
import {
  requireUuid,
  requireNonEmptyString,
  optionalFutureIsoDate,
  requireIntegerInRange,
  optionalIntegerInRange,
  requireOneOf,
  collectErrors,
} from "./primitives";

// Mismos 6 niveles CEFR/DELF que features/my-plan/application/validators/
// learningPlanValidators.ts (copia propia, sin importar cross-feature).
const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

// student_profile.native_language es VARCHAR(50) — validado aquí para no
// depender de que Postgres trunque o rechace un valor demasiado largo.
const NATIVE_LANGUAGE_MAX_LENGTH = 50;

function requireNativeLanguage(value: unknown): string | null {
  const emptyError = requireNonEmptyString(value, "nativeLanguage");
  if (emptyError) return emptyError;
  if (typeof value === "string" && value.trim().length > NATIVE_LANGUAGE_MAX_LENGTH) {
    return `nativeLanguage no puede superar ${NATIVE_LANGUAGE_MAX_LENGTH} caracteres.`;
  }
  return null;
}

export function validateCompleteStudentOnboardingRequest(
  request: CompleteStudentOnboardingRequestDto,
): void {
  const errors = collectErrors(
    requireUuid(request.studentId, "studentId"),
    requireOneOf(request.currentLevel, "currentLevel", CEFR_LEVELS),
    requireOneOf(request.targetLevel, "targetLevel", CEFR_LEVELS),
    requireNativeLanguage(request.nativeLanguage),
    requireNonEmptyString(request.learningGoal, "learningGoal"),
    requireIntegerInRange(request.daysPerWeek, "daysPerWeek", 1, 7),
    requireIntegerInRange(request.sessionsPerDay, "sessionsPerDay", 1, 24),
    requireIntegerInRange(request.minutesPerSession, "minutesPerSession", 1, 1440),
    optionalIntegerInRange(request.reminderHour, "reminderHour", 0, 23),
    optionalIntegerInRange(request.reminderMinute, "reminderMinute", 0, 59),
    optionalFutureIsoDate(request.targetExamDate, "targetExamDate"),
  );

  if (errors.length > 0) throw new ValidationException(errors);
}
