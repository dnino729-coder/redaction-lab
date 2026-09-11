// Gateway del consumer (Block 2D, capa C) — traduce las operaciones del
// pipeline a transacciones reales de PostgreSQL. Toda la ejecución bajo
// `withServiceContext` (rol `dashboard_service_role`, contexto de
// servicio, NUNCA contexto de estudiante — Block 2D §10): el consumer
// procesa eventos globales del Outbox, no una petición de un estudiante
// autenticado.
//
// El interface `AcademyOutboxProjectionGateway` es la costura de pruebas:
// el orquestador (`reflectionCompletedProjectionConsumer.ts`) depende solo
// de él, así que su lógica (batch, manejo de error, retry) se prueba con
// un doble en memoria. Las garantías transaccionales/de concurrencia REALES
// (atomicidad proyección+PUBLISHED, `FOR UPDATE SKIP LOCKED`,
// `pg_advisory_xact_lock`) son de PostgreSQL y solo se verifican del todo
// con una base real (ver informe: sin infraestructura de integración).

import { withServiceContext } from "@/database/repositories/withStudentContext";
import {
  selectClaimableReflectionCompletedEventIds,
  claimReflectionCompletedEventForUpdate,
  acquireStudentProjectionLock,
  countPublishedReflectionCompletedForStudent,
  markReflectionCompletedEventPublished,
  recordReflectionCompletedProjectionFailure,
} from "@/database/queries/academyOutboxProjection";
import {
  queryLatestLearningMetric,
  insertLearningMetricSnapshot,
} from "@/database/queries/metrics";
import { parseReflectionCompletedOutboxPayload } from "./reflectionCompletedPayload";
import { buildLearningMetricSnapshotFields } from "./learningMetricSnapshot";

export type ReflectionProjectionResult =
  | { readonly outcome: "projected"; readonly studentId: string; readonly completedTasks: number }
  | { readonly outcome: "skipped" };

export interface AcademyOutboxProjectionGateway {
  /** IDs de eventos `ACADEMY_REFLECTION_COMPLETED` proyectables
   * (PENDING, o FAILED con reintentos disponibles), más antiguos primero. */
  listClaimableEventIds(batchSize: number): Promise<string[]>;
  /** Reclama + proyecta + marca PUBLISHED, de forma atómica (una sola
   * transacción). `skipped` = otra transacción lo tiene, o ya no es
   * proyectable. Lanza si la proyección falla (la transacción hace
   * ROLLBACK: `status` intacto, sin fila en `learning_metric`). */
  projectEvent(eventId: string): Promise<ReflectionProjectionResult>;
  /** Ruta de fallo: `retry_count + 1`, `last_error`, y `DEAD_LETTER` al
   * agotar `maxRetries`. Transacción propia. */
  recordFailure(eventId: string, error: unknown): Promise<void>;
}

export interface PrismaGatewayOptions {
  readonly maxRetries: number;
}

export function createPrismaAcademyOutboxProjectionGateway(
  options: PrismaGatewayOptions,
): AcademyOutboxProjectionGateway {
  const { maxRetries } = options;

  return {
    listClaimableEventIds(batchSize) {
      return withServiceContext((tx) =>
        selectClaimableReflectionCompletedEventIds(tx, { batchSize, maxRetries }),
      );
    },

    projectEvent(eventId) {
      return withServiceContext<ReflectionProjectionResult>(async (tx) => {
        const claimed = await claimReflectionCompletedEventForUpdate(tx, eventId);
        if (!claimed) return { outcome: "skipped" };

        const { studentId } = parseReflectionCompletedOutboxPayload(claimed.payload);

        // Serializa la proyección de este estudiante frente a otros workers
        // antes de tocar `learning_metric`.
        await acquireStudentProjectionLock(tx, studentId);

        // El marcado y la proyección van en la MISMA transacción: si el
        // INSERT de abajo falla, este UPDATE se revierte con él.
        await markReflectionCompletedEventPublished(tx, eventId);

        // `completedTasks` = eventos ReflectionCompleted ya PUBLISHED del
        // estudiante (incluye el que acabamos de marcar).
        const completedTasks = await countPublishedReflectionCompletedForStudent(tx, studentId);

        const previous = await queryLatestLearningMetric(tx, studentId);
        const fields = buildLearningMetricSnapshotFields(
          previous
            ? {
                studyTimeMinutes: previous.studyTimeMinutes,
                completedSessions: previous.completedSessions,
                activeDays: previous.activeDays,
              }
            : null,
          completedTasks,
        );

        await insertLearningMetricSnapshot(tx, {
          studentId,
          studyTimeMinutes: fields.studyTimeMinutes,
          completedSessions: fields.completedSessions,
          completedTasks: fields.completedTasks,
          activeDays: fields.activeDays,
          calculatedAt: new Date(),
        });

        return { outcome: "projected", studentId, completedTasks };
      });
    },

    recordFailure(eventId, error) {
      const errorText = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      return withServiceContext((tx) =>
        recordReflectionCompletedProjectionFailure(tx, { eventId, errorText, maxRetries }),
      );
    },
  };
}
