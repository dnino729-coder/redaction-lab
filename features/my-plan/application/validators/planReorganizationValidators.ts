import { ValidationException } from "../exceptions/ValidationException";
import type { RequestPlanReorganizationRequestDto } from "../dto/PlanReorganizationDto";
import { requireUuid, requireOneOf, collectErrors } from "./primitives";

const REORGANIZATION_REASONS = ["EXAM_DATE_CHANGED", "AVAILABILITY_CHANGED"] as const;

export function validateRequestPlanReorganizationRequest(request: RequestPlanReorganizationRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.planId, "planId"),
    requireUuid(request.studentId, "studentId"),
    requireOneOf(request.reason, "reason", REORGANIZATION_REASONS),
  );
  if (errors.length > 0) throw new ValidationException(errors);
}
