export interface ApplyTeacherOverrideRequestDto {
  readonly unitId: string;
  readonly action: "FORCE_LOCK" | "FORCE_RESTART";
  readonly reason: string;
  readonly teacherId: string;
}

export interface TeacherOverrideResponseDto {
  readonly id: string;
  readonly unitId: string;
  readonly teacherId: string;
  readonly action: string;
  readonly reason: string;
  readonly appliedAt: string;
}
