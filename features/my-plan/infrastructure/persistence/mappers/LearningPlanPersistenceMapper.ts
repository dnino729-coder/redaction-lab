import type { LearningPlanModel } from "@prisma/client";
import { LearningPlan } from "@/features/my-plan/domain/entities/LearningPlan";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import type { CefrLevel } from "@/features/my-plan/domain/enums/CefrLevel";
import type { LearningPlanStatus } from "@/features/my-plan/domain/enums/LearningPlanStatus";

// Mapper de persistencia bidireccional — Dominio ⇄ fila `learning_plan`
// (schema.prisma, Sprint 3.3.1). Nunca se devuelve el tipo generado por
// Prisma hacia Application: todo Repository pasa primero por aquí.
// `DelfLevel`/`LearningPlanStatus` de Prisma y `CefrLevel`/
// `LearningPlanStatus` del dominio son uniones de string literal con
// exactamente los mismos miembros (por diseño, ver 13.13 "una única
// convención") — la asignación es estructural, sin necesidad de tabla de
// conversión ni `as unknown as`.
export class LearningPlanPersistenceMapper {
  public static toDomain(row: LearningPlanModel): LearningPlan {
    return LearningPlan.restore({
      id: LearningPlanId.create(row.id),
      studentId: StudentId.create(row.studentId),
      name: row.name,
      description: row.description,
      targetLevel: row.targetLevel as CefrLevel,
      startDate: row.startDate,
      endDate: row.endDate,
      status: row.status as LearningPlanStatus,
    });
  }

  /** Forma común a `create`/`update` — Prisma `upsert` reutiliza el mismo
   * objeto de datos en ambas ramas porque `LearningPlan` no tiene campos
   * exclusivos de creación (el propio `id` ya viene resuelto por
   * `UuidGenerator` en Application Layer, nunca autogenerado por
   * Postgres en este flujo). */
  public static toPersistenceData(plan: LearningPlan): Omit<LearningPlanModel, "createdAt" | "updatedAt"> {
    return {
      id: plan.id.value,
      studentId: plan.studentId.value,
      name: plan.name,
      description: plan.description,
      targetLevel: plan.targetLevel,
      startDate: plan.startDate,
      endDate: plan.endDate,
      status: plan.status,
    };
  }
}
