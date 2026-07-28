import { ApplicationException } from "./ApplicationException";

// Traduce las excepciones ACADEMY_FORBIDDEN_* — control de autorización
// de aplicación (ownership, relación docente-estudiante, rol), nunca una
// regla de negocio de dominio — 403.
export class ForbiddenException extends ApplicationException {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}
