import type { Logger } from "@/features/my-plan/application/ports/Logger";

// Adaptador — implementa el puerto `Logger` con `console.*` estructurado
// (JSON de una línea). Placeholder mínimo intencional: el documento
// consolidado (sección de monitoreo) señala Sentry/Grafana/Prometheus
// como observabilidad objetivo del proyecto — integrar un logger de
// producción real es una decisión de infraestructura transversal a todo
// el proyecto, no específica de Mi Plan, y por tanto fuera de alcance de
// este sprint. Esta clase satisface el puerto `Logger` ya definido sin
// inventar esa integración.
export class ConsoleLogger implements Logger {
  public debug(message: string, context?: Record<string, unknown>): void {
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
      ...context,
      error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
    });
  }

  private write(level: "debug" | "info" | "warn" | "error", message: string, context?: Record<string, unknown>): void {
    const entry = {
      level,
      scope: "my-plan",
      message,
      ...(context ? { context } : {}),
      timestamp: new Date().toISOString(),
    };
    const line = JSON.stringify(entry);
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
  }
}
