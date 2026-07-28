import type { AcademyUnit } from "@/features/academy/domain/aggregates/AcademyUnit";
import type { AcademyUnitSummaryResponseDto, AcademyUnitDetailResponseDto } from "../dto";

// Domain → DTO. Los campos derivados en tiempo de consulta
// (`eligibleForUnlock`, `repeatable`, `teacherOverrideCount`) se inyectan
// como `context` — este Mapper nunca los calcula (Application Layer Spec
// v1.0, Sección 6: "el Mapper nunca los deriva por sí mismo").
export class AcademyUnitMapper {
  public static toSummaryDto(unit: AcademyUnit): AcademyUnitSummaryResponseDto {
    return {
      id: unit.id.value,
      studentId: unit.studentId.value,
      textType: unit.textType,
      position: unit.position,
      state: unit.state,
      activeAttemptId: unit.activeAttemptId ? unit.activeAttemptId.value : null,
    };
  }

  public static toDetailDto(
    unit: AcademyUnit,
    context: { eligibleForUnlock: boolean; repeatable: boolean },
  ): AcademyUnitDetailResponseDto {
    return {
      ...this.toSummaryDto(unit),
      completedAt: unit.completedAt ? unit.completedAt.toISOString() : null,
      masteredAt: unit.masteredAt ? unit.masteredAt.toISOString() : null,
      eligibleForUnlock: context.eligibleForUnlock,
      repeatable: context.repeatable,
      teacherOverrideCount: unit.teacherOverrides.length,
    };
  }
}
