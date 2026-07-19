import { ValidationException } from "../exceptions/ValidationException";
import type {
  CreateLearningPlanRequestDto,
  PauseLearningPlanRequestDto,
  ResumeLearningPlanRequestDto,
  CancelLearningPlanRequestDto,
  GetActiveLearningPlanRequestDto,
} from "../dto/LearningPlanDto";
import {
  requireUuid,
  requireNonEmptyString,
  optionalString,
  requireIsoDate,
  optionalIsoDate,
  requireOneOf,
  requireIntegerInRange,
  collectErrors,
} from "./primitives";

// CEFR (13.4: "target_level (ENUM A1-C2)") y GoalPriority (13.4:
// "priority (ENUM: LOW, MEDIUM, HIGH, CRITICAL)") — mismos valores que
// domain/enums/CefrLevel.ts y GoalPriority.ts, repetidos aquí en forma de
// lista de validación sintáctica (esta capa no importa los ENUM del
// dominio como *tipos de dato de entrada*, solo valida que el string
// recibido pertenezca al vocabulario ya aprobado).
const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const GOAL_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export function validateCreateLearningPlanRequest(request: CreateLearningPlanRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.studentId, "studentId"),
    requireNonEmptyString(request.name, "name"),
    optionalString(request.description, "description"),
    requireOneOf(request.targetLevel, "targetLevel", CEFR_LEVELS),
    requireIsoDate(request.startDate, "startDate"),
    optionalIsoDate(request.endDate, "endDate"),
  );

  if (!Array.isArray(request.initialGoals) || request.initialGoals.length === 0) {
    // 13.4 MUST: "cada plan debe contener al menos un objetivo" — se
    // valida aquí como requisito sintáctico de completitud de la
    // solicitud (ver informe de entrega, "Ambigüedad reportada").
    errors.push("initialGoals debe contener al menos 1 meta (13.4 MUST: todo plan requiere ≥1 objetivo).");
  } else {
    request.initialGoals.forEach((goal, index) => {
      errors.push(
        ...collectErrors(
          requireNonEmptyString(goal.title, `initialGoals[${index}].title`),
          optionalString(goal.description, `initialGoals[${index}].description`),
          goal.priority === undefined
            ? null
            : requireOneOf(goal.priority, `initialGoals[${index}].priority`, GOAL_PRIORITIES),
          optionalIsoDate(goal.targetDate, `initialGoals[${index}].targetDate`),
        ),
      );
    });
  }

  const schedule = request.studySchedule;
  if (!schedule || typeof schedule !== "object") {
    errors.push("studySchedule es obligatorio.");
  } else {
    errors.push(
      ...collectErrors(
        requireIntegerInRange(schedule.daysPerWeek, "studySchedule.daysPerWeek", 1, 7),
        requireIntegerInRange(schedule.sessionsPerDay, "studySchedule.sessionsPerDay", 1, 24),
        requireIntegerInRange(schedule.minutesPerSession, "studySchedule.minutesPerSession", 1, 1440),
      ),
    );
    if (schedule.reminderHour !== undefined) {
      errors.push(...collectErrors(requireIntegerInRange(schedule.reminderHour, "studySchedule.reminderHour", 0, 23)));
    }
    if (schedule.reminderMinute !== undefined) {
      errors.push(...collectErrors(requireIntegerInRange(schedule.reminderMinute, "studySchedule.reminderMinute", 0, 59)));
    }
  }

  if (errors.length > 0) throw new ValidationException(errors);
}

export function validatePauseLearningPlanRequest(request: PauseLearningPlanRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.planId, "planId"),
    requireUuid(request.studentId, "studentId"),
  );
  if (errors.length > 0) throw new ValidationException(errors);
}

export function validateResumeLearningPlanRequest(request: ResumeLearningPlanRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.planId, "planId"),
    requireUuid(request.studentId, "studentId"),
  );
  if (errors.length > 0) throw new ValidationException(errors);
}

export function validateCancelLearningPlanRequest(request: CancelLearningPlanRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.planId, "planId"),
    requireUuid(request.studentId, "studentId"),
  );
  if (errors.length > 0) throw new ValidationException(errors);
}

export function validateGetActiveLearningPlanRequest(request: GetActiveLearningPlanRequestDto): void {
  const errors = collectErrors(requireUuid(request.studentId, "studentId"));
  if (errors.length > 0) throw new ValidationException(errors);
}
