import {
  Prisma,
  AcademyTextType,
} from "@prisma/client";
import type { AcademyUnitRepository } from "@/features/academy/domain/repositories/AcademyUnitRepository";
import { AcademyUnit } from "@/features/academy/domain/aggregates/AcademyUnit";
import { AcademyUnitId } from "@/features/academy/domain/value-objects/AcademyUnitId";
import { StudentId } from "@/features/academy/domain/value-objects/StudentId";
import type { TextType } from "@/features/academy/domain/enums/TextType";

import { withActiveClient } from "../PrismaClientContext";
import { AcademyUnitPersistenceMapper, type AcademyUnitRow } from "../mappers/AcademyUnitPersistenceMapper";
import { translatePrismaError } from "@/features/academy/infrastructure/exceptions/PrismaExceptionTranslator";

const UNIT_INCLUDE = { teacherOverrides: true } as const;

// Implementa `AcademyUnitRepository` (Domain Model v1.1 / Application
// Layer, Sprint 6.1 — firma real, no modificada por este Sprint). Nunca
// carga `attempts[]` completo (Domain Model v1.1, Sección 15 — límite de
// consistencia del Aggregate); solo `activeAttempt` por identidad, vía la
// columna `active_attempt_id`, ya resuelta por el propio Mapper.
export class PrismaAcademyUnitRepository implements AcademyUnitRepository {
  public async findById(id: AcademyUnitId): Promise<AcademyUnit | null> {
    const row = await withActiveClient((client) =>
      client.academyUnit.findUnique({ where: { id: id.value }, include: UNIT_INCLUDE }),
    );
    return row ? AcademyUnitPersistenceMapper.toDomain(row as AcademyUnitRow) : null;
  }

  public async findAllByStudentId(studentId: StudentId): Promise<AcademyUnit[]> {
    const rows = await withActiveClient((client) =>
      client.academyUnit.findMany({
        where: { studentId: studentId.value },
        include: UNIT_INCLUDE,
        orderBy: [{ textType: "asc" }, { position: "asc" }],
      }),
    );
    return rows.map((row) => AcademyUnitPersistenceMapper.toDomain(row as AcademyUnitRow));
  }

  public async findByStudentTextTypeAndPosition(
    studentId: StudentId,
    textType: TextType,
    position: number,
  ): Promise<AcademyUnit | null> {
    const row = await withActiveClient((client) =>
      client.academyUnit.findUnique({
        where: {
          studentId_textType_position: {
            studentId: studentId.value,
            textType: textType as unknown as AcademyTextType,
            position,
          },
        },
        include: UNIT_INCLUDE,
      }),
    );
    return row ? AcademyUnitPersistenceMapper.toDomain(row as AcademyUnitRow) : null;
  }

  public async save(unit: AcademyUnit): Promise<void> {
    const { academyUnit, teacherOverrides } = AcademyUnitPersistenceMapper.toPersistence(unit);
    try {
      await withActiveClient(async (client) => {
        await client.academyUnit.upsert({
          where: { id: unit.id.value },
          create: academyUnit as Prisma.AcademyUnitUncheckedCreateInput,
          update: academyUnit as Prisma.AcademyUnitUncheckedUpdateInput,
        });
        // TeacherOverride es inmutable una vez creada (Domain Model v1.1) —
        // `upsert` por id es idempotente y evita duplicar filas ya
        // persistidas en una llamada anterior a `save()`.
        for (const override of teacherOverrides) {
          await client.teacherOverride.upsert({
            where: { id: override.id.value },
            create: {
              id: override.id.value,
              academyUnitId: unit.id.value,
              action: override.action,
              teacherId: override.teacherId,
              reason: override.reason,
              appliedAt: override.appliedAt,
            },
            update: {
              action: override.action,
              teacherId: override.teacherId,
              reason: override.reason,
              appliedAt: override.appliedAt,
            },
          });
        }
      });
    } catch (error) {
      translatePrismaError(error, "AcademyUnit", unit.id.value);
    }
  }
}
