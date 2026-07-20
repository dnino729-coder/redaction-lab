import type { StudySchedule } from "@/features/my-plan/domain/entities/StudySchedule";
import type { StudyScheduleId } from "@/features/my-plan/domain/value-objects/StudyScheduleId";
import type { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import type { StudyScheduleRepository } from "@/features/my-plan/domain/repositories/StudyScheduleRepository";

import { withActiveClient } from "../PrismaClientContext";
import { StudySchedulePersistenceMapper } from "../mappers/StudySchedulePersistenceMapper";
import { translatePrismaError } from "@/features/my-plan/infrastructure/exceptions/PrismaExceptionTranslator";

export class PrismaStudyScheduleRepository implements StudyScheduleRepository {
  public async findById(id: StudyScheduleId): Promise<StudySchedule | null> {
    const row = await withActiveClient((client) =>
      client.studySchedule.findUnique({ where: { id: id.value } }),
    );
    return row ? StudySchedulePersistenceMapper.toDomain(row) : null;
  }

  /** Relación 1:1 con `LearningPlan` (13.4) — `findFirst` es equivalente
   * a `findUnique` por `learningPlanId` (columna con `@unique`, ver
   * schema.prisma), pero el delegate `findUnique` de Prisma exige el
   * nombre exacto del índice único cuando no es la PK; `findFirst` evita
   * acoplar este Repository al nombre del constraint generado. */
  public async findByLearningPlanId(learningPlanId: LearningPlanId): Promise<StudySchedule | null> {
    const row = await withActiveClient((client) =>
      client.studySchedule.findFirst({ where: { learningPlanId: learningPlanId.value } }),
    );
    return row ? StudySchedulePersistenceMapper.toDomain(row) : null;
  }

  public async save(schedule: StudySchedule): Promise<void> {
    const data = StudySchedulePersistenceMapper.toPersistenceData(schedule);
    try {
      await withActiveClient((client) =>
        client.studySchedule.upsert({ where: { id: data.id }, create: data, update: data }),
      );
    } catch (error) {
      translatePrismaError(error, "StudySchedule", schedule.id.value);
    }
  }
}
