export interface CompleteLearningTaskRequestDto {
  readonly taskId: string;
  readonly studentId: string;
}

export interface LearningTaskResponseDto {
  readonly id: string;
  readonly learningPhaseId: string;
  readonly title: string;
  readonly description: string | null;
  readonly estimatedMinutes: number;
  readonly difficulty: string;
  readonly dueDate: string | null;
  readonly completedAt: string | null;
  readonly status: string;
  readonly source: string;
}
