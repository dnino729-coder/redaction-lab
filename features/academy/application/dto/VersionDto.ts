export interface SubmitProductionRequestDto {
  readonly attemptId: string;
  readonly studentId: string;
  readonly content: string;
}

export interface SubmitRevisionRequestDto {
  readonly attemptId: string;
  readonly studentId: string;
  readonly content: string;
}

export type FeedbackStatus = "DELIVERED" | "PROCESSING";

export interface VersionResponseDto {
  readonly id: string;
  readonly attemptId: string;
  readonly versionNumber: number;
  readonly content: string;
  readonly submittedAt: string;
  readonly feedbackStatus: FeedbackStatus;
}
