// DTOs de `AcademyUnit` (Application Layer Spec v1.0, CMD-07/08/09/15,
// QRY-01/02). Los campos de contexto derivados en tiempo de consulta
// (`isRecommended`, `eligibleForUnlock`, `repeatable`, `attemptsCount`,
// `teacherOverrideCount`) los calcula el Handler, nunca el Mapper.

export interface EvaluateMasteryRequestDto {
  readonly unitId: string;
}

export interface ProvisionAcademyUnitsForStudentRequestDto {
  readonly studentId: string;
}

export interface AcademyUnitSummaryResponseDto {
  readonly id: string;
  readonly studentId: string;
  readonly textType: string;
  readonly position: number;
  readonly state: string;
  readonly activeAttemptId: string | null;
}

export interface AcademyUnitDetailResponseDto extends AcademyUnitSummaryResponseDto {
  readonly completedAt: string | null;
  readonly masteredAt: string | null;
  readonly eligibleForUnlock: boolean;
  readonly repeatable: boolean;
  readonly teacherOverrideCount: number;
}
