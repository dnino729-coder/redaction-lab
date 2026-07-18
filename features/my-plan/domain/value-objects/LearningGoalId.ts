import { Identifier } from "./Identifier";

// Identificador de LearningGoal (13.4).
export class LearningGoalId extends Identifier<"LearningGoalId"> {
  protected readonly brand = "LearningGoalId" as const;

  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): LearningGoalId {
    return new LearningGoalId(value);
  }
}
