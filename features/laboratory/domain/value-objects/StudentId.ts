import { Identifier } from "./Identifier";

export class StudentId extends Identifier<"StudentId"> {
  public static create(value: string): StudentId {
    return new StudentId(value);
  }
}
