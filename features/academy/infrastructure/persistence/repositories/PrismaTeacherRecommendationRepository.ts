import type { Prisma } from "@prisma/client";
import type { TeacherRecommendationRepository } from "@/features/academy/domain/repositories/TeacherRecommendationRepository";
import { TeacherRecommendation } from "@/features/academy/domain/entities/TeacherRecommendation";
import { TeacherRecommendationId } from "@/features/academy/domain/value-objects/TeacherRecommendationId";
import { StudentId } from "@/features/academy/domain/value-objects/StudentId";

import { withActiveClient } from "../PrismaClientContext";
import { TeacherRecommendationPersistenceMapper } from "../mappers/TeacherRecommendationPersistenceMapper";
import { translatePrismaError } from "@/features/academy/infrastructure/exceptions/PrismaExceptionTranslator";

// Implementa `TeacherRecommendationRepository` (Domain Model v1.1 /
// Application Layer, Sprint 6.1 — firma real: findById/findByStudentId/
// create(entity), sin UnitOfWork transaccional — CMD-11: "sin Aggregate de
// dominio que proteger", escritura de infraestructura directa.
export class PrismaTeacherRecommendationRepository implements TeacherRecommendationRepository {
  public async findById(id: TeacherRecommendationId): Promise<TeacherRecommendation | null> {
    const row = await withActiveClient((client) =>
      client.teacherRecommendation.findUnique({ where: { id: id.value } }),
    );
    return row ? TeacherRecommendationPersistenceMapper.toDomain(row) : null;
  }

  public async findByStudentId(studentId: StudentId): Promise<TeacherRecommendation[]> {
    const rows = await withActiveClient((client) =>
      client.teacherRecommendation.findMany({
        where: { studentId: studentId.value },
        orderBy: { recommendedAt: "desc" },
      }),
    );
    return rows.map((row) => TeacherRecommendationPersistenceMapper.toDomain(row));
  }

  public async create(recommendation: TeacherRecommendation): Promise<void> {
    const data: Prisma.TeacherRecommendationUncheckedCreateInput = {
      id: recommendation.id.value,
      academyUnitId: recommendation.unitId,
      studentId: recommendation.studentId,
      teacherId: recommendation.teacherId,
      recommendedAt: recommendation.recommendedAt,
    };
    try {
      await withActiveClient((client) => client.teacherRecommendation.create({ data }));
    } catch (error) {
      translatePrismaError(error, "TeacherRecommendation", recommendation.id.value);
    }
  }
}
