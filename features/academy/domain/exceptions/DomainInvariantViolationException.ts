import { DomainException } from "./DomainException";

// Violación genérica de un invariante de Aggregate — usada cuando ningún
// código de error específico del catálogo Frozen (Application Layer Spec
// v1.0, Sección 1) aplica directamente a nivel de dominio puro.
export class DomainInvariantViolationException extends DomainException {
  public constructor(message: string) {
    super(message, "ACADEMY_DOMAIN_INVARIANT_VIOLATION");
  }
}
