import { ExerciseAttempt } from "../aggregates/ExerciseAttempt";
import { ExerciseAttemptId } from "../value-objects/ExerciseAttemptId";
import { WritingExerciseId } from "../value-objects/WritingExerciseId";
import { AttemptNumber } from "../value-objects/AttemptNumber";

export interface StartExerciseAttemptInput {
  newId: () => string;
  writingExerciseId: string;
  attemptNumber: number;
}

export class ExerciseAttemptFactory {
  public start(input: StartExerciseAttemptInput): ExerciseAttempt {
    return ExerciseAttempt.start({
      id: ExerciseAttemptId.create(input.newId()),
      writingExerciseId: WritingExerciseId.create(input.writingExerciseId),
      attemptNumber: AttemptNumber.create(input.attemptNumber),
    });
  }
}
