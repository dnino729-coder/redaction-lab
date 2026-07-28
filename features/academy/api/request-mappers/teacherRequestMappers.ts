import type { AssignUnitToStudentRequestDto } from "@/features/academy/application/dto/TeacherRecommendationDto";
import type {
  GetStudentProgressSummaryRequestDto,
  GetStudentUnitHistoryRequestDto,
} from "@/features/academy/application/dto/QueryDto";

// Request Mapper (Alcance #6) — recursos de Profesor.
export function toAssignUnitToStudentRequest(
  studentId: string,
  unitId: unknown,
  teacherId: string,
): AssignUnitToStudentRequestDto {
  return { unitId: unitId as string, studentId, teacherId };
}

export function toGetStudentProgressSummaryRequest(
  studentId: string,
  teacherId: string,
): GetStudentProgressSummaryRequestDto {
  return { studentId, teacherId };
}

export function toGetStudentUnitHistoryRequest(
  teacherId: string,
  studentId: string,
  unitId: string,
): GetStudentUnitHistoryRequestDto {
  return { teacherId, studentId, unitId };
}
