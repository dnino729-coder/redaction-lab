import { Identifier } from "./Identifier";

// Identificador del estudiante propietario (User.id, 13.4/13.1) — usado por StudySession.student_id y como aggregateId/payload de los 5 domain events (2.9).
export class StudentId extends Identifier<"StudentId"> {
  protected readonly brand = "StudentId" as const;

  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): StudentId {
    return new StudentId(value);
  }
}
