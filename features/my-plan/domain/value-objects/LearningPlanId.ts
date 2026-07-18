import { Identifier } from "./Identifier";

// Identificador de LearningPlan (13.4).
export class LearningPlanId extends Identifier<"LearningPlanId"> {
  protected readonly brand = "LearningPlanId" as const;

  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): LearningPlanId {
    return new LearningPlanId(value);
  }
}
