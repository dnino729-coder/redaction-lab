import type { StudySession } from "../entities/StudySession";
import type { StudySessionId } from "../value-objects/StudySessionId";
import type { LearningTaskId } from "../value-objects/LearningTaskId";
import type { StudentId } from "../value-objects/StudentId";

export interface StudySessionRepository {
  findById(id: StudySessionId): Promise<StudySession | null>;
  findByLearningTaskId(learningTaskId: LearningTaskId): Promise<StudySession[]>;

  /** Soporta InactivityPolicy (18.20.3): última sesión con `completed =
   * true` del estudiante, para calcular días de inactividad. */
  findLastCompletedByStudentId(studentId: StudentId): Promise<StudySession | null>;

  save(session: StudySession): Promise<void>;
}
