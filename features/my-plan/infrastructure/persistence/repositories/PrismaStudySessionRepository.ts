import type { StudySession } from "@/features/my-plan/domain/entities/StudySession";
import type { StudySessionId } from "@/features/my-plan/domain/value-objects/StudySessionId";
import type { LearningTaskId } from "@/features/my-plan/domain/value-objects/LearningTaskId";
import type { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import type { StudySessionRepository } from "@/features/my-plan/domain/repositories/StudySessionRepository";

import { withActiveClient } from "../PrismaClientContext";
import { StudySessionPersistenceMapper } from "../mappers/StudySessionPersistenceMapper";
import { translatePrismaError } from "@/features/my-plan/infrastructure/exceptions/PrismaExceptionTranslator";

export class PrismaStudySessionRepository implements StudySessionRepository {
  public async findById(id: StudySessionId): Promise<StudySession | null> {
    const row = await withActiveClient((client) =>
      client.studySession.findUnique({ where: { id: id.value } }),
    );
    return row ? StudySessionPersistenceMapper.toDomain(row) : null;
  }

  public async findByLearningTaskId(learningTaskId: LearningTaskId): Promise<StudySession[]> {
    const rows = await withActiveClient((client) =>
      client.studySession.findMany({ where: { learningTaskId: learningTaskId.value } }),
    );
    return rows.map(StudySessionPersistenceMapper.toDomain);
  }

  /** Soporta `InactivityPolicy` (18.20.3) — última sesión con `completed
   * = true` del estudiante, ordenada por `startedAt` descendente. */
  public async findLastCompletedByStudentId(studentId: StudentId): Promise<StudySession | null> {
    const row = await withActiveClient((client) =>
      client.studySession.findFirst({
        where: { studentId: studentId.value, completed: true },
        orderBy: { startedAt: "desc" },
      }),
    );
    return row ? StudySessionPersistenceMapper.toDomain(row) : null;
  }

  public async save(session: StudySession): Promise<void> {
    const data = StudySessionPersistenceMapper.toPersistenceData(session);
    try {
      await withActiveClient((client) =>
        client.studySession.upsert({ where: { id: data.id }, create: data, update: data }),
      );
    } catch (error) {
      translatePrismaError(error, "StudySession", session.id.value);
    }
  }
}
