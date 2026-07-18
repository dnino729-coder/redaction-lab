import { Identifier } from "./Identifier";

// Identificador de LearningTask (13.4).
export class LearningTaskId extends Identifier<"LearningTaskId"> {
  protected readonly brand = "LearningTaskId" as const;

  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): LearningTaskId {
    return new LearningTaskId(value);
  }
}
