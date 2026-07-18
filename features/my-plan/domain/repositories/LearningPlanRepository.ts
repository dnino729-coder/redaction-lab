import type { LearningPlan } from "../entities/LearningPlan";
import type { LearningPlanId } from "../value-objects/LearningPlanId";
import type { StudentId } from "../value-objects/StudentId";

// Puerto de dominio — sin implementación (Sprint 3.3.3+, capa de
// infraestructura, envolverá Prisma/RLS/withStudentContext detrás de esta
// interfaz). El dominio solo declara qué necesita, nunca cómo se persiste.
export interface LearningPlanRepository {
  findById(id: LearningPlanId): Promise<LearningPlan | null>;

  /** 13.4 MUST: "un estudiante puede tener múltiples planes, pero solo un
   * plan activo" — este método es el que permite a la capa de aplicación
   * verificar/hacer cumplir esa unicidad antes de crear un plan nuevo. */
  findActiveByStudentId(studentId: StudentId): Promise<LearningPlan | null>;

  save(plan: LearningPlan): Promise<void>;
}
