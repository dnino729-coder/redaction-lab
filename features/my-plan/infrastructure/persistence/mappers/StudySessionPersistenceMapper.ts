import type { StudySessionModel } from "@prisma/client";
import { StudySession } from "@/features/my-plan/domain/entities/StudySession";
import { StudySessionId } from "@/features/my-plan/domain/value-objects/StudySessionId";
import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import { LearningTaskId } from "@/features/my-plan/domain/value-objects/LearningTaskId";
import { SessionDuration } from "@/features/my-plan/domain/value-objects/SessionDuration";

export class StudySessionPersistenceMapper {
  public static toDomain(row: StudySessionModel): StudySession {
    return StudySession.restore({
      id: StudySessionId.create(row.id),
      studentId: StudentId.create(row.studentId),
      learningTaskId: LearningTaskId.create(row.learningTaskId),
      startedAt: row.startedAt,
      finishedAt: row.finishedAt,
      duration: row.durationMinutes === null ? null : SessionDuration.create(row.durationMinutes),
      completed: row.completed,
    });
  }

  public static toPersistenceData(session: StudySession): StudySessionModel {
    return {
      id: session.id.value,
      studentId: session.studentId.value,
      learningTaskId: session.learningTaskId.value,
      startedAt: session.startedAt,
      finishedAt: session.finishedAt,
      durationMinutes: session.duration ? session.duration.minutes : null,
      completed: session.completed,
    };
  }
}
