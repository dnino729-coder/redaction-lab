import { Identifier } from "./Identifier";

export class ExerciseAttemptId extends Identifier<"ExerciseAttemptId"> {
  public static create(value: string): ExerciseAttemptId {
    return new ExerciseAttemptId(value);
  }
}
