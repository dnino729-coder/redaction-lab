// CompleteUnitOnReflectionCompletedHandler — CMD-07 transacción 2:
// reacciona a ReflectionCompletedEvent (publicado por la transacción 1)
// para completar la AcademyUnit y, en cadena, desbloquear la siguiente de
// la secuencia si corresponde. Es el manejador de evento más cercano al
// patrón que el futuro consumidor de Outbox (Analytics/Competencies)
// replicará — protegerlo ahora es exactamente el objetivo de este bloque.
import { describe, it, expect } from "vitest";
import { CompleteUnitOnReflectionCompletedHandler } from "@/features/academy/application/handlers/CompleteUnitOnReflectionCompletedHandler";
import { ReflectionCompletedEvent } from "@/features/academy/domain/events/ReflectionCompletedEvent";
import { AcademyUnit } from "@/features/academy/domain/aggregates/AcademyUnit";
import { AcademyUnitId } from "@/features/academy/domain/value-objects/AcademyUnitId";
import { StudentId } from "@/features/academy/domain/value-objects/StudentId";
import { AttemptId } from "@/features/academy/domain/value-objects/AttemptId";
import { TextType } from "@/features/academy/domain/enums/TextType";
import { UnitState } from "@/features/academy/domain/enums/UnitState";
import {
  makeAcademyUnitRepository,
  makeMiPlanTaskLookupPort,
  makeUnitOfWork,
  makeDomainEventPublisher,
  makeLogger,
} from "./mocks";
import { FIXTURE_IDS } from "../domain/fixtures";

function buildUnitAtReflection(): AcademyUnit {
  const unit = AcademyUnit.provision({
    id: AcademyUnitId.create(FIXTURE_IDS.unit),
    studentId: StudentId.create(FIXTURE_IDS.student),
    textType: TextType.ESSAY,
    position: 1,
    initialState: UnitState.UNLOCKED,
  });
  unit.startAttempt(AttemptId.create(FIXTURE_IDS.attempt));
  unit.advanceToAwaitingFeedback();
  unit.advanceToRevision();
  unit.advanceToReflectionPhase();
  unit.pullDomainEvents();
  return unit;
}

function buildNextUnit(initialState: UnitState): AcademyUnit {
  return AcademyUnit.provision({
    id: AcademyUnitId.create(FIXTURE_IDS.unit2),
    studentId: StudentId.create(FIXTURE_IDS.student),
    textType: TextType.ESSAY,
    position: 2,
    initialState,
  });
}

function buildEvent(): ReflectionCompletedEvent {
  return new ReflectionCompletedEvent(FIXTURE_IDS.attempt, {
    attemptId: FIXTURE_IDS.attempt,
    unitId: FIXTURE_IDS.unit,
    studentId: FIXTURE_IDS.student,
    comprehensionVerified: true,
  });
}

function buildHandler() {
  const academyUnitRepository = makeAcademyUnitRepository();
  const miPlanTaskLookupPort = makeMiPlanTaskLookupPort();
  const unitOfWork = makeUnitOfWork();
  const domainEventPublisher = makeDomainEventPublisher();
  const logger = makeLogger();
  const handler = new CompleteUnitOnReflectionCompletedHandler(
    academyUnitRepository as never,
    miPlanTaskLookupPort as never,
    unitOfWork as never,
    domainEventPublisher as never,
    logger as never,
  );
  return { handler, academyUnitRepository, miPlanTaskLookupPort, domainEventPublisher, logger };
}

describe("CompleteUnitOnReflectionCompletedHandler", () => {
  it("no hace nada (sin guardar ni publicar) si la AcademyUnit ya no existe", async () => {
    const { handler, academyUnitRepository, domainEventPublisher } = buildHandler();
    academyUnitRepository.findById.mockResolvedValue(null);

    await handler.handle(buildEvent());

    expect(academyUnitRepository.save).not.toHaveBeenCalled();
    expect(domainEventPublisher.appendFrom).not.toHaveBeenCalled();
  });

  it("completa la Unidad sin tarea de Mi Plan vinculada y no desbloquea nada si no hay una unidad siguiente", async () => {
    const { handler, academyUnitRepository, miPlanTaskLookupPort, domainEventPublisher, logger } =
      buildHandler();
    const unit = buildUnitAtReflection();
    academyUnitRepository.findById.mockResolvedValue(unit);
    miPlanTaskLookupPort.findLinkedTaskId.mockResolvedValue(null);
    academyUnitRepository.findByStudentTextTypeAndPosition.mockResolvedValue(null);

    await handler.handle(buildEvent());

    expect(unit.state).toBe(UnitState.COMPLETED);
    expect(academyUnitRepository.save).toHaveBeenCalledTimes(1);
    expect(academyUnitRepository.save).toHaveBeenCalledWith(unit);
    expect(domainEventPublisher.appendFrom).toHaveBeenCalledTimes(1);
    expect(domainEventPublisher.appendFrom).toHaveBeenCalledWith("AcademyUnit", unit);
    expect(logger.info).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ nextUnitUnlocked: false }),
    );
  });

  it("desbloquea en cadena la siguiente Unidad de la secuencia cuando es elegible", async () => {
    const { handler, academyUnitRepository, miPlanTaskLookupPort, domainEventPublisher, logger } =
      buildHandler();
    const unit = buildUnitAtReflection();
    const nextUnit = buildNextUnit(UnitState.LOCKED);
    academyUnitRepository.findById.mockResolvedValue(unit);
    miPlanTaskLookupPort.findLinkedTaskId.mockResolvedValue(null);
    academyUnitRepository.findByStudentTextTypeAndPosition.mockResolvedValue(nextUnit);

    await handler.handle(buildEvent());

    expect(nextUnit.state).toBe(UnitState.UNLOCKED);
    expect(academyUnitRepository.save).toHaveBeenCalledTimes(2);
    expect(academyUnitRepository.save).toHaveBeenNthCalledWith(2, nextUnit);
    expect(domainEventPublisher.appendFrom).toHaveBeenCalledTimes(2);
    expect(domainEventPublisher.appendFrom).toHaveBeenNthCalledWith(2, "AcademyUnit", nextUnit);
    expect(logger.info).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ nextUnitUnlocked: true }),
    );
  });

  it("no toca la siguiente Unidad si ya no está LOCKED (no elegible para desbloqueo)", async () => {
    const { handler, academyUnitRepository, miPlanTaskLookupPort } = buildHandler();
    const unit = buildUnitAtReflection();
    const nextUnit = buildNextUnit(UnitState.IN_PROGRESS); // ya en progreso, no LOCKED
    academyUnitRepository.findById.mockResolvedValue(unit);
    miPlanTaskLookupPort.findLinkedTaskId.mockResolvedValue(null);
    academyUnitRepository.findByStudentTextTypeAndPosition.mockResolvedValue(nextUnit);

    await handler.handle(buildEvent());

    expect(nextUnit.state).toBe(UnitState.IN_PROGRESS); // sin cambio
    expect(academyUnitRepository.save).toHaveBeenCalledTimes(1); // solo la unidad completada
  });

  it("propaga la tarea de Mi Plan vinculada a completeFromAttempt() (RN-10/A-08)", async () => {
    const { handler, academyUnitRepository, miPlanTaskLookupPort, domainEventPublisher } =
      buildHandler();
    const unit = buildUnitAtReflection();
    academyUnitRepository.findById.mockResolvedValue(unit);
    miPlanTaskLookupPort.findLinkedTaskId.mockResolvedValue("mi-plan-task-1");
    academyUnitRepository.findByStudentTextTypeAndPosition.mockResolvedValue(null);

    await handler.handle(buildEvent());

    // completeFromAttempt() con linkedMiPlanTaskId no-nulo emite también
    // ExternalActivityCompletedEvent (ya probado a nivel de Aggregate en
    // AcademyUnit.test.ts) — aquí solo se confirma que el Handler propaga
    // lo que el puerto de lookup retornó, sin perderlo ni sustituirlo.
    expect(domainEventPublisher.appendFrom).toHaveBeenCalledWith("AcademyUnit", unit);
    expect(miPlanTaskLookupPort.findLinkedTaskId).toHaveBeenCalledWith(
      FIXTURE_IDS.student,
      FIXTURE_IDS.unit,
    );
  });
});
