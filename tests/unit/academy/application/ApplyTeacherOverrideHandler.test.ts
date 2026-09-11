// ApplyTeacherOverrideHandler — CMD-10, RN-13, invariante 10 ("el Attempt
// activo nunca se toca directamente"). Cubre la autorización docente, la
// rama FORCE_LOCK (sin nuevo Attempt) y la rama FORCE_RESTART (con nuevo
// Attempt solo cuando el origen es COMPLETED/MASTERED) — la lógica más
// sensible del Panel de Profesor.
import { describe, it, expect } from "vitest";
import { ApplyTeacherOverrideHandler } from "@/features/academy/application/handlers/ApplyTeacherOverrideHandler";
import { ApplyTeacherOverrideCommand } from "@/features/academy/application/commands/ApplyTeacherOverrideCommand";
import { AttemptFactory } from "@/features/academy/domain/factories/AttemptFactory";
import { ResourceNotFoundException } from "@/features/academy/application/exceptions/ResourceNotFoundException";
import { ForbiddenException } from "@/features/academy/application/exceptions/ForbiddenException";
import { ValidationException } from "@/features/academy/application/exceptions/ValidationException";
import { AcademyUnit } from "@/features/academy/domain/aggregates/AcademyUnit";
import { AcademyUnitId } from "@/features/academy/domain/value-objects/AcademyUnitId";
import { StudentId } from "@/features/academy/domain/value-objects/StudentId";
import { AttemptId } from "@/features/academy/domain/value-objects/AttemptId";
import { TextType } from "@/features/academy/domain/enums/TextType";
import { UnitState } from "@/features/academy/domain/enums/UnitState";
import {
  makeAcademyUnitRepository,
  makeAttemptRepository,
  makeUnitOfWork,
  makeUuidGenerator,
  makeDomainEventPublisher,
  makeAuthorizationGuard,
  makeLogger,
} from "./mocks";
import { FIXTURE_IDS } from "../domain/fixtures";

function buildInProgressUnit(): AcademyUnit {
  const unit = AcademyUnit.provision({
    id: AcademyUnitId.create(FIXTURE_IDS.unit),
    studentId: StudentId.create(FIXTURE_IDS.student),
    textType: TextType.ESSAY,
    position: 1,
    initialState: UnitState.UNLOCKED,
  });
  unit.startAttempt(AttemptId.create(FIXTURE_IDS.attempt));
  unit.pullDomainEvents();
  return unit;
}

function buildHandler() {
  const academyUnitRepository = makeAcademyUnitRepository();
  const attemptRepository = makeAttemptRepository();
  const attemptFactory = new AttemptFactory();
  const unitOfWork = makeUnitOfWork();
  const uuidGenerator = makeUuidGenerator([FIXTURE_IDS.teacherOverride, FIXTURE_IDS.attempt2]);
  const domainEventPublisher = makeDomainEventPublisher();
  const authorizationGuard = makeAuthorizationGuard();
  const logger = makeLogger();
  const handler = new ApplyTeacherOverrideHandler(
    academyUnitRepository as never,
    attemptRepository as never,
    attemptFactory,
    unitOfWork as never,
    uuidGenerator as never,
    domainEventPublisher as never,
    authorizationGuard as never,
    logger as never,
  );
  return {
    handler,
    academyUnitRepository,
    attemptRepository,
    domainEventPublisher,
    authorizationGuard,
  };
}

function validRequest(action: "FORCE_LOCK" | "FORCE_RESTART") {
  return {
    unitId: FIXTURE_IDS.unit,
    action,
    reason: "Intervención docente justificada.",
    teacherId: FIXTURE_IDS.teacher,
  };
}

describe("ApplyTeacherOverrideHandler", () => {
  it("rechaza con ValidationException si reason está vacío, sin tocar ningún repositorio", async () => {
    const { handler, academyUnitRepository } = buildHandler();
    await expect(
      handler.handle(
        ApplyTeacherOverrideCommand.fromRequest({ ...validRequest("FORCE_LOCK"), reason: "" }),
      ),
    ).rejects.toBeInstanceOf(ValidationException);
    expect(academyUnitRepository.findById).not.toHaveBeenCalled();
  });

  it("rechaza con ResourceNotFoundException si la AcademyUnit no existe, sin verificar la relación docente-estudiante", async () => {
    const { handler, academyUnitRepository, authorizationGuard } = buildHandler();
    academyUnitRepository.findById.mockResolvedValue(null);

    await expect(
      handler.handle(ApplyTeacherOverrideCommand.fromRequest(validRequest("FORCE_LOCK"))),
    ).rejects.toBeInstanceOf(ResourceNotFoundException);
    expect(authorizationGuard.assertTeacherRelationship).not.toHaveBeenCalled();
  });

  it("rechaza con ForbiddenException si no hay relación docente-estudiante, sin aplicar ningún override", async () => {
    const { handler, academyUnitRepository, authorizationGuard } = buildHandler();
    academyUnitRepository.findById.mockResolvedValue(buildInProgressUnit());
    authorizationGuard.assertTeacherRelationship.mockRejectedValue(
      new ForbiddenException("ACADEMY_FORBIDDEN_NO_TEACHER_RELATIONSHIP", "sin relación"),
    );

    await expect(
      handler.handle(ApplyTeacherOverrideCommand.fromRequest(validRequest("FORCE_LOCK"))),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(academyUnitRepository.save).not.toHaveBeenCalled();
  });

  it("FORCE_LOCK: fuerza LOCKED y persiste el override, sin crear ningún nuevo Attempt", async () => {
    const { handler, academyUnitRepository, attemptRepository, domainEventPublisher } =
      buildHandler();
    const unit = buildInProgressUnit();
    academyUnitRepository.findById.mockResolvedValue(unit);

    const result = await handler.handle(
      ApplyTeacherOverrideCommand.fromRequest(validRequest("FORCE_LOCK")),
    );

    expect(unit.state).toBe(UnitState.LOCKED);
    expect(result.action).toBe("FORCE_LOCK");
    expect(result.id).toBe(FIXTURE_IDS.teacherOverride);
    expect(academyUnitRepository.save).toHaveBeenCalledWith(unit);
    expect(domainEventPublisher.appendFrom).toHaveBeenCalledWith("AcademyUnit", unit);
    expect(attemptRepository.findAllByUnitId).not.toHaveBeenCalled();
    expect(attemptRepository.save).not.toHaveBeenCalled();
  });

  it("FORCE_RESTART desde COMPLETED: crea un nuevo Attempt numerado y lo persiste, sin alterar UnitState (H-03)", async () => {
    const { handler, academyUnitRepository, attemptRepository } = buildHandler();
    const unit = buildInProgressUnit();
    unit.advanceToAwaitingFeedback();
    unit.advanceToRevision();
    unit.advanceToReflectionPhase();
    unit.completeFromAttempt({
      attemptId: AttemptId.create(FIXTURE_IDS.attempt),
      linkedMiPlanTaskId: null,
    });
    unit.pullDomainEvents();
    academyUnitRepository.findById.mockResolvedValue(unit);
    attemptRepository.findAllByUnitId.mockResolvedValue([]);

    const result = await handler.handle(
      ApplyTeacherOverrideCommand.fromRequest(validRequest("FORCE_RESTART")),
    );

    expect(unit.state).toBe(UnitState.COMPLETED); // sin cambio, H-03
    expect(unit.activeAttemptId?.value).toBe(FIXTURE_IDS.attempt2);
    expect(result.action).toBe("FORCE_RESTART");
    expect(attemptRepository.save).toHaveBeenCalledTimes(1);
    const savedAttempt = attemptRepository.save.mock.calls[0]![0];
    expect(savedAttempt.attemptNumber).toBe(1); // sin Attempts previos registrados en el repositorio
  });

  it("FORCE_RESTART desde LOCKED: solo desbloquea, sin crear ningún nuevo Attempt", async () => {
    const { handler, academyUnitRepository, attemptRepository } = buildHandler();
    const unit = AcademyUnit.provision({
      id: AcademyUnitId.create(FIXTURE_IDS.unit),
      studentId: StudentId.create(FIXTURE_IDS.student),
      textType: TextType.ESSAY,
      position: 1,
      initialState: UnitState.LOCKED,
    });
    academyUnitRepository.findById.mockResolvedValue(unit);

    await handler.handle(ApplyTeacherOverrideCommand.fromRequest(validRequest("FORCE_RESTART")));

    expect(unit.state).toBe(UnitState.UNLOCKED);
    expect(attemptRepository.findAllByUnitId).not.toHaveBeenCalled();
    expect(attemptRepository.save).not.toHaveBeenCalled();
  });
});
