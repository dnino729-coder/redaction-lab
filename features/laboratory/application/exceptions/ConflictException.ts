import { ApplicationException } from "./ApplicationException";

export class ConflictException extends ApplicationException {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}
