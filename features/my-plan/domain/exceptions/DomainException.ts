// Excepción base del dominio de Mi Plan — Sprint 3.3.2 (Domain Layer).
//
// Ninguna regla de negocio de este módulo lanza `Error` genérico: todas las
// violaciones de invariante o de transición se modelan como subclases de
// `DomainException`, para que la capa de aplicación (fuera de alcance de
// este sprint) pueda distinguir errores de dominio de errores de
// infraestructura sin inspeccionar mensajes de texto.

// Tipo estructural mínimo para la extensión de V8 `Error.captureStackTrace`
// (Node.js/Next.js) — no forma parte de `lib.es2022.d.ts`, por lo que se
// declara aquí en vez de depender de `@types/node`: el dominio permanece
// verificable con `tsc` sin ninguna dependencia externa, ni siquiera de
// tipos.
interface V8ErrorConstructor {
  captureStackTrace?: (targetObject: object, constructorOpt?: unknown) => void;
}

export abstract class DomainException extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
    // Mantiene el stack trace correcto en motores V8 (Node/Next.js) sin
    // introducir ninguna dependencia — `Error.captureStackTrace` es una
    // API del runtime de JavaScript, no de infraestructura de la app.
    const errorConstructor = Error as unknown as V8ErrorConstructor;
    if (typeof errorConstructor.captureStackTrace === "function") {
      errorConstructor.captureStackTrace(this, new.target);
    }
  }
}
