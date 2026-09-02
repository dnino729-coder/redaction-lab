export class InvalidExerciseAttemptTransitionException extends Error {
  constructor(attemptId: string, from: string, action: string) {
    super(`ExerciseAttempt "${attemptId}" en estado "${from}" no admite la operación "${action}".`);
    this.name = "InvalidExerciseAttemptTransitionException";
  }
}
