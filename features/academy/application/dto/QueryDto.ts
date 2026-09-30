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

// Academy Content v1 (Bloque 3A) — lectura de contenido editorial
// publicado de un step. `unitId`/`studentId` resuelven ownership (mismo
// criterio H-01 ya aplicado en `GetAcademyUnitDetailRequestDto`); la
// resolución real del slot editorial (`textType`+`position`) ocurre en el
// Read Model a partir de esos dos campos, nunca por FK directa (ver
// diseño aprobado, "IMPORTANTE sobre unitId").
export interface GetUnitStepContentRequestDto {
  readonly unitId: string;
  readonly studentId: string;
  readonly step: string;
  readonly locale: string;
}

export interface UnitContentBlockResponseDto {
  readonly order: number;
  readonly type: string;
  readonly data: unknown;
}

// Deliberadamente sin createdBy/createdAt/updatedAt/publishedAt/status/
// version/ids internos (alcance del Bloque 3A) — el estudiante solo
// necesita los bloques a renderizar.
export interface UnitStepContentResponseDto {
  readonly step: string;
  readonly blocks: readonly UnitContentBlockResponseDto[];
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
