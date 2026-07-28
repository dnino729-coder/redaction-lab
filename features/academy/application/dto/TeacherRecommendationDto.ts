export interface AssignUnitToStudentRequestDto {
  readonly unitId: string;
  readonly studentId: string;
  readonly teacherId: string;
}

export interface TeacherRecommendationResponseDto {
  readonly id: string;
  readonly unitId: string;
  readonly studentId: string;
  readonly teacherId: string;
  readonly recommendedAt: string;
}
