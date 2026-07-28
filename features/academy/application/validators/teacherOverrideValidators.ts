import { ValidationException } from "../exceptions/ValidationException";
import { OverrideAction } from "@/features/academy/domain/enums/OverrideAction";
import type { ApplyTeacherOverrideRequestDto } from "../dto/TeacherOverrideDto";
import { requireUuid, requireOneOf, requireNonEmptyString, collectErrors } from "./primitives";

const OVERRIDE_ACTIONS = Object.values(OverrideAction);

export function validateApplyTeacherOverrideRequest(request: ApplyTeacherOverrideRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.unitId, "unitId"),
    requireUuid(request.teacherId, "teacherId"),
  );
  if (errors.length > 0) throw new ValidationException("ACADEMY_VALIDATION_INVALID_UUID", errors);

  const actionError = requireOneOf(request.action, "action", OVERRIDE_ACTIONS);
  if (actionError !== null) {
    throw new ValidationException("ACADEMY_VALIDATION_INVALID_OVERRIDE_ACTION", [actionError]);
  }
  if (requireNonEmptyString(request.reason, "reason") !== null) {
    throw new ValidationException("ACADEMY_VALIDATION_EMPTY_OVERRIDE_REASON", [
      "reason no puede estar vacío.",
    ]);
  }
}
