import { DomainException } from "./DomainException";

// Se lanza cuando un Value Object/entidad de Profile recibe datos que
// violan un invariante de dominio — p. ej. un identificador que no es un
// UUID válido.
export class DomainInvariantViolationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
