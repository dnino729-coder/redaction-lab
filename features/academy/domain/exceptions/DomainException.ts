// Clase base de toda excepción de dominio de Academia — copia exacta del
// patrón ya en producción en
// features/my-plan/domain/exceptions/DomainException.ts. Usa
// `new.target.name` para que cada subclase concreta reporte su propio
// nombre, y declara localmente la interfaz de V8 necesaria para
// `captureStackTrace` sin depender de @types/node.
interface V8ErrorConstructor {
  captureStackTrace?: (
    targetObject: object,
    constructorOpt?: unknown
  ) => void;
}
export abstract class DomainException extends Error {
  public readonly code: string;

  protected constructor(message: string, code: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;

    const ctor = Error as V8ErrorConstructor;
    if (typeof ctor.captureStackTrace === "function") {
      ctor.captureStackTrace(this, new.target);
    }
  }
}
