import { Identifier } from "./Identifier";

export class StudentProfileId extends Identifier<"StudentProfileId"> {
  protected readonly brand = "StudentProfileId" as const;

  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): StudentProfileId {
    return new StudentProfileId(value);
  }
}
