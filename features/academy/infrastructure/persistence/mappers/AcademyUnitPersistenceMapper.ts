import type { Prisma, TeacherOverride as PrismaTeacherOverride } from "@prisma/client";
import { AcademyUnit } from "@/features/academy/domain/aggregates/AcademyUnit";
import { AcademyUnitId } from "@/features/academy/domain/value-objects/AcademyUnitId";
import { AttemptId } from "@/features/academy/domain/value-objects/AttemptId";
import { StudentId } from "@/features/academy/domain/value-objects/StudentId";
import { TeacherOverrideId } from "@/features/academy/domain/value-objects/TeacherOverrideId";
import { TeacherOverride } from "@/features/academy/domain/entities/TeacherOverride";
import type { UnitState } from "@/features/academy/domain/enums/UnitState";
import type { TextType } from "@/features/academy/domain/enums/TextType";
import type { OverrideAction } from "@/features/academy/domain/enums/OverrideAction";

// Persistence Mapper — AcademyUnit <-> Prisma (Persistence Layer
// Specification v1.0, Sección 2.3). El historial completo de `Attempt`
// (`attempts[]`) NUNCA se carga aquí (Domain Model v1.1, Sección 15:
// "referencia... únicamente por identidad") — solo `activeAttemptId` como
// identidad liviana. `teacherOverrides` SÍ se reconstituye completo (Entity
// interna del Aggregate).
export type AcademyUnitRow = Prisma.AcademyUnitGetPayload<{
  include: { teacherOverrides: true };
}> & { teacherOverrides: readonly PrismaTeacherOverride[] };

export class AcademyUnitPersistenceMapper {
  public static toDomain(row: AcademyUnitRow): AcademyUnit {
    return AcademyUnit.reconstitute({
      id: AcademyUnitId.create(row.id),
      studentId: StudentId.create(row.studentId),
      textType: row.textType as unknown as TextType,
      position: row.position,
      state: row.state as unknown as UnitState,
      activeAttemptId: row.activeAttemptId ? AttemptId.create(row.activeAttemptId) : null,
      completedAt: row.completedAt,
      masteredAt: row.masteredAt,
      teacherOverrides: row.teacherOverrides.map((override: PrismaTeacherOverride) => this.overrideToDomain(override)),
    });
  }

  private static overrideToDomain(row: PrismaTeacherOverride): TeacherOverride {
    return TeacherOverride.reconstitute({
      id: TeacherOverrideId.create(row.id),
      teacherId: row.teacherId,
      action: row.action as unknown as OverrideAction,
      reason: row.reason,
      appliedAt: row.appliedAt,
    });
  }

  /** Separa la fila escalar de `AcademyUnit` de las filas `TeacherOverride`
   * nuevas (distinguibles por no existir aún en la base — el Repository
   * decide cuáles ya persistieron comparando contra la fila leída). */
  public static toPersistence(unit: AcademyUnit): {
    academyUnit: Prisma.AcademyUnitUncheckedCreateInput | Prisma.AcademyUnitUncheckedUpdateInput;
    teacherOverrides: readonly TeacherOverride[];
  } {
    return {
      academyUnit: {
        id: unit.id.value,
        studentId: unit.studentId.value,
        textType: unit.textType,
        position: unit.position,
        state: unit.state,
        activeAttemptId: unit.activeAttemptId?.value ?? null,
        completedAt: unit.completedAt,
        masteredAt: unit.masteredAt,
      },
      teacherOverrides: unit.teacherOverrides,
    };
  }
}
