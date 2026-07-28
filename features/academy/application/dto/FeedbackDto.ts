export interface FeedbackObservationInputDto {
  readonly category: string;
  readonly strength: "STRENGTH" | "WEAKNESS";
  readonly explanation: string;
  readonly suggestion: string;
}

export interface RecordFeedbackDeliveredRequestDto {
  readonly attemptId: string;
  readonly versionNumber: number;
  readonly observations: readonly FeedbackObservationInputDto[];
}

export interface FeedbackObservationResponseDto {
  readonly category: string;
  readonly strength: "STRENGTH" | "WEAKNESS";
  readonly explanation: string;
  readonly suggestion: string;
}

export interface FeedbackResponseDto {
  readonly id: string;
  readonly versionId: string;
  readonly observations: readonly FeedbackObservationResponseDto[];
  readonly deliveredAt: string;
}
