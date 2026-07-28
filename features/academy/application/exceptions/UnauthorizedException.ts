import { ApplicationException } from "./ApplicationException";

// Traduce ACADEMY_UNAUTHORIZED_* (token ausente/inválido) — 401.
export class UnauthorizedException extends ApplicationException {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}
