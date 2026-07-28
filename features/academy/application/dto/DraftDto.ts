export interface AutosaveDraftRequestDto {
  readonly attemptId: string;
  readonly studentId: string;
  readonly content: string;
}

export interface DraftResponseDto {
  readonly attemptId: string;
  readonly content: string;
  readonly wordCount: number;
  readonly characterCount: number;
  readonly lastSavedAt: string;
}
