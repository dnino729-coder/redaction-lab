import { ApplicationException } from "./ApplicationException";

// Traduce las excepciones ACADEMY_NOT_FOUND_* del catálogo Frozen
// (Application Layer Spec v1.0, Sección 1) — 404.
export class ResourceNotFoundException extends ApplicationException {
  public readonly code: string;

  constructor(code: string, resourceName: string, id: string) {
    super(`${resourceName} con id "${id}" no fue encontrado.`);
    this.code = code;
  }
}
