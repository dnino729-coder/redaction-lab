import type { LearningPlan } from "@/features/my-plan/domain/entities/LearningPlan";
import type { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import type { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import type { LearningPlanRepository } from "@/features/my-plan/domain/repositories/LearningPlanRepository";

import { withActiveClient } from "../PrismaClientContext";
import { LearningPlanPersistenceMapper } from "../mappers/LearningPlanPersistenceMapper";
import { translatePrismaError } from "@/features/my-plan/infrastructure/exceptions/PrismaExceptionTranslator";

// Adaptador — implementa exactamente `LearningPlanRepository` (Domain
// Layer, Sprint 3.3.2). Nunca contiene reglas de negocio: solo traduce
// entre la interfaz de dominio y las llamadas Prisma correspondientes.
export class PrismaLearningPlanRepository implements LearningPlanRepository {
  public async findById(id: LearningPlanId): Promise<LearningPlan | null> {
    const row = await withActiveClient((client) =>
      client.learningPlan.findUnique({ where: { id: id.value } }),
    );
    return row ? LearningPlanPersistenceMapper.toDomain(row) : null;
  }

  public async findActiveByStudentId(studentId: StudentId): Promise<LearningPlan | null> {
    const row = await withActiveClient((client) =>
      client.learningPlan.findFirst({
        where: { studentId: studentId.value, status: "ACTIVE" },
      }),
    );
    return row ? LearningPlanPersistenceMapper.toDomain(row) : null;
  }

  public async save(plan: LearningPlan): Promise<void> {
    const data = LearningPlanPersistenceMapper.toPersistenceData(plan);
    try {
      await withActiveClient((client) =>
        client.learningPlan.upsert({
          where: { id: data.id },
          create: data,
          update: data,
        }),
      );
    } catch (error) {
      translatePrismaError(error, "LearningPlan", plan.id.value);
    }
  }
}
