// Punto de entrada de instrumentación de Next.js (convención del framework,
// ejecutado una vez al arrancar el servidor). Registra OpenTelemetry
// (sección 15.5: "Herramientas a integrar: Sentry, PostHog, OpenTelemetry,
// Prometheus, Grafana").
//
// Corrige el hallazgo 11 de la auditoría de infraestructura: Sentry y
// PostHog ya estaban wireados (dependencias en package.json), pero no
// existía ningún exportador de trazas OpenTelemetry. Prometheus y Grafana
// no requieren dependencia npm — son sistemas del lado de operaciones que
// consumen las métricas/trazas exportadas por este SDK (vía OTLP) o los
// endpoints de /api/health (sección 15.5); no se instala ningún cliente
// adicional para ellos aquí.

import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({ serviceName: "redaction-lab" });
}
