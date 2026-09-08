import type { StudentProfileResponseDto } from "./StudentProfileDto";

// Request del único caso de uso de Profile expuesto por HTTP — coordina
// la creación de StudentProfile y (vía CreateLearningPlanHandler, ya
// existente, sin modificar) de LearningPlan/LearningGoal/StudySchedule.
export interface CompleteStudentOnboardingRequestDto {
  readonly studentId: string;
  readonly currentLevel: string;
  readonly targetLevel: string;
  readonly nativeLanguage: string;
  readonly learningGoal: string;
  readonly daysPerWeek: number;
  readonly sessionsPerDay: number;
  readonly minutesPerSession: number;
  readonly reminderHour?: number | null;
  readonly reminderMinute?: number | null;
  readonly targetExamDate?: string | null;
}

export interface CompleteStudentOnboardingResponseDto {
  readonly studentProfile: StudentProfileResponseDto;
  readonly learningPlanId: string;
}
