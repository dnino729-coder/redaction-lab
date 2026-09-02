import { ApplicationException } from "./ApplicationException";

export class ValidationException extends ApplicationException {
  public readonly code: string;
  public readonly fieldErrors: readonly string[];

  constructor(code: string, fieldErrors: readonly string[]) {
    super(`Solicitud inválida: ${fieldErrors.join("; ")}`);
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}
