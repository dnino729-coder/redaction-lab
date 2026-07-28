// DTOs de `Attempt` (Application Layer Spec v1.0, CMD-01/06/07/16/17).
// Fechas siempre ISO-8601 (`string`), nunca `Date`. `studentId` se incluye
// explícitamente en cada Request de escritura sobre un `Attempt` propio
// (mismo patrón ya establecido en features/my-plan, p. ej.
// `CompleteLearningTaskCommand.request.studentId`) — la capa API
// (Sprint 6.3) lo resuelve desde la sesión autenticada, nunca se confía
// ciegamente en un valor arbitrario del cliente.

export interface StartUnitRequestDto {
  readonly unitId: string;
  readonly studentId: string;
}

export interface AdvanceStepRequestDto {
  readonly attemptId: string;
  readonly studentId: string;
}

export interface VerifyComprehensionRequestDto {
  readonly attemptId: string;
  readonly studentId: string;
  readonly comprehensionResponse: unknown;
}

export interface AdvanceToReflectionRequestDto {
  readonly attemptId: string;
  readonly studentId: string;
}

export interface CompleteReflectionRequestDto {
  readonly attemptId: string;
  readonly studentId: string;
  readonly reflectionAnswers: readonly string[];
}

export interface RepeatUnitRequestDto {
  readonly unitId: string;
  readonly studentId: string;
}

export interface AttemptSummaryResponseDto {
  readonly id: string;
  readonly unitId: string;
  readonly studentId: string;
  readonly currentStep: string;
  readonly comprehensionVerified: boolean;
  readonly attemptNumber: number;
  readonly isCurrent: boolean;
  readonly startedAt: string;
  readonly completedAt: string | null;
}
