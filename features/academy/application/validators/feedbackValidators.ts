import { ValidationException } from "../exceptions/ValidationException";
import { FeedbackCategory } from "@/features/academy/domain/enums/FeedbackCategory";
import { FeedbackStrength } from "@/features/academy/domain/enums/FeedbackStrength";
import type { RecordFeedbackDeliveredRequestDto } from "../dto/FeedbackDto";
import {
  requireUuid,
  requireIntegerAtLeast,
  requireNonEmptyArray,
  requireOneOf,
  requireNonEmptyString,
  collectErrors,
} from "./primitives";

const FEEDBACK_CATEGORIES = Object.values(FeedbackCategory);
const FEEDBACK_STRENGTHS = Object.values(FeedbackStrength);

export function validateRecordFeedbackDeliveredRequest(
  request: RecordFeedbackDeliveredRequestDto,
): void {
  const errors = collectErrors(
    requireUuid(request.attemptId, "attemptId"),
    requireIntegerAtLeast(request.versionNumber, "versionNumber", 1),
    requireNonEmptyArray(request.observations, "observations"),
  );
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_MISSING_FIELD", errors);

  request.observations.forEach((observation, index) => {
    const categoryError = requireOneOf(
      observation.category,
      `observations[${index}].category`,
      FEEDBACK_CATEGORIES,
    );
    if (categoryError !== null) {
      throw new ValidationException("ACADEMY_VALIDATION_INVALID_FEEDBACK_CATEGORY", [categoryError]);
    }
    const observationErrors = collectErrors(
      requireOneOf(observation.strength, `observations[${index}].strength`, FEEDBACK_STRENGTHS),
      requireNonEmptyString(observation.explanation, `observations[${index}].explanation`),
      requireNonEmptyString(observation.suggestion, `observations[${index}].suggestion`),
    );
    if (observationErrors.length > 0) {
      throw new ValidationException("ACADEMY_VALIDATION_MISSING_FIELD", observationErrors);
    }
  });
}
