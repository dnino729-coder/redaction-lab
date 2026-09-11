// Parseo puro del payload de un evento `ACADEMY_REFLECTION_COMPLETED`
// leído de `academy_outbox`. Sin acceso a base de datos.
//
// `PrismaAcademyOutboxPort.toJsonPayload` envuelve el payload del evento de
// dominio, así que la forma real de la columna `payload` es:
//   { eventName, aggregateId, occurredAt, payload: { attemptId, unitId,
//     studentId, comprehensionVerified }, metadata }

/** Forma laxa de UUID (8-4-4-4-12 hex) — no exige la versión/variante v4
 * exacta: la FK real `learning_metric.student_id -> user.id (@db.Uuid)` es
 * la validación autoritativa; esto solo rechaza basura evidente antes de
 * llegar a la base de datos. */
const UUID_SHAPE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class InvalidReflectionCompletedPayloadError extends Error {
  public constructor(reason: string) {
    super(`payload de ACADEMY_REFLECTION_COMPLETED inválido: ${reason}`);
    this.name = "InvalidReflectionCompletedPayloadError";
  }
}

export interface ReflectionCompletedProjectionData {
  readonly studentId: string;
  readonly attemptId: string;
  readonly unitId: string;
}

export function parseReflectionCompletedOutboxPayload(
  payload: unknown,
): ReflectionCompletedProjectionData {
  if (typeof payload !== "object" || payload === null) {
    throw new InvalidReflectionCompletedPayloadError("no es un objeto");
  }
  const inner = (payload as Record<string, unknown>).payload;
  if (typeof inner !== "object" || inner === null) {
    throw new InvalidReflectionCompletedPayloadError("falta el objeto `payload` anidado");
  }
  const record = inner as Record<string, unknown>;
  const studentId = record.studentId;
  const attemptId = record.attemptId;
  const unitId = record.unitId;

  if (typeof studentId !== "string" || !UUID_SHAPE.test(studentId)) {
    throw new InvalidReflectionCompletedPayloadError(
      "`studentId` ausente o no tiene forma de UUID",
    );
  }
  if (typeof attemptId !== "string" || !UUID_SHAPE.test(attemptId)) {
    throw new InvalidReflectionCompletedPayloadError(
      "`attemptId` ausente o no tiene forma de UUID",
    );
  }
  if (typeof unitId !== "string" || !UUID_SHAPE.test(unitId)) {
    throw new InvalidReflectionCompletedPayloadError("`unitId` ausente o no tiene forma de UUID");
  }

  return { studentId, attemptId, unitId };
}
