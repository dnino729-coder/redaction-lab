// AcademyFeedbackGateway — orquestación entre Attempt/Version, el
// AIProviderFactory y RecordFeedbackDeliveredHandler. Ninguna llamada real
// a Claude/OpenAI: el AIProvider se mockea por completo (mismo patrón que
// el resto de la Application Layer). Cubre los 3 resultados reales del
// código (DELIVERED/PROCESSING por dato inválido/PROCESSING por error o
// timeout) — no existen estados FAILED/READY propios en este archivo.
import { describe, it, expect, vi, afterEach } from "vitest";
import { AcademyFeedbackGateway } from "@/features/academy/infrastructure/ai/AcademyFeedbackGateway";
import { Attempt } from "@/features/academy/domain/aggregates/Attempt";
import { AttemptId } from "@/features/academy/domain/value-objects/AttemptId";
import { AcademyUnitId } from "@/features/academy/domain/value-objects/AcademyUnitId";
import { StudentId } from "@/features/academy/domain/value-objects/StudentId";
import { VersionId } from "@/features/academy/domain/value-objects/VersionId";
import { DraftContent } from "@/features/academy/domain/value-objects/DraftContent";
import { makeAttemptRepository, makeAcademyUnitRepository, makeLogger } from "../application/mocks";
import { FIXTURE_IDS } from "../domain/fixtures";

function buildAttemptWithPendingVersion(): Attempt {
  const attempt = Attempt.start({
    id: AttemptId.create(FIXTURE_IDS.attempt),
    unitId: AcademyUnitId.create(FIXTURE_IDS.unit),
    studentId: StudentId.create(FIXTURE_IDS.student),
    attemptNumber: 1,
  });
  attempt.advanceStep();
  attempt.advanceStep();
  attempt.verifyComprehension("respuesta");
  attempt.advanceStep();
  attempt.advanceStep();
  attempt.advanceStep();
  attempt.submitProduction(
    VersionId.create(FIXTURE_IDS.version),
    DraftContent.create("Mi producción."),
  );
  attempt.pullDomainEvents();
  return attempt;
}

function makeProvider(
  generateCompletion: (
    ...args: never[]
  ) => Promise<{ content: string; promptTokens: number; completionTokens: number }>,
) {
  return { name: "claude" as const, generateCompletion: vi.fn(generateCompletion) };
}

function buildGateway(params: {
  provider: ReturnType<typeof makeProvider>;
  feedbackTimeoutTargetMs?: number;
}) {
  const attemptRepository = makeAttemptRepository();
  const academyUnitRepository = makeAcademyUnitRepository();
  const recordFeedbackDeliveredHandler = { handle: vi.fn() };
  const logger = makeLogger();
  const aiProviderFactory = { create: vi.fn(() => params.provider) };
  const config = { feedbackTimeoutTargetMs: params.feedbackTimeoutTargetMs ?? 60_000 };

  const gateway = new AcademyFeedbackGateway(
    aiProviderFactory as never,
    attemptRepository as never,
    academyUnitRepository as never,
    recordFeedbackDeliveredHandler as never,
    config as never,
    logger as never,
  );
  return {
    gateway,
    attemptRepository,
    academyUnitRepository,
    recordFeedbackDeliveredHandler,
    logger,
    aiProviderFactory,
  };
}

describe("AcademyFeedbackGateway.requestFeedback()", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("retorna PROCESSING sin llamar al proveedor de IA si el Attempt no existe", async () => {
    const { gateway, attemptRepository, aiProviderFactory, logger } = buildGateway({
      provider: makeProvider(async () => ({ content: "[]", promptTokens: 0, completionTokens: 0 })),
    });
    attemptRepository.findById.mockResolvedValue(null);

    const result = await gateway.requestFeedback({
      attemptId: FIXTURE_IDS.attempt,
      versionId: FIXTURE_IDS.version,
    });

    expect(result).toEqual({ status: "PROCESSING" });
    expect(aiProviderFactory.create).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalled();
  });

  it("retorna PROCESSING sin llamar al proveedor de IA si la Version no existe en el Attempt", async () => {
    const attempt = Attempt.start({
      id: AttemptId.create(FIXTURE_IDS.attempt),
      unitId: AcademyUnitId.create(FIXTURE_IDS.unit),
      studentId: StudentId.create(FIXTURE_IDS.student),
      attemptNumber: 1,
    });
    const { gateway, attemptRepository, aiProviderFactory } = buildGateway({
      provider: makeProvider(async () => ({ content: "[]", promptTokens: 0, completionTokens: 0 })),
    });
    attemptRepository.findById.mockResolvedValue(attempt);

    const result = await gateway.requestFeedback({
      attemptId: FIXTURE_IDS.attempt,
      versionId: FIXTURE_IDS.version,
    });

    expect(result).toEqual({ status: "PROCESSING" });
    expect(aiProviderFactory.create).not.toHaveBeenCalled();
  });

  it("camino feliz: responde dentro de la ventana, registra la Feedback vía RecordFeedbackDeliveredHandler y retorna DELIVERED", async () => {
    const rawContent = JSON.stringify([
      {
        category: "GRAMMAR",
        strength: "WEAKNESS",
        explanation: "Explicación",
        suggestion: "Sugerencia",
      },
    ]);
    const { gateway, attemptRepository, recordFeedbackDeliveredHandler } = buildGateway({
      provider: makeProvider(async () => ({
        content: rawContent,
        promptTokens: 10,
        completionTokens: 5,
      })),
    });
    attemptRepository.findById.mockResolvedValue(buildAttemptWithPendingVersion());
    recordFeedbackDeliveredHandler.handle.mockResolvedValue({
      id: FIXTURE_IDS.feedback,
      versionId: FIXTURE_IDS.version,
      observations: [],
      deliveredAt: new Date().toISOString(),
    });

    const result = await gateway.requestFeedback({
      attemptId: FIXTURE_IDS.attempt,
      versionId: FIXTURE_IDS.version,
    });

    expect(result).toEqual({ status: "DELIVERED", feedbackId: FIXTURE_IDS.feedback });
    expect(recordFeedbackDeliveredHandler.handle).toHaveBeenCalledTimes(1);
    const command = recordFeedbackDeliveredHandler.handle.mock.calls[0]![0];
    expect(command.request).toEqual({
      attemptId: FIXTURE_IDS.attempt,
      versionNumber: 1,
      observations: [
        {
          category: "GRAMMAR",
          strength: "WEAKNESS",
          explanation: "Explicación",
          suggestion: "Sugerencia",
        },
      ],
    });
  });

  it("retorna PROCESSING sin registrar Feedback si la respuesta de IA no contiene observaciones válidas", async () => {
    const { gateway, attemptRepository, recordFeedbackDeliveredHandler, logger } = buildGateway({
      provider: makeProvider(async () => ({
        content: "no hay JSON aquí",
        promptTokens: 1,
        completionTokens: 1,
      })),
    });
    attemptRepository.findById.mockResolvedValue(buildAttemptWithPendingVersion());

    const result = await gateway.requestFeedback({
      attemptId: FIXTURE_IDS.attempt,
      versionId: FIXTURE_IDS.version,
    });

    expect(result).toEqual({ status: "PROCESSING" });
    expect(recordFeedbackDeliveredHandler.handle).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalled();
  });

  it("retorna PROCESSING sin registrar Feedback si el proveedor de IA lanza un error", async () => {
    const { gateway, attemptRepository, recordFeedbackDeliveredHandler } = buildGateway({
      provider: makeProvider(async () => {
        throw new Error("fallo de red simulado");
      }),
    });
    attemptRepository.findById.mockResolvedValue(buildAttemptWithPendingVersion());

    const result = await gateway.requestFeedback({
      attemptId: FIXTURE_IDS.attempt,
      versionId: FIXTURE_IDS.version,
    });

    expect(result).toEqual({ status: "PROCESSING" });
    expect(recordFeedbackDeliveredHandler.handle).not.toHaveBeenCalled();
  });

  it("retorna PROCESSING si el proveedor de IA no responde dentro de feedbackTimeoutTargetMs (sin reintento, RN de Sprint 6.2 fuera de alcance)", async () => {
    vi.useFakeTimers();
    const neverResolves = makeProvider(() => new Promise(() => {}));
    const { gateway, attemptRepository, recordFeedbackDeliveredHandler } = buildGateway({
      provider: neverResolves,
      feedbackTimeoutTargetMs: 1_000,
    });
    attemptRepository.findById.mockResolvedValue(buildAttemptWithPendingVersion());

    const resultPromise = gateway.requestFeedback({
      attemptId: FIXTURE_IDS.attempt,
      versionId: FIXTURE_IDS.version,
    });
    await vi.advanceTimersByTimeAsync(1_000);
    const result = await resultPromise;

    expect(result).toEqual({ status: "PROCESSING" });
    expect(recordFeedbackDeliveredHandler.handle).not.toHaveBeenCalled();
  });
});
