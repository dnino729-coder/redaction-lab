import { ApplicationException } from "./ApplicationException";

// Se lanza cuando la operación solicitada entra en conflicto con el
// estado actual del recurso — incluye la traducción de
// `InvalidStatusTransitionException`/`InvalidTaskSourceOperationException`
// del dominio (ver handlers/) y casos propios de esta capa, como intentar
// crear un plan cuando el estudiante ya tiene uno activo (13.4 MUST: "solo
// un plan activo").
export class ConflictException extends ApplicationException {
  constructor(message: string) {
    super(message);
  }
}
