import { Identifier } from "./Identifier";

// Identificador de StudySchedule (13.4).
export class StudyScheduleId extends Identifier<"StudyScheduleId"> {
  protected readonly brand = "StudyScheduleId" as const;

  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): StudyScheduleId {
    return new StudyScheduleId(value);
  }
}
