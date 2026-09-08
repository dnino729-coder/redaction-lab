import { ApplicationException } from "./ApplicationException";

export class ValidationException extends ApplicationException {
  public readonly fieldErrors: readonly string[];

  constructor(fieldErrors: readonly string[]) {
    super(`Solicitud inválida: ${fieldErrors.join("; ")}`);
    this.fieldErrors = fieldErrors;
  }
}
