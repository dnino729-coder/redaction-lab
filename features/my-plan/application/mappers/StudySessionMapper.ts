import type { StudySession } from "@/features/my-plan/domain/entities/StudySession";
import type { StudySessionResponseDto } from "../dto/StudySessionDto";

export class StudySessionMapper {
  public static toResponseDto(session: StudySession): StudySessionResponseDto {
    return {
      id: session.id.value,
      studentId: session.studentId.value,
      learningTaskId: session.learningTaskId.value,
      startedAt: session.startedAt.toISOString(),
      finishedAt: session.finishedAt ? session.finishedAt.toISOString() : null,
      durationMinutes: session.duration ? session.duration.minutes : null,
      completed: session.completed,
    };
  }
}
