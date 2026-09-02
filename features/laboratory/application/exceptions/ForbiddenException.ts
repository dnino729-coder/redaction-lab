import { ApplicationException } from "./ApplicationException";

export class ForbiddenException extends ApplicationException {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}
