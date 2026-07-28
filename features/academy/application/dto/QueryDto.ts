import type { AttemptSummaryResponseDto } from "./AttemptDto";
import type { VersionResponseDto } from "./VersionDto";
import type { FeedbackResponseDto } from "./FeedbackDto";
import type { AcademyUnitDetailResponseDto } from "./AcademyUnitDto";
import type { TeacherOverrideResponseDto } from "./TeacherOverrideDto";
import type { ModelExampleResponseDto } from "./ModelExampleDto";

// DTOs de Queries (Application Layer Spec v1.0, Sección 8, QRY-01..07,
// 09, 10 — QRY-08 formalmente retirada, ACP-002-B).

export interface ListAcademyUnitsForStudentRequestDto {
  readonly studentId: string;
  readonly textType?: string;
}

export interface AcademyUnitListItemDto extends AcademyUnitDetailResponseDto {
  readonly isEligibleForUnlock: boolean;
  readonly isRepeatable: boolean;
}

export interface GetAcademyUnitDetailRequestDto {
  readonly unitId: string;
  // Sprint 6.3.2 (remediacion H-01): ownership obligatorio.
  readonly studentId: string;
}

export interface GetContinuationStateRequestDto {
  readonly studentId: string;
}

export interface ContinuationStateResponseDto {
  readonly unit: AcademyUnitDetailResponseDto;
  readonly attempt: AttemptSummaryResponseDto;
  readonly draft: { readonly content: string; readonly lastSavedAt: string } | null;
}

export interface GetAttemptHistoryRequestDto {
  readonly unitId: string;
  // Sprint 6.3.2 (remediacion H-01): ownership obligatorio.
  readonly studentId: string;
}

export interface GetVersionFeedbackRequestDto {
  readonly attemptId: string;
  readonly versionNumber: number;
  // Sprint 6.3.2 (remediacion H-01): ownership obligatorio.
  readonly studentId: string;
}

export interface VersionFeedbackResponseDto {
  readonly version: VersionResponseDto;
  readonly feedback: FeedbackResponseDto | null;
}

export interface ListModelExamplesByTextTypeRequestDto {
  readonly textType: string;
}

export interface GetStudentProgressSummaryRequestDto {
  readonly studentId: string;
  readonly teacherId: string;
}

export interface StudentProgressSummaryResponseDto {
  readonly studentId: string;
  readonly unitsByState: Readonly<Record<string, number>>;
  readonly unitsByTextType: Readonly<Record<string, number>>;
  readonly masteredCount: number;
  readonly completedCount: number;
}

export interface GetTeacherOverrideHistoryRequestDto {
  readonly teacherId: string;
  readonly unitId?: string;
  readonly studentId?: string;
}

export interface GetStudentUnitHistoryRequestDto {
  readonly teacherId: string;
  readonly studentId: string;
  readonly unitId: string;
}

export interface AttemptHistoryEntryDto extends AttemptSummaryResponseDto {
  readonly versions: readonly VersionFeedbackResponseDto[];
}

export interface StudentUnitHistoryResponseDto {
  readonly unit: AcademyUnitDetailResponseDto;
  readonly attempts: readonly AttemptHistoryEntryDto[];
}

export type { ModelExampleResponseDto, TeacherOverrideResponseDto };
