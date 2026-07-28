import type { TeacherRecommendation as PrismaTeacherRecommendation } from "@prisma/client";
import { TeacherRecommendation } from "@/features/academy/domain/entities/TeacherRecommendation";
import { TeacherRecommendationId } from "@/features/academy/domain/value-objects/TeacherRecommendationId";

// Persistence Mapper — TeacherRecommendation <-> Prisma (Persistence Layer
// Specification v1.0, Sección 5). Registro de infraestructura pura — no
// reconstituye ningún Aggregate de Domain (Application Layer Spec v1.0,
// CMD-11: "sin efecto de estado").
export class TeacherRecommendationPersistenceMapper {
  public static toDomain(row: PrismaTeacherRecommendation): TeacherRecommendation {
    return TeacherRecommendation.reconstitute({
      id: TeacherRecommendationId.create(row.id),
      unitId: row.academyUnitId,
      studentId: row.studentId,
      teacherId: row.teacherId,
      recommendedAt: row.recommendedAt,
    });
  }
}
