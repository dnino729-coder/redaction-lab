// Excepción base del dominio de Profile — mismo patrón que
// features/my-plan/domain/exceptions/DomainException.ts (cada feature
// mantiene su propia copia, nunca compartida entre módulos).
interface V8ErrorConstructor {
  captureStackTrace?: (targetObject: object, constructorOpt?: unknown) => void;
}

export abstract class DomainException extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
    const errorConstructor = Error as unknown as V8ErrorConstructor;
    if (typeof errorConstructor.captureStackTrace === "function") {
      errorConstructor.captureStackTrace(this, new.target);
    }
  }
}
