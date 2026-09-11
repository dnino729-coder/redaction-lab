// Consultas Prisma reutilizables — acceso al Outbox de Academia
// (`academy_outbox`) para el primer pipeline de Analytics (Block 2D:
// ReflectionCompletedEvent -> learning_metric). Sin reglas de negocio:
// solo acceso a datos. La orquestación, el parseo del payload y la
// decisión de qué campo se proyecta viven en `services/academyAnalytics/`.
//
// Por qué SQL crudo aquí (y no `tx.academyOutbox.findMany`): el consumer
// necesita `FOR UPDATE SKIP LOCKED` (reclamo seguro entre workers
// concurrentes), `pg_advisory_xact_lock` (serialización por estudiante) y
// `payload #>> '{...}'` (extracción del studentId anidado) — ninguno
// expresable con el query builder de Prisma. Mismo criterio ya aplicado en
// `database/repositories/withStudentContext.ts` (SQL crudo dentro de una
// transacción Prisma).
//
// Estructura real de `academy_outbox.payload` (la fija
// `PrismaAcademyOutboxPort.toJsonPayload`):
//   { eventName, aggregateId, occurredAt, payload: { ...payload del evento
//   de dominio... }, metadata }
// -> el `studentId` del `ReflectionCompletedEvent` vive en
//    `payload -> 'payload' ->> 'studentId'`  ==  `payload #>> '{payload,studentId}'`.

import type { StudentScopedClient } from "@/database/repositories/withStudentContext";

/** `event_name` real almacenado por `ReflectionCompletedEvent`
 * (`DomainEvent.eventName`), NO el nombre de la clase TypeScript. */
export const REFLECTION_COMPLETED_EVENT_NAME = "ACADEMY_REFLECTION_COMPLETED";

/**
 * Candidatos a proyectar: eventos `ReflectionCompleted` en estado `PENDING`,
 * o `FAILED` cuyo `retry_count` aún no agota `maxRetries`
 * (ACADEMY_EVENT_OUTBOX_MAX_RETRIES). Excluye `PUBLISHED` (ya proyectado) y
 * `DEAD_LETTER` (no se reprocesa automáticamente). Orden determinista por
 * `occurred_at` (índice `idx_academy_outbox_status_occurred_at`). Lectura
 * sin bloqueo — el reclamo real y el re-chequeo de estado ocurren en
 * `claimReflectionCompletedEventForUpdate`, dentro de la transacción de
 * proyección.
 */
export async function selectClaimableReflectionCompletedEventIds(
  tx: StudentScopedClient,
  params: { batchSize: number; maxRetries: number },
): Promise<string[]> {
  const rows = await tx.$queryRaw<{ id: string }[]>`
    SELECT id::text AS id
    FROM academy_outbox
    WHERE event_name = ${REFLECTION_COMPLETED_EVENT_NAME}
      AND (
        status = 'PENDING'
        OR (status = 'FAILED' AND retry_count < ${params.maxRetries})
      )
    ORDER BY occurred_at ASC, id ASC
    LIMIT ${params.batchSize}
  `;
  return rows.map((r) => r.id);
}

export interface ClaimedOutboxEvent {
  id: string;
  payload: unknown;
  retryCount: number;
}

/**
 * Reclama una fila para procesar: la bloquea (`FOR UPDATE SKIP LOCKED`) y
 * re-verifica que siga siendo proyectable (`PENDING`/`FAILED` y del
 * `event_name` correcto). Devuelve `null` si otra transacción la tiene
 * bloqueada, o si ya no es proyectable (otro worker la marcó `PUBLISHED`,
 * o pasó a `DEAD_LETTER`). DEBE ejecutarse dentro de la MISMA transacción
 * que `markReflectionCompletedEventPublished` + el INSERT en
 * `learning_metric`, para que el marcado y la proyección sean atómicos.
 */
export async function claimReflectionCompletedEventForUpdate(
  tx: StudentScopedClient,
  eventId: string,
): Promise<ClaimedOutboxEvent | null> {
  const rows = await tx.$queryRaw<{ id: string; payload: unknown; retry_count: number }[]>`
    SELECT id::text AS id, payload, retry_count
    FROM academy_outbox
    WHERE id = ${eventId}::uuid
      AND event_name = ${REFLECTION_COMPLETED_EVENT_NAME}
      AND status IN ('PENDING', 'FAILED')
    FOR UPDATE SKIP LOCKED
  `;
  const row = rows[0];
  if (!row) return null;
  return { id: row.id, payload: row.payload, retryCount: row.retry_count };
}

/**
 * Serializa todas las proyecciones de `learning_metric` de un mismo
 * estudiante entre workers concurrentes: lock consultivo de ámbito de
 * transacción (se libera solo en COMMIT/ROLLBACK, no requiere ningún
 * privilegio de tabla). Sin esto, dos eventos distintos del mismo
 * estudiante procesados a la vez podrían leer el mismo "snapshot previo" y
 * producir un lost update en el conteo append-only.
 */
export async function acquireStudentProjectionLock(
  tx: StudentScopedClient,
  studentId: string,
): Promise<void> {
  await tx.$executeRaw`
    SELECT pg_advisory_xact_lock(
      hashtext('academy_analytics.learning_metric'),
      hashtext(${studentId})
    )
  `;
}

/**
 * Definición de `completedTasks` para este slice (Block 2D §5): "cantidad
 * de ReflectionCompletedEvent distintos que han sido proyectados para el
 * estudiante" == filas `ACADEMY_REFLECTION_COMPLETED` en estado
 * `PUBLISHED` para ese `studentId`. Llamar DESPUÉS de
 * `markReflectionCompletedEventPublished` dentro de la misma transacción,
 * para que el evento actual quede incluido en el conteo. Es una definición
 * auto-consistente (contar un conjunto fijo siempre da el mismo número) —
 * no un contador incremental que pueda derivar.
 */
export async function countPublishedReflectionCompletedForStudent(
  tx: StudentScopedClient,
  studentId: string,
): Promise<number> {
  const rows = await tx.$queryRaw<{ n: number }[]>`
    SELECT count(*)::int AS n
    FROM academy_outbox
    WHERE event_name = ${REFLECTION_COMPLETED_EVENT_NAME}
      AND status = 'PUBLISHED'
      AND payload #>> '{payload,studentId}' = ${studentId}
  `;
  return rows[0]?.n ?? 0;
}

export async function markReflectionCompletedEventPublished(
  tx: StudentScopedClient,
  eventId: string,
): Promise<void> {
  await tx.$executeRaw`
    UPDATE academy_outbox
    SET status = 'PUBLISHED', published_at = now()
    WHERE id = ${eventId}::uuid
  `;
}

/**
 * Ruta de fallo — se ejecuta en su PROPIA transacción (la de proyección ya
 * hizo ROLLBACK, así que `status` sigue en `PENDING`/`FAILED` y no hay fila
 * en `learning_metric`). Incrementa `retry_count`, registra `last_error` y
 * pasa a `DEAD_LETTER` en cuanto `retry_count` alcanza `maxRetries`
 * (ACADEMY_EVENT_OUTBOX_MAX_RETRIES) — la política ya definida por el enum
 * `AcademyOutboxStatus` del schema, no una nueva. El `CASE` calcula el
 * estado en el mismo UPDATE atómico (sin read-modify-write); refleja
 * exactamente `outboxAttemptExhaustsRetries` de
 * `services/academyAnalytics/outboxRetryPolicy.ts`.
 *
 * Nota SQL: el resultado del `CASE` se castea explícitamente a
 * `"AcademyOutboxStatus"` — un `CASE` con dos ramas string resuelve a
 * `text`, y `text -> enum` no es coacción implícita en un `SET` (a
 * diferencia de `SET status = 'PUBLISHED'`, donde el literal `unknown` sí
 * se coacciona al tipo de la columna). Verificado contra la base real.
 */
export async function recordReflectionCompletedProjectionFailure(
  tx: StudentScopedClient,
  params: { eventId: string; errorText: string; maxRetries: number },
): Promise<void> {
  await tx.$executeRaw`
    UPDATE academy_outbox
    SET retry_count = retry_count + 1,
        last_error = left(${params.errorText}, 4000),
        status = (
          CASE
            WHEN retry_count + 1 >= ${params.maxRetries} THEN 'DEAD_LETTER'
            ELSE 'FAILED'
          END
        )::"AcademyOutboxStatus"
    WHERE id = ${params.eventId}::uuid
      AND status IN ('PENDING', 'FAILED')
  `;
}
