import { Identifier } from "./Identifier";

// Identificador de LearningObjective (13.4).
export class LearningObjectiveId extends Identifier<"LearningObjectiveId"> {
  protected readonly brand = "LearningObjectiveId" as const;

  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): LearningObjectiveId {
    return new LearningObjectiveId(value);
  }
}
