export interface ExerciseAttemptResponseDto {
  readonly id: string;
  readonly attemptNumber: number;
  readonly status: string;
  readonly wordCount: number;
  readonly startedAt: string;
  readonly completedAt: string | null;
}
