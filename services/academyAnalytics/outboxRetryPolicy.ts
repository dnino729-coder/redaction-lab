// Política de reintento del Outbox — YA definida por el schema
// (`AcademyOutboxStatus` enum: PENDING/FAILED/PUBLISHED/DEAD_LETTER +
// columna `retry_count` + `ACADEMY_EVENT_OUTBOX_MAX_RETRIES`). No se
// inventa una política nueva.
//
// Un evento fallido se reintenta mientras `retry_count < maxRetries`; al
// alcanzar `maxRetries` pasa a `DEAD_LETTER` y no se reprocesa
// automáticamente.
//
// La computación autoritativa vive en un único UPDATE atómico
// (`recordReflectionCompletedProjectionFailure`, `database/queries/
// academyOutboxProjection.ts`): `CASE WHEN retry_count + 1 >= maxRetries
// THEN 'DEAD_LETTER' ELSE 'FAILED' END`. Esta función replica esa misma
// expresión para el doble de pruebas en memoria y documenta la regla.

/**
 * @param retryCountBeforeAttempt `retry_count` de la fila ANTES de contar
 *   este intento fallido.
 * @param maxRetries `ACADEMY_EVENT_OUTBOX_MAX_RETRIES` (default 5).
 */
export function outboxAttemptExhaustsRetries(
  retryCountBeforeAttempt: number,
  maxRetries: number,
): boolean {
  return retryCountBeforeAttempt + 1 >= maxRetries;
}
