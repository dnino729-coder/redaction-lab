import { Identifier } from "./Identifier";

// Identificador del estudiante propietario (User.id) — copia propia de
// Profile, mismo valor que features/my-plan/domain/value-objects/StudentId.ts
// pero sin importarlo cross-feature (aislamiento entre módulos).
export class StudentId extends Identifier<"StudentId"> {
  protected readonly brand = "StudentId" as const;

  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): StudentId {
    return new StudentId(value);
  }
}
