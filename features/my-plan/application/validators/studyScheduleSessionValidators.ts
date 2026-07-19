import { ValidationException } from "../exceptions/ValidationException";
import type { UpdateStudyScheduleRequestDto, GetStudyScheduleRequestDto } from "../dto/StudyScheduleDto";
import type { CreateStudySessionRequestDto } from "../dto/StudySessionDto";
import { requireUuid, requireIntegerInRange, collectErrors } from "./primitives";

export function validateUpdateStudyScheduleRequest(request: UpdateStudyScheduleRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.studentId, "studentId"),
    requireUuid(request.planId, "planId"),
    requireIntegerInRange(request.daysPerWeek, "daysPerWeek", 1, 7),
    requireIntegerInRange(request.sessionsPerDay, "sessionsPerDay", 1, 24),
    requireIntegerInRange(request.minutesPerSession, "minutesPerSession", 1, 1440),
  );
  if (request.reminderHour !== undefined && request.reminderHour !== null) {
    errors.push(...collectErrors(requireIntegerInRange(request.reminderHour, "reminderHour", 0, 23)));
  }
  if (request.reminderMinute !== undefined && request.reminderMinute !== null) {
    errors.push(...collectErrors(requireIntegerInRange(request.reminderMinute, "reminderMinute", 0, 59)));
  }
  if (errors.length > 0) throw new ValidationException(errors);
}

export function validateGetStudyScheduleRequest(request: GetStudyScheduleRequestDto): void {
  const errors = collectErrors(requireUuid(request.studentId, "studentId"));
  if (errors.length > 0) throw new ValidationException(errors);
}

export function validateCreateStudySessionRequest(request: CreateStudySessionRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.studentId, "studentId"),
    requireUuid(request.learningTaskId, "learningTaskId"),
  );
  if (errors.length > 0) throw new ValidationException(errors);
}
