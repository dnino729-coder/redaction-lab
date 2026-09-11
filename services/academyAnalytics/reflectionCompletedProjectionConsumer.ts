// Orquestador del consumer (Block 2D, capa C+D) — recorre los eventos
// `ACADEMY_REFLECTION_COMPLETED` proyectables y proyecta cada uno a
// `learning_metric`. Sin lógica de dominio, sin SQL, sin HTTP: solo
// coordina el gateway (que sí hace las transacciones) y aplica el manejo
// de error/retry.
//
// PUNTO DE ENTRADA INVOCABLE (Block 2D §9): `runReflectionCompletedProjection`.
// Aún NO conectado a ningún scheduler — esa conexión (p. ej. Vercel Cron
// -> Route Handler interno) es un bloque posterior. Hoy es invocable desde
// un test, un script operativo, o manualmente. NO usar `setInterval`.

import {
  createPrismaAcademyOutboxProjectionGateway,
  type AcademyOutboxProjectionGateway,
} from "./academyOutboxProjectionGateway";

/** Tamaño de lote pequeño y determinista (Block 2D §8/§11). El orden lo
 * fija el gateway: `occurred_at ASC`. */
const DEFAULT_BATCH_SIZE = 50;

/**
 * `ACADEMY_EVENT_OUTBOX_MAX_RETRIES` — mismo nombre de variable y mismo
 * default (5) que declara `features/academy/infrastructure/config/
 * academyConfig.ts` (`events.outboxMaxRetries`). Se lee aquí directamente
 * de `process.env` para no importar desde `features/` (dirección de capa
 * incorrecta: `services/` es compartido, no depende de una feature) — la
 * variable y su default SON el contrato, no la función que los carga.
 */
function resolveMaxRetries(): number {
  const raw = Number(process.env.ACADEMY_EVENT_OUTBOX_MAX_RETRIES ?? 5);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 5;
}

export interface ReflectionProjectionRunSummary {
  readonly claimed: number;
  readonly projected: number;
  readonly skipped: number;
  readonly failed: number;
}

export interface RunReflectionCompletedProjectionDeps {
  /** Inyectable en pruebas; en producción se construye el gateway Prisma. */
  readonly gateway?: AcademyOutboxProjectionGateway;
  readonly batchSize?: number;
}

export async function runReflectionCompletedProjection(
  deps: RunReflectionCompletedProjectionDeps = {},
): Promise<ReflectionProjectionRunSummary> {
  const batchSize = deps.batchSize ?? DEFAULT_BATCH_SIZE;
  const gateway =
    deps.gateway ?? createPrismaAcademyOutboxProjectionGateway({ maxRetries: resolveMaxRetries() });

  const eventIds = await gateway.listClaimableEventIds(batchSize);

  let projected = 0;
  let skipped = 0;
  let failed = 0;

  for (const eventId of eventIds) {
    try {
      const result = await gateway.projectEvent(eventId);
      if (result.outcome === "projected") {
        projected += 1;
      } else {
        skipped += 1;
      }
    } catch (error) {
      failed += 1;
      // La transacción de proyección ya hizo ROLLBACK; esto solo registra
      // el fallo (retry_count / last_error / DEAD_LETTER) en su propia
      // transacción. Nunca deja el evento PUBLISHED.
      await gateway.recordFailure(eventId, error);
    }
  }

  return { claimed: eventIds.length, projected, skipped, failed };
}
