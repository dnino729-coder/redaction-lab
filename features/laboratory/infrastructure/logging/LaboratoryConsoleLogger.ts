import type { Logger } from "@/features/laboratory/application/ports/Logger";

// Adaptador — implementa el puerto `Logger` de Laboratoire (mismo patrón
// que features/academy/infrastructure/logging/AcademyConsoleLogger.ts:
// `console.*` estructurado, JSON de una línea).
//
// Sanitización obligatoria: nunca se loguea el contenido íntegro de un
// ejercicio/intento (mismo criterio que Academia con Draft/Version/Feedback).
const FORBIDDEN_KEYS = ["content", "draftContent", "observations", "suggestion", "explanation", "guidedPrompt"];

export class LaboratoryConsoleLogger implements Logger {
  public debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === "production") return;
    this.write("debug", message, context);
  }

  public info(message: string, context?: Record<string, unknown>): void {
    this.write("info", message, context);
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    this.write("warn", message, context);
  }

  public error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    this.write("error", message, {
      ...this.sanitize(context ?? {}),
      error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
    });
  }

  private sanitize(context: Record<string, unknown>): Record<string, unknown> {
    const clone = { ...context };
    for (const key of FORBIDDEN_KEYS) {
      if (key in clone) clone[key] = "[REDACTED]";
    }
    return clone;
  }

  private write(level: "debug" | "info" | "warn" | "error", message: string, context?: Record<string, unknown>): void {
    const entry = {
      level,
      scope: "laboratory",
      message,
      ...(context ? { context: this.sanitize(context) } : {}),
      timestamp: new Date().toISOString(),
    };
    const line = JSON.stringify(entry);
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
  }
}
