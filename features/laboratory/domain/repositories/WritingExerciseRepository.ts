import type { WritingExercise } from "../aggregates/WritingExercise";
import type { WritingExerciseId } from "../value-objects/WritingExerciseId";
import type { StudentId } from "../value-objects/StudentId";
import type { ExerciseMode } from "../enums/ExerciseMode";

export interface WritingExerciseRepository {
  findById(id: WritingExerciseId): Promise<WritingExercise | null>;
  findAllByStudentId(studentId: StudentId, mode?: ExerciseMode): Promise<WritingExercise[]>;
  save(exercise: WritingExercise): Promise<void>;
}
