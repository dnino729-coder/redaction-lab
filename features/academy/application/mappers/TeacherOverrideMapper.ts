import type { TeacherOverride } from "@/features/academy/domain/entities/TeacherOverride";
import type { TeacherOverrideResponseDto } from "../dto";

export class TeacherOverrideMapper {
  public static toDto(unitId: string, override: TeacherOverride): TeacherOverrideResponseDto {
    return {
      id: override.id.value,
      unitId,
      teacherId: override.teacherId,
      action: override.action,
      reason: override.reason,
      appliedAt: override.appliedAt.toISOString(),
    };
  }
}
