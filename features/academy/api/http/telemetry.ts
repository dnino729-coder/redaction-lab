// Telemetry (Alcance #10 del encargo: "Request duration, Handler,
// Endpoint, Status") — el proyecto real no tiene, a la fecha de este
// Sprint, ninguna infraestructura de métricas (`prom-client`/Prometheus)
// ya construida para ningún módulo (Dashboard/Mi Plan tampoco la tienen) —
// "No modificar la infraestructura de observabilidad" (restricción
// explícita del encargo) impide introducir una dependencia de métricas
// nueva a nivel de plataforma en este Sprint.
//
// Resolución: un registro en memoria, por proceso, exclusivamente de
// Academia (no toca ninguna infraestructura compartida) — acumula
// duración/handler/endpoint/status, consistente con lo que el encargo pide
// registrar, expuesto vía `getAcademyTelemetrySnapshot()` para que un
// futuro Sprint (o el propio Health Endpoint) pueda leerlo. Cada medición
// también se registra en el Logger estructurado (`logging.ts`,
// `academy_api_request_completed`), que es la fuente de verdad durable —
// este registro en memoria es solo un resumen de corto plazo, se pierde
// en cada reinicio del proceso (misma limitación que cualquier contador en
// memoria sin backend de series de tiempo).
export interface AcademyTelemetryEntry {
  readonly endpoint: string;
  readonly method: string;
  readonly status: number;
  readonly durationMs: number;
  readonly at: string;
}

const MAX_ENTRIES = 500;
const entries: AcademyTelemetryEntry[] = [];

export function recordAcademyTelemetry(entry: AcademyTelemetryEntry): void {
  entries.push(entry);
  if (entries.length > MAX_ENTRIES) entries.shift();
}

export function getAcademyTelemetrySnapshot(): readonly AcademyTelemetryEntry[] {
  return [...entries];
}
