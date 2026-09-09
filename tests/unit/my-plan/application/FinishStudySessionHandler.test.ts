import { describe, it, expect } from "vitest";
import { FinishStudySessionHandler } from "@/features/my-plan/application/handlers/FinishStudySessionHandler";
import { FinishStudySessionCommand } from "@/features/my-plan/application/commands/FinishStudySessionCommand";
import { OwnershipVerificationService } from "@/features/my-plan/application/services/OwnershipVerificationService";
import { ForbiddenException } from "@/features/my-plan/application/exceptions/ForbiddenException";
import { ResourceNotFoundException } from "@/features/my-plan/application/exceptions/ResourceNotFoundException";
import { ConflictException } from "@/features/my-plan/application/exceptions/ConflictException";
import { ValidationException } from "@/features/my-plan/application/exceptions/ValidationException";
import { StudySession } from "@/features/my-plan/domain/entities/StudySession";
import { StudySessionId } from "@/features/my-plan/domain/value-objects/StudySessionId";
import { LearningTaskId } from "@/features/my-plan/domain/value-objects/LearningTaskId";
import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import {
  makeStudySessionRepository,
  makeLearningPlanRepository,
  makeLearningPhaseRepository,
  makeLearningGoalRepository,
  makeUnitOfWork,
  makeClock,
  makeLogger,
} from "./mocks";
import { APP_FIXTURE_IDS } from "./fixtures";

function buildOpenSession(
  startedAt = new Date("2026-07-18T09:00:00.000Z"),
  studentId: string = APP_FIXTURE_IDS.student,
) {
  return StudySession.start({
    id: StudySessionId.create(APP_FIXTURE_IDS.session),
    studentId: StudentId.create(studentId),
    learningTaskId: LearningTaskId.create(APP_FIXTURE_IDS.task),
    startedAt,
  });
}

function buildHandler(now = new Date("2026-07-18T09:25:00.000Z")) {
  const studySessionRepository = makeStudySessionRepository();
  const learningPlanRepository = makeLearningPlanRepository();
  const learningPhaseRepository = makeLearningPhaseRepository();
  const learningGoalRepository = makeLearningGoalRepository();
  const unitOfWork = makeUnitOfWork();
  const clock = makeClock(now);
  const logger = makeLogger();
  const ownershipVerificationService = new OwnershipVerificationService(
    learningPlanRepository as never,
    learningPhaseRepository as never,
    learningGoalRepository as never,
  );

  const handler = new FinishStudySessionHandler(
    studySessionRepository as never,
    ownershipVerificationService,
    unitOfWork as never,
    clock as never,
    logger as never,
  );

  return { handler, studySessionRepository, learningPlanRepository, unitOfWork, clock };
}

describe("FinishStudySessionHandler", () => {
  it("1. finaliza una sesión abierta propia: completed=true, finishedAt/duration persistidos", async () => {
    const { handler, studySessionRepository } = buildHandler(new Date("2026-07-18T09:25:00.000Z"));
    const session = buildOpenSession(new Date("2026-07-18T09:00:00.000Z"));
    studySessionRepository.findById.mockResolvedValue(session);

    const result = await handler.handle(
      FinishStudySessionCommand.fromRequest({
        studentId: APP_FIXTURE_IDS.student,
        sessionId: APP_FIXTURE_IDS.session,
      }),
    );

    expect(result.completed).toBe(true);
    expect(result.finishedAt).toBe("2026-07-18T09:25:00.000Z");
    expect(result.durationMinutes).toBe(25);
  });

  it("2. sesión inexistente: lanza ResourceNotFoundException", async () => {
    const { handler } = buildHandler();

    await expect(
      handler.handle(
        FinishStudySessionCommand.fromRequest({
          studentId: APP_FIXTURE_IDS.student,
          sessionId: APP_FIXTURE_IDS.session,
        }),
      ),
    ).rejects.toBeInstanceOf(ResourceNotFoundException);
  });

  it("3. rechaza con ForbiddenException si la sesión no pertenece al estudiante", async () => {
    const { handler, studySessionRepository } = buildHandler();
    const session = buildOpenSession(
      new Date("2026-07-18T09:00:00.000Z"),
      APP_FIXTURE_IDS.otherStudent,
    );
    studySessionRepository.findById.mockResolvedValue(session);

    await expect(
      handler.handle(
        FinishStudySessionCommand.fromRequest({
          studentId: APP_FIXTURE_IDS.student,
          sessionId: APP_FIXTURE_IDS.session,
        }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(studySessionRepository.save).not.toHaveBeenCalled();
  });

  it("4. sesión ya finalizada: lanza ConflictException (no expone DomainInvariantViolationException cruda)", async () => {
    const { handler, studySessionRepository } = buildHandler();
    const session = buildOpenSession(new Date("2026-07-18T09:00:00.000Z"));
    session.finish(new Date("2026-07-18T09:10:00.000Z"), null);
    studySessionRepository.findById.mockResolvedValue(session);

    await expect(
      handler.handle(
        FinishStudySessionCommand.fromRequest({
          studentId: APP_FIXTURE_IDS.student,
          sessionId: APP_FIXTURE_IDS.session,
        }),
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(studySessionRepository.save).not.toHaveBeenCalled();
  });

  it("5. finishedAt proviene del Clock inyectado, no de Date.now()", async () => {
    const fixedNow = new Date("2026-07-18T10:00:00.000Z");
    const { handler, studySessionRepository, clock } = buildHandler(fixedNow);
    const session = buildOpenSession(new Date("2026-07-18T09:00:00.000Z"));
    studySessionRepository.findById.mockResolvedValue(session);

    const result = await handler.handle(
      FinishStudySessionCommand.fromRequest({
        studentId: APP_FIXTURE_IDS.student,
        sessionId: APP_FIXTURE_IDS.session,
      }),
    );

    expect(clock.now).toHaveBeenCalled();
    expect(result.finishedAt).toBe(fixedNow.toISOString());
  });

  it("6. la duración se calcula como round((finishedAt - startedAt) / 60000)", async () => {
    const { handler, studySessionRepository } = buildHandler(new Date("2026-07-18T09:00:45.000Z"));
    // 45 segundos -> redondea a 1 minuto (0.75 min redondeado).
    const session = buildOpenSession(new Date("2026-07-18T09:00:00.000Z"));
    studySessionRepository.findById.mockResolvedValue(session);

    const result = await handler.handle(
      FinishStudySessionCommand.fromRequest({
        studentId: APP_FIXTURE_IDS.student,
        sessionId: APP_FIXTURE_IDS.session,
      }),
    );

    expect(result.durationMinutes).toBe(1);
  });

  it("7. inicio y fin en el mismo minuto: duración 0 es válida (no se inventa un mínimo)", async () => {
    const now = new Date("2026-07-18T09:00:10.000Z");
    const { handler, studySessionRepository } = buildHandler(now);
    const session = buildOpenSession(new Date("2026-07-18T09:00:00.000Z"));
    studySessionRepository.findById.mockResolvedValue(session);

    const result = await handler.handle(
      FinishStudySessionCommand.fromRequest({
        studentId: APP_FIXTURE_IDS.student,
        sessionId: APP_FIXTURE_IDS.session,
      }),
    );

    expect(result.durationMinutes).toBe(0);
  });

  it("8. el repositorio recibe la misma instancia de sesión ya finalizada (completed=true) en save()", async () => {
    const { handler, studySessionRepository } = buildHandler(new Date("2026-07-18T09:25:00.000Z"));
    const session = buildOpenSession(new Date("2026-07-18T09:00:00.000Z"));
    studySessionRepository.findById.mockResolvedValue(session);

    await handler.handle(
      FinishStudySessionCommand.fromRequest({
        studentId: APP_FIXTURE_IDS.student,
        sessionId: APP_FIXTURE_IDS.session,
      }),
    );

    expect(studySessionRepository.save).toHaveBeenCalledWith(session);
    expect(session.completed).toBe(true);
  });

  it("9. usa el contexto de estudiante (RLS real) en UnitOfWork.execute", async () => {
    const { handler, studySessionRepository, unitOfWork } = buildHandler();
    const session = buildOpenSession();
    studySessionRepository.findById.mockResolvedValue(session);

    await handler.handle(
      FinishStudySessionCommand.fromRequest({
        studentId: APP_FIXTURE_IDS.student,
        sessionId: APP_FIXTURE_IDS.session,
      }),
    );

    expect(unitOfWork.execute).toHaveBeenCalledWith(expect.any(Function), APP_FIXTURE_IDS.student);
  });

  it("rechaza un sessionId/studentId inválido antes de tocar el repositorio", async () => {
    const { handler, studySessionRepository } = buildHandler();

    await expect(
      handler.handle(
        FinishStudySessionCommand.fromRequest({
          studentId: APP_FIXTURE_IDS.student,
          sessionId: "not-a-uuid",
        }),
      ),
    ).rejects.toBeInstanceOf(ValidationException);
    expect(studySessionRepository.findById).not.toHaveBeenCalled();
  });

  // Slice "enforce paused plan progress rules" — deliberadamente SIN
  // bloqueo por PAUSED (ver auditoría "PAUSED Behavior Audit"): una sesión
  // pudo abrirse con el plan ACTIVE y luego el estudiante pausó el plan;
  // finalizarla debe seguir permitido. El Handler ni siquiera consulta
  // LearningPlanRepository — la garantía es arquitectónica, no solo de
  // comportamiento observado.
  it("10. finaliza una sesión abierta sin consultar LearningPlan en absoluto (permite finish incluso con el plan PAUSED)", async () => {
    const { handler, studySessionRepository, learningPlanRepository } = buildHandler(
      new Date("2026-07-18T09:25:00.000Z"),
    );
    const session = buildOpenSession(new Date("2026-07-18T09:00:00.000Z"));
    studySessionRepository.findById.mockResolvedValue(session);

    const result = await handler.handle(
      FinishStudySessionCommand.fromRequest({
        studentId: APP_FIXTURE_IDS.student,
        sessionId: APP_FIXTURE_IDS.session,
      }),
    );

    expect(result.completed).toBe(true);
    expect(learningPlanRepository.findById).not.toHaveBeenCalled();
  });
});
