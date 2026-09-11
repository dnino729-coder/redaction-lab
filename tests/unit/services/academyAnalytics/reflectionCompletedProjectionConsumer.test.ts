// Block 2D — orquestador del consumer. La costura de pruebas es
// `AcademyOutboxProjectionGateway`: aquí se prueba contra un doble en
// memoria que reproduce fielmente la semántica de la implementación real
// (reclamo + re-chequeo de estado, marcado atómico proyección+PUBLISHED,
// conteo de eventos PUBLISHED, arrastre de campos, política de
// retry/DEAD_LETTER).
//
// LÍMITE EXPLÍCITO (ver informe): la ATOMICIDAD real (ROLLBACK de la
// transacción) y la SERIALIZACIÓN entre workers concurrentes
// (`FOR UPDATE SKIP LOCKED` + `pg_advisory_xact_lock`) son garantías de
// PostgreSQL. El doble modela el RESULTADO observable de esas garantías;
// no reemplaza una prueba de integración contra una base real (no existe
// infraestructura de integración en el repo y `academy_outbox` está vacío
// en el entorno actual).
import { describe, expect, it } from "vitest";
import { runReflectionCompletedProjection } from "@/services/academyAnalytics/reflectionCompletedProjectionConsumer";
import type {
  AcademyOutboxProjectionGateway,
  ReflectionProjectionResult,
} from "@/services/academyAnalytics/academyOutboxProjectionGateway";
import { parseReflectionCompletedOutboxPayload } from "@/services/academyAnalytics/reflectionCompletedPayload";
import { outboxAttemptExhaustsRetries } from "@/services/academyAnalytics/outboxRetryPolicy";
import { REFLECTION_COMPLETED_EVENT_NAME } from "@/database/queries/academyOutboxProjection";

const REFLECTION = REFLECTION_COMPLETED_EVENT_NAME;
type OutboxStatus = "PENDING" | "FAILED" | "PUBLISHED" | "DEAD_LETTER";

interface FakeOutboxRow {
  id: string;
  eventName: string;
  status: OutboxStatus;
  retryCount: number;
  lastError: string | null;
  publishedAt: Date | null;
  occurredAt: number;
  payload: unknown;
}

interface FakeLearningMetricRow {
  studentId: string;
  studyTimeMinutes: number;
  completedSessions: number;
  completedTasks: number;
  activeDays: number;
  calculatedAt: number;
}

const UNIT = "22222222-2222-4222-8222-222222222222";
const ATTEMPT = "11111111-1111-4111-8111-111111111111";

function payloadFor(studentId: string) {
  return {
    eventName: REFLECTION,
    aggregateId: ATTEMPT,
    occurredAt: "2026-09-10T10:00:00.000Z",
    payload: { attemptId: ATTEMPT, unitId: UNIT, studentId, comprehensionVerified: true },
    metadata: {},
  };
}

function studentIdOf(row: FakeOutboxRow): string | null {
  const p = row.payload as { payload?: { studentId?: unknown } } | null;
  const s = p?.payload?.studentId;
  return typeof s === "string" ? s : null;
}

/**
 * Doble en memoria del gateway real. Cada método reproduce la semántica de
 * la transacción PostgreSQL equivalente.
 */
class FakeGateway implements AcademyOutboxProjectionGateway {
  public outbox: FakeOutboxRow[] = [];
  public learningMetrics: FakeLearningMetricRow[] = [];
  /** IDs que "otro worker" tiene bloqueados (FOR UPDATE SKIP LOCKED). */
  public lockedEventIds = new Set<string>();
  /** IDs cuyo INSERT en learning_metric debe fallar (ROLLBACK). */
  public failInsertFor = new Set<string>();

  public constructor(private readonly maxRetries = 5) {}

  private nextTs = 1;
  private ts(): number {
    return this.nextTs++;
  }

  public async listClaimableEventIds(batchSize: number): Promise<string[]> {
    return this.outbox
      .filter(
        (r) =>
          r.eventName === REFLECTION &&
          (r.status === "PENDING" || (r.status === "FAILED" && r.retryCount < this.maxRetries)),
      )
      .sort((a, b) => a.occurredAt - b.occurredAt || a.id.localeCompare(b.id))
      .slice(0, batchSize)
      .map((r) => r.id);
  }

  public async projectEvent(eventId: string): Promise<ReflectionProjectionResult> {
    // FOR UPDATE SKIP LOCKED: si otro worker la tiene, se salta.
    if (this.lockedEventIds.has(eventId)) return { outcome: "skipped" };

    const row = this.outbox.find((r) => r.id === eventId);
    // Re-chequeo de estado dentro de la "transacción": ya PUBLISHED /
    // DEAD_LETTER / event_name distinto -> no proyectable.
    if (
      !row ||
      row.eventName !== REFLECTION ||
      !(row.status === "PENDING" || row.status === "FAILED")
    ) {
      return { outcome: "skipped" };
    }

    // Puede lanzar (payload inválido) ANTES de tocar nada.
    const { studentId } = parseReflectionCompletedOutboxPayload(row.payload);

    // --- inicio de la "transacción" atómica ---
    const savepoint = { status: row.status, publishedAt: row.publishedAt };
    row.status = "PUBLISHED";
    row.publishedAt = new Date();

    const completedTasks = this.outbox.filter(
      (r) => r.eventName === REFLECTION && r.status === "PUBLISHED" && studentIdOf(r) === studentId,
    ).length;

    const previous =
      [...this.learningMetrics]
        .filter((m) => m.studentId === studentId)
        .sort((a, b) => b.calculatedAt - a.calculatedAt)[0] ?? null;

    if (this.failInsertFor.has(eventId)) {
      // ROLLBACK: se revierte el marcado, no se inserta snapshot.
      row.status = savepoint.status;
      row.publishedAt = savepoint.publishedAt;
      throw new Error("fallo simulado en INSERT learning_metric");
    }

    this.learningMetrics.push({
      studentId,
      studyTimeMinutes: previous?.studyTimeMinutes ?? 0,
      completedSessions: previous?.completedSessions ?? 0,
      completedTasks,
      activeDays: previous?.activeDays ?? 0,
      calculatedAt: this.ts(),
    });
    // --- COMMIT ---

    return { outcome: "projected", studentId, completedTasks };
  }

  public async recordFailure(eventId: string, error: unknown): Promise<void> {
    const row = this.outbox.find((r) => r.id === eventId);
    if (!row || !(row.status === "PENDING" || row.status === "FAILED")) return;
    const exhausted = outboxAttemptExhaustsRetries(row.retryCount, this.maxRetries);
    row.retryCount += 1;
    row.lastError = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    row.status = exhausted ? "DEAD_LETTER" : "FAILED";
  }

  // --- helpers de seed ---
  public seedReflection(
    id: string,
    studentId: string,
    overrides: Partial<FakeOutboxRow> = {},
  ): void {
    this.outbox.push({
      id,
      eventName: REFLECTION,
      status: "PENDING",
      retryCount: 0,
      lastError: null,
      publishedAt: null,
      occurredAt: this.ts(),
      payload: payloadFor(studentId),
      ...overrides,
    });
  }

  public latestMetric(studentId: string): FakeLearningMetricRow | null {
    return (
      [...this.learningMetrics]
        .filter((m) => m.studentId === studentId)
        .sort((a, b) => b.calculatedAt - a.calculatedAt)[0] ?? null
    );
  }

  public row(id: string): FakeOutboxRow {
    const r = this.outbox.find((x) => x.id === id);
    if (!r) throw new Error(`fila ${id} no encontrada`);
    return r;
  }
}

const S1 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const S2 = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

describe("runReflectionCompletedProjection (orquestador)", () => {
  it("§14.1/§14.2/§14.3 — procesa un ReflectionCompletedEvent válido, resuelve studentId e incrementa completedTasks a 1", async () => {
    const gw = new FakeGateway();
    gw.seedReflection("e1", S1);

    const summary = await runReflectionCompletedProjection({ gateway: gw });

    expect(summary).toEqual({ claimed: 1, projected: 1, skipped: 0, failed: 0 });
    expect(gw.row("e1").status).toBe("PUBLISHED");
    expect(gw.latestMetric(S1)).toMatchObject({ studentId: S1, completedTasks: 1 });
  });

  it("§14.4 — el mismo eventId procesado dos veces incrementa una sola vez", async () => {
    const gw = new FakeGateway();
    gw.seedReflection("e1", S1);

    await runReflectionCompletedProjection({ gateway: gw });
    const secondRun = await runReflectionCompletedProjection({ gateway: gw });

    expect(secondRun.claimed).toBe(0); // ya PUBLISHED, no vuelve a ser candidato
    expect(gw.learningMetrics.filter((m) => m.studentId === S1)).toHaveLength(1);
    expect(gw.latestMetric(S1)?.completedTasks).toBe(1);
  });

  it("§14.4 (directo) — projectEvent sobre un evento ya PUBLISHED devuelve `skipped` y no re-proyecta", async () => {
    const gw = new FakeGateway();
    gw.seedReflection("e1", S1, { status: "PUBLISHED", publishedAt: new Date() });

    const result = await gw.projectEvent("e1");

    expect(result).toEqual({ outcome: "skipped" });
    expect(gw.learningMetrics).toHaveLength(0);
  });

  it("§14.5 — dos eventId distintos del mismo estudiante se proyectan ambos: completedTasks 1 y luego 2", async () => {
    const gw = new FakeGateway();
    gw.seedReflection("e1", S1);
    gw.seedReflection("e2", S1);

    const summary = await runReflectionCompletedProjection({ gateway: gw });

    expect(summary.projected).toBe(2);
    const snapshots = gw.learningMetrics
      .filter((m) => m.studentId === S1)
      .sort((a, b) => a.calculatedAt - b.calculatedAt);
    expect(snapshots.map((s) => s.completedTasks)).toEqual([1, 2]);
  });

  it("§14.5 (bis) — dos eventId de estudiantes distintos: cada uno queda con completedTasks 1", async () => {
    const gw = new FakeGateway();
    gw.seedReflection("e1", S1);
    gw.seedReflection("e2", S2);

    await runReflectionCompletedProjection({ gateway: gw });

    expect(gw.latestMetric(S1)?.completedTasks).toBe(1);
    expect(gw.latestMetric(S2)?.completedTasks).toBe(1);
  });

  it("§14.6 — un evento ya PUBLISHED no se vuelve a procesar", async () => {
    const gw = new FakeGateway();
    gw.seedReflection("e1", S1, { status: "PUBLISHED", publishedAt: new Date() });

    const summary = await runReflectionCompletedProjection({ gateway: gw });

    expect(summary).toEqual({ claimed: 0, projected: 0, skipped: 0, failed: 0 });
    expect(gw.learningMetrics).toHaveLength(0);
  });

  it("§14.7 — un evento DEAD_LETTER no se procesa automáticamente", async () => {
    const gw = new FakeGateway();
    gw.seedReflection("e1", S1, { status: "DEAD_LETTER", retryCount: 5 });

    const summary = await runReflectionCompletedProjection({ gateway: gw });

    expect(summary.claimed).toBe(0);
    expect(gw.learningMetrics).toHaveLength(0);
  });

  it("§14.8/§14.11 — si la proyección falla, el evento NO queda PUBLISHED y no hay snapshot (atomicidad)", async () => {
    const gw = new FakeGateway();
    gw.seedReflection("e1", S1);
    gw.failInsertFor.add("e1");

    const summary = await runReflectionCompletedProjection({ gateway: gw });

    expect(summary).toEqual({ claimed: 1, projected: 0, skipped: 0, failed: 1 });
    expect(gw.row("e1").status).not.toBe("PUBLISHED");
    expect(gw.learningMetrics).toHaveLength(0);
  });

  it("§14.9/§14.10 — un fallo incrementa retry_count y registra last_error", async () => {
    const gw = new FakeGateway();
    gw.seedReflection("e1", S1);
    gw.failInsertFor.add("e1");

    await runReflectionCompletedProjection({ gateway: gw });

    const row = gw.row("e1");
    expect(row.retryCount).toBe(1);
    expect(row.status).toBe("FAILED");
    expect(row.lastError).toContain("fallo simulado en INSERT learning_metric");
  });

  it("§14.7/§14.9 — al agotar maxRetries, el evento pasa a DEAD_LETTER y deja de ser candidato", async () => {
    const gw = new FakeGateway(2); // maxRetries = 2
    gw.seedReflection("e1", S1, { status: "FAILED", retryCount: 1 });
    gw.failInsertFor.add("e1");

    const run1 = await runReflectionCompletedProjection({ gateway: gw });
    expect(run1.failed).toBe(1);
    expect(gw.row("e1").status).toBe("DEAD_LETTER");

    const run2 = await runReflectionCompletedProjection({ gateway: gw });
    expect(run2.claimed).toBe(0); // DEAD_LETTER ya no se reclama
  });

  it("§14.8 — un FAILED con reintentos disponibles se vuelve a intentar y puede tener éxito", async () => {
    const gw = new FakeGateway();
    gw.seedReflection("e1", S1, { status: "FAILED", retryCount: 2 });

    const summary = await runReflectionCompletedProjection({ gateway: gw });

    expect(summary.projected).toBe(1);
    expect(gw.row("e1").status).toBe("PUBLISHED");
    expect(gw.latestMetric(S1)?.completedTasks).toBe(1);
  });

  it("§14.12 — procesa un lote de varios eventos y continúa aunque uno falle", async () => {
    const gw = new FakeGateway();
    gw.seedReflection("e1", S1);
    gw.seedReflection("e2", S2);
    gw.seedReflection("e3", S1);
    gw.failInsertFor.add("e2");

    const summary = await runReflectionCompletedProjection({ gateway: gw });

    expect(summary).toEqual({ claimed: 3, projected: 2, skipped: 0, failed: 1 });
    expect(gw.row("e1").status).toBe("PUBLISHED");
    expect(gw.row("e2").status).toBe("FAILED");
    expect(gw.row("e3").status).toBe("PUBLISHED");
    // e1 y e3 son del mismo estudiante -> el snapshot final refleja 2
    expect(gw.latestMetric(S1)?.completedTasks).toBe(2);
  });

  it("§14.12 (bis) — respeta batchSize y el orden por occurredAt", async () => {
    const gw = new FakeGateway();
    gw.seedReflection("e-late", S1, { occurredAt: 100 });
    gw.seedReflection("e-early", S1, { occurredAt: 1 });

    const summary = await runReflectionCompletedProjection({ gateway: gw, batchSize: 1 });

    expect(summary.claimed).toBe(1);
    expect(gw.row("e-early").status).toBe("PUBLISHED");
    expect(gw.row("e-late").status).toBe("PENDING");
  });

  it("§14.13 — eventos de otro event_name no se proyectan ni se marcan PUBLISHED", async () => {
    const gw = new FakeGateway();
    gw.seedReflection("e1", S1);
    gw.outbox.push({
      id: "feedback-1",
      eventName: "ACADEMY_FEEDBACK_DELIVERED",
      status: "PENDING",
      retryCount: 0,
      lastError: null,
      publishedAt: null,
      occurredAt: 0,
      payload: payloadFor(S1),
    });

    const summary = await runReflectionCompletedProjection({ gateway: gw });

    expect(summary.claimed).toBe(1); // solo el ReflectionCompleted
    expect(gw.row("feedback-1").status).toBe("PENDING"); // intacto
    expect(await gw.projectEvent("feedback-1")).toEqual({ outcome: "skipped" });
  });

  it("§14.14/§14.15/§14.16 — un snapshot previo del estudiante se arrastra: solo cambia completedTasks", async () => {
    const gw = new FakeGateway();
    gw.learningMetrics.push({
      studentId: S1,
      studyTimeMinutes: 42,
      completedSessions: 3,
      completedTasks: 9,
      activeDays: 7,
      calculatedAt: 0,
    });
    gw.seedReflection("e1", S1);

    await runReflectionCompletedProjection({ gateway: gw });

    expect(gw.latestMetric(S1)).toMatchObject({
      studyTimeMinutes: 42, // igual
      completedSessions: 3, // igual
      activeDays: 7, // igual
      completedTasks: 1, // = conteo de eventos PUBLISHED (no 9+1)
    });
  });

  it("§14.17 — mientras otro worker tiene el evento bloqueado, projectEvent lo salta sin duplicar", async () => {
    const gw = new FakeGateway();
    gw.seedReflection("e1", S1);
    gw.lockedEventIds.add("e1");

    const summary = await runReflectionCompletedProjection({ gateway: gw });

    expect(summary).toEqual({ claimed: 1, projected: 0, skipped: 1, failed: 0 });
    expect(gw.row("e1").status).toBe("PENDING"); // sigue disponible para el otro worker
    expect(gw.learningMetrics).toHaveLength(0);

    // Cuando el otro worker termina y libera el lock, se proyecta una sola vez.
    gw.lockedEventIds.delete("e1");
    await runReflectionCompletedProjection({ gateway: gw });
    expect(gw.learningMetrics.filter((m) => m.studentId === S1)).toHaveLength(1);
  });

  it("payload inválido: el evento no se proyecta y cae en la ruta de fallo (retry/DEAD_LETTER)", async () => {
    const gw = new FakeGateway();
    gw.outbox.push({
      id: "bad-1",
      eventName: REFLECTION,
      status: "PENDING",
      retryCount: 0,
      lastError: null,
      publishedAt: null,
      occurredAt: 1,
      payload: { payload: { attemptId: ATTEMPT, unitId: UNIT, studentId: "no-uuid" } },
    });

    const summary = await runReflectionCompletedProjection({ gateway: gw });

    expect(summary.failed).toBe(1);
    expect(gw.row("bad-1").status).toBe("FAILED");
    expect(gw.row("bad-1").lastError).toContain("studentId");
    expect(gw.learningMetrics).toHaveLength(0);
  });

  it("run vacío: sin eventos candidatos, no hace nada", async () => {
    const gw = new FakeGateway();
    const summary = await runReflectionCompletedProjection({ gateway: gw });
    expect(summary).toEqual({ claimed: 0, projected: 0, skipped: 0, failed: 0 });
  });
});
