import { ValidationException } from "@/features/academy/application/exceptions/ValidationException";

// Validation (Alcance #3) — Idempotency-Key (API Contract v1.3, Secciones
// 2/6): "todo endpoint POST que crea un recurso con efecto de negocio...
// exige el header Idempotency-Key"; su ausencia produce 400. Este Sprint
// implementa la VALIDACIÓN de presencia (visible desde la API, exigida por
// el contrato) — la deduplicación real ("misma respuesta ante una
// repetición... sin duplicar el efecto, ventana de 24h") requeriría un
// almacén de claves ya procesadas que no existe en Infrastructure
// (`ProcessedEventIdempotencyStore` del Composition Root Frozen es para
// idempotencia de CONSUMO de eventos del Outbox, un concepto distinto,
// nunca para deduplicar requests HTTP) — construir ese almacén sería
// Infrastructure nueva, fuera de alcance de este Sprint. Disclosed en el
// informe de entrega: la deduplicación de 24h NO está implementada.
export function requireIdempotencyKey(request: Request): string {
  const key = request.headers.get("Idempotency-Key");
  if (!key || key.trim().length === 0) {
    throw new ValidationException("ACADEMY_VALIDATION_MISSING_IDEMPOTENCY_KEY", [
      "El header Idempotency-Key es obligatorio para esta operación.",
    ]);
  }
  return key;
}
