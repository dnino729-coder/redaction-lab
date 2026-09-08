// DTO de `StudentProfile`. Nunca se retorna la Entity de dominio hacia el
// exterior (ver mappers/StudentProfileMapper.ts).
export interface StudentProfileResponseDto {
  readonly id: string;
  readonly studentId: string;
  readonly currentLevel: string;
  readonly targetLevel: string;
  readonly nativeLanguage: string;
  readonly learningGoal: string | null;
  readonly targetExamDate: string | null;
}
