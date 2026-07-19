import { ApplicationException } from "./ApplicationException";

// Se lanza por los validators/ de esta capa ante un Request DTO
// sintácticamente inválido (UUID mal formado, campo obligatorio ausente,
// fuera de rango, tipo incorrecto) — nunca por una violación de una regla
// de negocio (esas siguen viviendo en el dominio y se traducen a
// ConflictException, no a esta excepción).
export class ValidationException extends ApplicationException {
  public readonly fieldErrors: readonly string[];

  constructor(fieldErrors: readonly string[]) {
    super(`Solicitud inválida: ${fieldErrors.join("; ")}`);
    this.fieldErrors = fieldErrors;
  }
}
