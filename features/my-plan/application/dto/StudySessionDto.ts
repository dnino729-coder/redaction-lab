export interface StudySessionResponseDto {
  readonly id: string;
  readonly studentId: string;
  readonly learningTaskId: string;
  readonly startedAt: string;
  readonly finishedAt: string | null;
  readonly durationMinutes: number | null;
  readonly completed: boolean;
}

export interface CreateStudySessionRequestDto {
  readonly studentId: string;
  readonly learningTaskId: string;
}
