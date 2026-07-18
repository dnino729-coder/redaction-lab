import { Identifier } from "./Identifier";

// Identificador de LearningPhase (13.4).
export class LearningPhaseId extends Identifier<"LearningPhaseId"> {
  protected readonly brand = "LearningPhaseId" as const;

  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): LearningPhaseId {
    return new LearningPhaseId(value);
  }
}
