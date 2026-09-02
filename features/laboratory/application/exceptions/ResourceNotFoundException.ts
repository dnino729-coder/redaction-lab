import { ApplicationException } from "./ApplicationException";

export class ResourceNotFoundException extends ApplicationException {
  public readonly code: string;

  constructor(code: string, resourceName: string, id: string) {
    super(`${resourceName} con id "${id}" no fue encontrado.`);
    this.code = code;
  }
}
