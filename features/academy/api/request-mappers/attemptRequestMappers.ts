import type {
  AdvanceStepRequestDto,
  VerifyComprehensionRequestDto,
  AdvanceToReflectionRequestDto,
  CompleteReflectionRequestDto,
} from "@/features/academy/application/dto/AttemptDto";
import type { AutosaveDraftRequestDto } from "@/features/academy/application/dto/DraftDto";
import type {
  SubmitProductionRequestDto,
  SubmitRevisionRequestDto,
} from "@/features/academy/application/dto/VersionDto";
import type {
  GetContinuationStateRequestDto,
  GetVersionFeedbackRequestDto,
} from "@/features/academy/application/dto/QueryDto";

// Request Mapper (Alcance #6) — `Attempt`/`Draft`/`Version`/`Feedback`.
export function toAutosaveDraftRequest(
  attemptId: string,
  studentId: string,
  content: unknown,
): AutosaveDraftRequestDto {
  return { attemptId, studentId, content: content as string };
}

export function toSubmitProductionRequest(
  attemptId: string,
  studentId: string,
  content: unknown,
): SubmitProductionRequestDto {
  return { attemptId, studentId, content: content as string };
}

export function toSubmitRevisionRequest(
  attemptId: string,
  studentId: string,
  content: unknown,
): SubmitRevisionRequestDto {
  return { attemptId, studentId, content: content as string };
}

export function toAdvanceToReflectionRequest(
  attemptId: string,
  studentId: string,
): AdvanceToReflectionRequestDto {
  return { attemptId, studentId };
}

export function toCompleteReflectionRequest(
  attemptId: string,
  studentId: string,
  responses: unknown,
): CompleteReflectionRequestDto {
  return { attemptId, studentId, reflectionAnswers: (responses as string[]) ?? [] };
}

export function toAdvanceStepRequest(attemptId: string, studentId: string): AdvanceStepRequestDto {
  return { attemptId, studentId };
}

export function toVerifyComprehensionRequest(
  attemptId: string,
  studentId: string,
  comprehensionResponse: unknown,
): VerifyComprehensionRequestDto {
  return { attemptId, studentId, comprehensionResponse };
}

export function toGetContinuationStateRequest(studentId: string): GetContinuationStateRequestDto {
  return { studentId };
}

// Sprint 6.3.2 (remediacion H-01): incluye `studentId` (del actor
// autenticado) como filtro de ownership en el Request DTO.
export function toGetVersionFeedbackRequest(
  attemptId: string,
  versionNumber: number,
  studentId: string,
): GetVersionFeedbackRequestDto {
  return { attemptId, versionNumber, studentId };
}
