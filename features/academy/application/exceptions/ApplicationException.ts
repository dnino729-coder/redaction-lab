// Excepción base de la Application Layer de Academia (mismo patrón que
// Mi Plan). Todo Handler traduce las excepciones de dominio a su
// equivalente de esta jerarquía antes de que se propaguen fuera de esta
// capa — infraestructura (Route Handlers, Sprint 6.3) solo conoce este
// árbol, nunca el de dominio.
export abstract class ApplicationException extends Error {
  public abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
