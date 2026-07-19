import { ValidationException } from "../exceptions/ValidationException";
import type { CompleteLearningTaskRequestDto } from "../dto/LearningTaskDto";
import type { UpdateLearningObjectiveRequestDto } from "../dto/LearningObjectiveDto";
import { requireUuid, requireOneOf, collectErrors } from "./primitives";

const OBJECTIVE_ACTIONS = ["START", "COMPLETE", "REVERT", "CANCEL"] as const;

export function validateCompleteLearningTaskRequest(request: CompleteLearningTaskRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.taskId, "taskId"),
    requireUuid(request.studentId, "studentId"),
  );
  if (errors.length > 0) throw new ValidationException(errors);
}

export function validateUpdateLearningObjectiveRequest(request: UpdateLearningObjectiveRequestDto): void {
  const errors = collectErrors(
    requireUuid(request.objectiveId, "objectiveId"),
    requireUuid(request.studentId, "studentId"),
    requireOneOf(request.action, "action", OBJECTIVE_ACTIONS),
  );
  if (errors.length > 0) throw new ValidationException(errors);
}
