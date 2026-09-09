import type { LearningPlan } from "../entities/LearningPlan";
import type { LearningPlanId } from "../value-objects/LearningPlanId";
import type { StudentId } from "../value-objects/StudentId";

// Puerto de dominio — sin implementación (Sprint 3.3.3+, capa de
// infraestructura, envolverá Prisma/RLS/withStudentContext detrás de esta
// interfaz). El dominio solo declara qué necesita, nunca cómo se persiste.
export interface LearningPlanRepository {
  findById(id: LearningPlanId): Promise<LearningPlan | null>;

  /** 13.4 MUST: "un estudiante puede tener múltiples planes, pero solo un
   * plan activo". Un estudiante puede acumular varios `LearningPlan`
   * históricos a lo largo del tiempo — este método nunca los resuelve.
   * Resuelve, en cambio, el plan **actual/no terminal** del estudiante:
   * `ACTIVE` o `PAUSED` (pausar un plan no debe hacerlo desaparecer del
   * modelo de lectura que el resto de Mi Plan usa para encontrar "el plan
   * del estudiante" — ver auditoría "Architectural Decision Audit — Paused
   * Learning Plan"). `COMPLETED`/`CANCELLED` quedan excluidos por ser
   * estados terminales — nunca son "el plan actual". Este es también el
   * método que permite a la capa de aplicación verificar/hacer cumplir la
   * unicidad de 13.4 (a partir de esta resolución, esa unicidad se lee
   * como "un único plan actual", no "un único plan ACTIVE") antes de
   * crear un plan nuevo. */
  findCurrentByStudentId(studentId: StudentId): Promise<LearningPlan | null>;

  save(plan: LearningPlan): Promise<void>;
}
