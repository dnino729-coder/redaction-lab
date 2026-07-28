import { ApplicationException } from "./ApplicationException";

// Lanzada por validators/ ante un Request DTO sintácticamente inválido.
// El primer código de la lista se expone como `code` principal (Error
// Mapping, Infrastructure Services + API Layer v1.0 §17: 400).
export class ValidationException extends ApplicationException {
  public readonly code: string;
  public readonly fieldErrors: readonly string[];

  constructor(code: string, fieldErrors: readonly string[]) {
    super(`Solicitud inválida: ${fieldErrors.join("; ")}`);
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}
