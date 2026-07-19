import { ApplicationException } from "./ApplicationException";

// Se lanza cuando el `studentId` que ejecuta la operación no es el
// propietario del recurso solicitado (verificado por
// services/OwnershipVerificationService.ts) — p. ej. un estudiante
// intentando completar una LearningTask de otro estudiante. Es un control
// de autorización de aplicación, no una regla de negocio de dominio (el
// dominio no conoce "quién" ejecuta la operación más allá de los
// parámetros que se le pasan explícitamente).
export class ForbiddenException extends ApplicationException {
  constructor(message: string) {
    super(message);
  }
}
