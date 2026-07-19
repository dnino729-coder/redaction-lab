// Puerto — registro de diagnóstico. Sin ningún compromiso con una
// implementación concreta (consola, servicio externo, etc.) — eso es
// infraestructura, fuera de alcance.
export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: unknown, context?: Record<string, unknown>): void;
}
