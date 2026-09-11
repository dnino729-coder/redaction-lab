// RecordFeedbackDeliveredHandler — CMD-04, único punto de entrada
// autorizado para registrar retroalimentación (AI_SERVICE/SYSTEM).
// Cubre especialmente la idempotencia por (attemptId, versionNumber) que
// el bloque de Outbox->Analytics necesitará poder asumir: un reintento
// tras éxito nunca debe duplicar ni volver a invocar Attempt.recordFeedback().
import { describe, it, expect } from "vitest";
import { RecordFeedbackDeliveredHandler } from "@/features/academy/application/handlers/RecordFeedbackDeliveredHandler";
import { RecordFeedbackDeliveredCommand } from "@/features/academy/application/commands/RecordFeedbackDeliveredCommand";
import { ResourceNotFoundException } from "@/features/academy/application/exceptions/ResourceNotFoundException";
import { ValidationException } from "@/features/academy/application/exceptions/ValidationException";
import { Attempt } from "@/features/academy/domain/aggregates/Attempt";
import { AttemptId } from "@/features/academy/domain/value-objects/AttemptId";
import { AcademyUnitId } from "@/features/academy/domain/value-objects/AcademyUnitId";
import { StudentId } from "@/features/academy/domain/value-objects/StudentId";
import { VersionId } from "@/features/academy/domain/value-objects/VersionId";
import { DraftContent } from "@/features/academy/domain/value-objects/DraftContent";
import { FeedbackCategory } from "@/features/academy/domain/enums/FeedbackCategory";
import { FeedbackStrength } from "@/features/academy/domain/enums/FeedbackStrength";
import {
  makeAttemptRepository,
  makeUnitOfWork,
  makeUuidGenerator,
  makeDomainEventPublisher,
  makeLogger,
} from "./mocks";
import { FIXTURE_IDS } from "../domain/fixtures";

function buildAttemptAtReceiveFeedback(): Attempt {
  const attempt = Attempt.start({
    id: AttemptId.create(FIXTURE_IDS.attempt),
    unitId: AcademyUnitId.create(FIXTURE_IDS.unit),
    studentId: StudentId.create(FIXTURE_IDS.student),
    attemptNumber: 1,
  });
  attempt.advanceStep(); // DEFINE_OBJECTIVES
  attempt.advanceStep(); // COMPREHEND
  attempt.verifyComprehension("respuesta"); // OBSERVE
  attempt.advanceStep(); // ANALYZE
  attempt.advanceStep(); // PRACTICE
  attempt.advanceStep(); // PRODUCE
  attempt.submitProduction(
    VersionId.create(FIXTURE_IDS.version),
    DraftContent.create("Mi producción."),
  );
  attempt.pullDomainEvents();
  return attempt;
}

function validObservation() {
  return {
    category: FeedbackCategory.GRAMMAR,
    strength: FeedbackStrength.WEAKNESS,
    explanation: "Explicación",
    suggestion: "Sugerencia",
  };
}

function buildHandler() {
  const attemptRepository = makeAttemptRepository();
  const unitOfWork = makeUnitOfWork();
  const uuidGenerator = makeUuidGenerator([FIXTURE_IDS.feedback]);
  const domainEventPublisher = makeDomainEventPublisher();
  const logger = makeLogger();
  const handler = new RecordFeedbackDeliveredHandler(
    attemptRepository as never,
    unitOfWork as never,
    uuidGenerator as never,
    domainEventPublisher as never,
    logger as never,
  );
  return { handler, attemptRepository, unitOfWork, uuidGenerator, domainEventPublisher, logger };
}

describe("RecordFeedbackDeliveredHandler", () => {
  it("rechaza con ResourceNotFoundException si el Attempt no existe", async () => {
    const { handler, attemptRepository } = buildHandler();
    attemptRepository.findById.mockResolvedValue(null);

    await expect(
      handler.handle(
        RecordFeedbackDeliveredCommand.fromRequest({
          attemptId: FIXTURE_IDS.attempt,
          versionNumber: 1,
          observations: [validObservation()],
        }),
      ),
    ).rejects.toBeInstanceOf(ResourceNotFoundException);
  });

  it("rechaza con ValidationException si observations está vacío, sin tocar el repositorio", async () => {
    const { handler, attemptRepository } = buildHandler();

    await expect(
      handler.handle(
        RecordFeedbackDeliveredCommand.fromRequest({
          attemptId: FIXTURE_IDS.attempt,
          versionNumber: 1,
          observations: [],
        }),
      ),
    ).rejects.toBeInstanceOf(ValidationException);
    expect(attemptRepository.findById).not.toHaveBeenCalled();
  });

  it("registra la Feedback, la persiste, despacha sus Domain Events y retorna el DTO — camino feliz", async () => {
    const { handler, attemptRepository, domainEventPublisher, logger } = buildHandler();
    const attempt = buildAttemptAtReceiveFeedback();
    attemptRepository.findById.mockResolvedValue(attempt);

    const result = await handler.handle(
      RecordFeedbackDeliveredCommand.fromRequest({
        attemptId: FIXTURE_IDS.attempt,
        versionNumber: 1,
        observations: [validObservation()],
      }),
    );

    expect(result.id).toBe(FIXTURE_IDS.feedback);
    expect(result.observations).toHaveLength(1);
    expect(attemptRepository.save).toHaveBeenCalledTimes(1);
    expect(attemptRepository.save).toHaveBeenCalledWith(attempt);
    expect(domainEventPublisher.appendFrom).toHaveBeenCalledWith("Attempt", attempt);
    expect(logger.info).toHaveBeenCalled();
  });

  it("idempotencia por (attemptId, versionNumber): un reintento tras éxito retorna la Feedback ya registrada sin volver a guardar ni despachar eventos", async () => {
    const { handler, attemptRepository, domainEventPublisher } = buildHandler();
    const attempt = buildAttemptAtReceiveFeedback();
    attemptRepository.findById.mockResolvedValue(attempt);

    const request = RecordFeedbackDeliveredCommand.fromRequest({
      attemptId: FIXTURE_IDS.attempt,
      versionNumber: 1,
      observations: [validObservation()],
    });

    const first = await handler.handle(request);
    attemptRepository.save.mockClear();
    domainEventPublisher.appendFrom.mockClear();

    const second = await handler.handle(request);

    expect(second).toEqual(first);
    expect(attemptRepository.save).not.toHaveBeenCalled();
    expect(domainEventPublisher.appendFrom).not.toHaveBeenCalled();
  });
});
