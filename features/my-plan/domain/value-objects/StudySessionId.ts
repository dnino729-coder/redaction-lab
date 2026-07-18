import { Identifier } from "./Identifier";

// Identificador de StudySession (13.4).
export class StudySessionId extends Identifier<"StudySessionId"> {
  protected readonly brand = "StudySessionId" as const;

  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): StudySessionId {
    return new StudySessionId(value);
  }
}
