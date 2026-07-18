import { DomainException } from "./DomainException";

// Se lanza cuando se intenta una transición de `status` no permitida por la
// tabla de transiciones válidas de la resolución 18.21 — p. ej.
// COMPLETED → CANCELLED (prohibida sin excepción) o cualquier transición
// desde CANCELLED (estado terminal, sin reactivación).
export class InvalidStatusTransitionException extends DomainException {
  constructor(entityName: string, from: string, to: string) {
    super(
      `Transición de estado no permitida en ${entityName}: "${from}" → "${to}" ` +
        `(resolución 18.21, tabla de transiciones válidas).`,
    );
  }
}
