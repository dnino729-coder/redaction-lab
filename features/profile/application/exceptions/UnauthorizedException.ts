import { ApplicationException } from "./ApplicationException";

export class UnauthorizedException extends ApplicationException {
  constructor(message: string) {
    super(message);
  }
}
