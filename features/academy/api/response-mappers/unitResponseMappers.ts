import type {
  AcademyUnitSummaryResponseDto,
  AcademyUnitDetailResponseDto,
} from "@/features/academy/application/dto/AcademyUnitDto";
import type { AcademyUnitListItemDto } from "@/features/academy/application/dto/QueryDto";

// Response Mapper (Alcance #7) — Application DTO → HTTP Response, sin
// lógica de negocio, renombrando únicamente los campos cuyo nombre difiere
// entre el DTO de Application (Sprint 6.1.2, Frozen) y el `AcademyUnitSummaryDTO`/
// `AcademyUnitDetailDTO` documentados por el API Contract v1.3, Sección 5
// (`id` → `unitId`, el resto de nombres ya coincide).
//
// Nota de fidelidad (disclosed, no BLOCKER): el Contrato v1.3 documenta
// campos adicionales en `AcademyUnitSummaryDTO`
// (`unlockedAt?`, `attemptCount`, `isRecommended`) que el DTO real de
// Application (`AcademyUnitSummaryResponseDto`/`AcademyUnitDetailResponseDto`,
// ambos Frozen desde Sprint 6.1.2) no expone — no se fabrican aquí: este
// Mapper solo traduce lo que Application efectivamente entrega. Cerrar esa
// brecha exige extender el DTO de Application, fuera de alcance de este
// Sprint ("no modificar Application Layer").
export interface AcademyUnitSummaryHttp {
  readonly unitId: string;
  readonly studentId: string;
  readonly textType: string;
  readonly position: number;
  readonly state: string;
  readonly activeAttemptId: string | null;
}

export interface AcademyUnitDetailHttp extends AcademyUnitSummaryHttp {
  readonly completedAt: string | null;
  readonly masteredAt: string | null;
  readonly eligibleForUnlock: boolean;
  readonly repeatable: boolean;
  readonly teacherOverrideCount: number;
}

export function toUnitSummaryHttp(dto: AcademyUnitSummaryResponseDto): AcademyUnitSummaryHttp {
  return {
    unitId: dto.id,
    studentId: dto.studentId,
    textType: dto.textType,
    position: dto.position,
    state: dto.state,
    activeAttemptId: dto.activeAttemptId,
  };
}

export function toUnitDetailHttp(
  dto: AcademyUnitDetailResponseDto | AcademyUnitListItemDto,
): AcademyUnitDetailHttp {
  return {
    ...toUnitSummaryHttp(dto),
    completedAt: dto.completedAt,
    masteredAt: dto.masteredAt,
    eligibleForUnlock: dto.eligibleForUnlock,
    repeatable: dto.repeatable,
    teacherOverrideCount: dto.teacherOverrideCount,
  };
}
