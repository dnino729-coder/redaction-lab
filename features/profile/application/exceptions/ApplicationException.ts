// Excepción base de la Application Layer de Profile — mismo patrón que
// features/my-plan/application/exceptions/ApplicationException.ts.
export abstract class ApplicationException extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
