import { Identifier } from "./Identifier";

export class WritingExerciseId extends Identifier<"WritingExerciseId"> {
  public static create(value: string): WritingExerciseId {
    return new WritingExerciseId(value);
  }
}
