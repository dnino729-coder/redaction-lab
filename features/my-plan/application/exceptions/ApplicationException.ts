// Excepción base de la Application Layer de Mi Plan. Nunca se reutilizan
// las excepciones del dominio (`DomainException` y sus subclases,
// features/my-plan/domain/exceptions/) fuera de esta capa: cuando un
// Handler captura una excepción de dominio, la traduce a una excepción de
// aplicación equivalente (ver handlers/) — así infraestructura (un
// futuro controlador HTTP, por ejemplo) solo necesita conocer este árbol
// de excepciones, no el del dominio.
export abstract class ApplicationException extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
