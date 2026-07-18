import { DomainException } from "./DomainException";

// Se lanza cuando una `LearningTask` recibe una operación de finalización
// incompatible con su `source` (resolución 18.20.5 / 18.21, punto 2):
// las tareas `SELF_DIRECTED` solo se completan manualmente
// (`complete()`); cualquier otro `source` se completa exclusivamente vía
// el evento `EXTERNAL_ACTIVITY_COMPLETED` (`completeFromExternalEvent()`).
// Ambas rutas son mutuamente excluyentes, sin excepción.
export class InvalidTaskSourceOperationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
