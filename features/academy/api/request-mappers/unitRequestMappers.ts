import type {
  StartUnitRequestDto,
  RepeatUnitRequestDto,
} from "@/features/academy/application/dto/AttemptDto";
import type {
  ApplyTeacherOverrideRequestDto,
} from "@/features/academy/application/dto/TeacherOverrideDto";
import type {
  ListAcademyUnitsForStudentRequestDto,
  GetAcademyUnitDetailRequestDto,
  GetAttemptHistoryRequestDto,
} from "@/features/academy/application/dto/QueryDto";

// Request Mapper (Alcance #6) — HTTP Request → Application Request DTO,
// sin lógica de negocio: combina parámetros de ruta + `studentId`
// autenticado (nunca confiado del cliente, ver `http/auth.ts`).
export function toStartUnitRequest(unitId: string, studentId: string): StartUnitRequestDto {
  return { unitId, studentId };
}

export function toRepeatUnitRequest(unitId: string, studentId: string): RepeatUnitRequestDto {
  return { unitId, studentId };
}

export interface ApplyTeacherOverrideBody {
  readonly action: unknown;
  readonly reason: unknown;
}

export function toApplyTeacherOverrideRequest(
  unitId: string,
  body: ApplyTeacherOverrideBody,
  teacherId: string,
): ApplyTeacherOverrideRequestDto {
  return {
    unitId,
    action: body.action as "FORCE_LOCK" | "FORCE_RESTART",
    reason: body.reason as string,
    teacherId,
  };
}

export function toListUnitsForStudentRequest(
  studentId: string,
  textType: string | null,
): ListAcademyUnitsForStudentRequestDto {
  return textType ? { studentId, textType } : { studentId };
}

// Sprint 6.3.2 (remediacion H-01): ambos mappers ahora reciben `studentId`
// (siempre el del actor autenticado, nunca confiado del cliente) y lo
// incluyen en el Request DTO para que el Query Handler/Read Model lo use
// como filtro de ownership.
export function toGetUnitDetailRequest(
  unitId: string,
  studentId: string,
): GetAcademyUnitDetailRequestDto {
  return { unitId, studentId };
}

export function toGetAttemptHistoryRequest(
  unitId: string,
  studentId: string,
): GetAttemptHistoryRequestDto {
  return { unitId, studentId };
}
