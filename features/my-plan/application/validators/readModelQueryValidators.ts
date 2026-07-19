import { ValidationException } from "../exceptions/ValidationException";
import type { GetDailyPlanRequestDto } from "../dto/DailyPlanDto";
import type { GetWeeklyPlanRequestDto } from "../dto/WeeklyPlanDto";
import type { GetLearningProgressRequestDto } from "../dto/LearningProgressDto";
import { requireUuid, requireIsoDate, requireIntegerInRange, collectErrors } from "./primitives";

export function validateGetDailyPlanRequest(request: GetDailyPlanRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.studentId, "studentId"),
    requireIsoDate(request.date, "date"),
  );
  if (errors.length > 0) throw new ValidationException(errors);
}

export function validateGetWeeklyPlanRequest(request: GetWeeklyPlanRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.studentId, "studentId"),
    requireIntegerInRange(request.weekNumber, "weekNumber", 1, 520),
  );
  if (errors.length > 0) throw new ValidationException(errors);
}

export function validateGetLearningProgressRequest(request: GetLearningProgressRequestDto): void {
  const errors = collectErrors(requireUuid(request.studentId, "studentId"));
  if (errors.length > 0) throw new ValidationException(errors);
}
