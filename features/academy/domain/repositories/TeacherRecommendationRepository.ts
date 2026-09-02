import type { TeacherRecommendation } from "../entities/TeacherRecommendation";
import type { TeacherRecommendationId } from "../value-objects/TeacherRecommendationId";
import type { StudentId } from "../value-objects/StudentId";

// Puerto de repositorio (Persistence Layer v1.0 §5; Application Layer
// Spec v1.0, CMD-11) — implementado por
// PrismaTeacherRecommendationRepository en infraestructura. Sin
// `UnitOfWork` transaccional (CMD-11: "sin Aggregate de dominio que
// proteger") — `create` es una escritura de infraestructura directa.
export interface TeacherRecommendationRepository {
  findById(id: TeacherRecommendationId): Promise<TeacherRecommendation | null>;
  findByStudentId(studentId: StudentId): Promise<TeacherRecommendation[]>;
  create(recommendation: TeacherRecommendation): Promise<void>;
}
