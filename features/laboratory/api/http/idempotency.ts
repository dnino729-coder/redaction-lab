import { ValidationException } from "@/features/laboratory/application/exceptions/ValidationException";

// Validación de presencia del header para operaciones POST con efecto de
// negocio — mismo criterio que Academia, sin deduplicación real (fuera de
// alcance de este paso).
export function requireIdempotencyKey(request: Request): string {
  const key = request.headers.get("Idempotency-Key");
  if (!key || key.trim().length === 0) {
    throw new ValidationException("LABORATORY_VALIDATION_MISSING_IDEMPOTENCY_KEY", [
      "El header Idempotency-Key es obligatorio para esta operación.",
    ]);
  }
  return key;
}
