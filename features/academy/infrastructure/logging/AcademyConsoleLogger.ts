import type { Logger } from "@/features/academy/application/ports/Logger";

// Adaptador — implementa el puerto `Logger` de Academia (mismo patrón que
// features/my-plan/infrastructure/adapters/ConsoleLogger.ts: `console.*`
// estructurado, JSON de una línea). Un logger de producción real
// (Sentry/Grafana/Prometheus) es una decisión de infraestructura
// transversal a todo el proyecto, no específica de Academia — fuera de
// alcance de este Sprint.
//
// Sanitización obligatoria (Infrastructure Model v1.1, Sección 10): nunca
// se loguea el contenido íntegro de Draft/Version/Feedback.
const FORBIDDEN_KEYS = ["content", "draftContent", "observations", "suggestion", "explanation"];

export class AcademyConsoleLogger implements Logger {
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
      scope: "academy",
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
