import type { ExerciseAttempt } from "../aggregates/ExerciseAttempt";
import type { ExerciseAttemptId } from "../value-objects/ExerciseAttemptId";
import type { WritingExerciseId } from "../value-objects/WritingExerciseId";

export interface ExerciseAttemptRepository {
  findById(id: ExerciseAttemptId): Promise<ExerciseAttempt | null>;
  findActiveByExerciseId(exerciseId: WritingExerciseId): Promise<ExerciseAttempt | null>;
  findAllByExerciseId(exerciseId: WritingExerciseId): Promise<ExerciseAttempt[]>;
  /** Siguiente `attemptNumber` disponible para el ejercicio (1 si no tiene ninguno todavía). */
  getNextAttemptNumber(exerciseId: WritingExerciseId): Promise<number>;
  save(attempt: ExerciseAttempt): Promise<void>;
}
