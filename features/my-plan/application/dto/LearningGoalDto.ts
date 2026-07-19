export interface LearningGoalResponseDto {
  readonly id: string;
  readonly learningPlanId: string;
  readonly title: string;
  readonly description: string | null;
  readonly priority: string;
  readonly targetDate: string | null;
  readonly completedAt: string | null;
  readonly status: string;
}
