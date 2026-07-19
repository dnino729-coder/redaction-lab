import { ApplicationException } from "./ApplicationException";

// Se lanza cuando un Handler busca una entidad por id (vía un Repository
// de dominio) y no la encuentra — p. ej. `LearningTaskId` inexistente en
// `CompleteLearningTaskHandler`.
export class ResourceNotFoundException extends ApplicationException {
  constructor(resourceName: string, id: string) {
    super(`${resourceName} con id "${id}" no fue encontrado.`);
  }
}
