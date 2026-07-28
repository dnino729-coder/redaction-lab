import type { TeacherOverrideResponseDto } from "@/features/academy/application/dto/TeacherOverrideDto";
import type { TeacherRecommendationResponseDto } from "@/features/academy/application/dto/TeacherRecommendationDto";
import type {
  StudentProgressSummaryResponseDto,
  StudentUnitHistoryResponseDto,
} from "@/features/academy/application/dto/QueryDto";
import { toAttemptSummaryHttp, toVersionFeedbackHttp } from "./attemptResponseMappers";
import { toUnitDetailHttp } from "./unitResponseMappers";

// Response Mapper (Alcance #7) — recursos de Profesor/Administrador.
export interface TeacherOverrideHttp {
  readonly overrideId: string;
  readonly unitId: string;
  readonly action: string;
  readonly reason: string;
  readonly appliedBy: string;
  readonly appliedAt: string;
}

// Renombrado `id` → `overrideId`, `teacherId` → `appliedBy` (Contrato
// v1.3, Sección 5, `TeacherOverrideDTO`).
export function toTeacherOverrideHttp(dto: TeacherOverrideResponseDto): TeacherOverrideHttp {
  return {
    overrideId: dto.id,
    unitId: dto.unitId,
    action: dto.action,
    reason: dto.reason,
    appliedBy: dto.teacherId,
    appliedAt: dto.appliedAt,
  };
}

export interface TeacherRecommendationHttp {
  readonly recommendationId: string;
  readonly studentId: string;
  readonly unitId: string;
  readonly recommendedBy: string;
  readonly recommendedAt: string;
}

// Renombrado `id` → `recommendationId`, `teacherId` → `recommendedBy`
// (Contrato v1.3, Sección 5, `TeacherRecommendationDTO`).
export function toTeacherRecommendationHttp(
  dto: TeacherRecommendationResponseDto,
): TeacherRecommendationHttp {
  return {
    recommendationId: dto.id,
    studentId: dto.studentId,
    unitId: dto.unitId,
    recommendedBy: dto.teacherId,
    recommendedAt: dto.recommendedAt,
  };
}

// `StudentProgressSummaryDTO` (Contrato, Sección 5) ya coincide 1:1 con el
// DTO de Application — `masteredCount`/`completedCount` son campos
// aditivos ya presentes en el DTO real (Sprint 6.1.2), compatibles con la
// regla de versionado del Contrato (Sección 10: "campos opcionales
// adicionales... no requieren nueva versión").
export function toStudentProgressSummaryHttp(
  dto: StudentProgressSummaryResponseDto,
): StudentProgressSummaryResponseDto {
  return dto;
}

export interface StudentUnitHistoryHttp {
  readonly studentId: string;
  readonly unitId: string;
  readonly unitState: string;
  readonly attemptsCount: number;
  readonly attempts: ReadonlyArray<
    ReturnType<typeof toAttemptSummaryHttp> & {
      readonly versions: ReadonlyArray<ReturnType<typeof toVersionFeedbackHttp>>;
    }
  >;
}

// Combina `{unit, attempts}` (forma real de QRY-10, `StudentUnitHistoryResponseDto`)
// en el `StudentUnitHistoryDTO` documentado por el Contrato v1.3, Sección 5.
export function toStudentUnitHistoryHttp(dto: StudentUnitHistoryResponseDto): StudentUnitHistoryHttp {
  return {
    studentId: dto.unit.studentId,
    unitId: dto.unit.id,
    unitState: dto.unit.state,
    attemptsCount: dto.attempts.length,
    attempts: dto.attempts.map((attempt) => ({
      ...toAttemptSummaryHttp(attempt),
      versions: attempt.versions.map(toVersionFeedbackHttp),
    })),
  };
}

// Reexportado por conveniencia — algunos handlers de Profesor también
// necesitan el detalle de unidad ya mapeado (EP-23 incluye `unitState`,
// derivado de `toUnitDetailHttp`, sin duplicar esa lógica).
export { toUnitDetailHttp };
