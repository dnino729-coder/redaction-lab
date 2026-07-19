export interface StudyScheduleResponseDto {
  readonly id: string;
  readonly learningPlanId: string;
  readonly daysPerWeek: number;
  readonly sessionsPerDay: number;
  readonly minutesPerSession: number;
  readonly reminderHour: number | null;
  readonly reminderMinute: number | null;
}

export interface UpdateStudyScheduleRequestDto {
  readonly studentId: string;
  readonly planId: string;
  readonly daysPerWeek: number;
  readonly sessionsPerDay: number;
  readonly minutesPerSession: number;
  readonly reminderHour?: number | null;
  readonly reminderMinute?: number | null;
}

export interface GetStudyScheduleRequestDto {
  readonly studentId: string;
}
