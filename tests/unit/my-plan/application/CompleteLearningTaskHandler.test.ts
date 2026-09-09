import { describe, it, expect } from "vitest";
import { CompleteLearningTaskHandler } from "@/features/my-plan/application/handlers/CompleteLearningTaskHandler";
import { CompleteLearningTaskCommand } from "@/features/my-plan/application/commands/CompleteLearningTaskCommand";
import { OwnershipVerificationService } from "@/features/my-plan/application/services/OwnershipVerificationService";
import { DomainEventPublisher } from "@/features/my-plan/application/services/DomainEventPublisher";
import { ConflictException } from "@/features/my-plan/application/exceptions/ConflictException";
import { ForbiddenException } from "@/features/my-plan/application/exceptions/ForbiddenException";
import { LearningPlan } from "@/features/my-plan/domain/entities/LearningPlan";
import { LearningPhase } from "@/features/my-plan/domain/entities/LearningPhase";
import { LearningTask } from "@/features/my-plan/domain/entities/LearningTask";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import { LearningPhaseId } from "@/features/my-plan/domain/value-objects/LearningPhaseId";
import { LearningTaskId } from "@/features/my-plan/domain/value-objects/LearningTaskId";
import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import { LearningTaskSource } from "@/features/my-plan/domain/enums/LearningTaskSource";
import {
  makeLearningTaskRepository,
  makeLearningPhaseRepository,
  makeLearningPlanRepository,
  makeLearningGoalRepository,
  makeLearningProgressWritePort,
  makeUnitOfWork,
  makeClock,
  makeEventBus,
  makeLogger,
} from "./mocks";
import { APP_FIXTURE_IDS } from "./fixtures";

function buildFixtures(
  source: LearningTaskSource = LearningTaskSource.SELF_DIRECTED,
  studentId: string = APP_FIXTURE_IDS.student,
) {
  const plan = LearningPlan.create({
    id: LearningPlanId.create(APP_FIXTURE_IDS.plan),
    studentId: StudentId.create(studentId),
    name: "Plan",
    targetLevel: "B2" as never,
    startDate: new Date("2026-01-01T00:00:00.000Z"),
  });
  const phase = LearningPhase.create({
    id: LearningPhaseId.create(APP_FIXTURE_IDS.phase),
    learningPlanId: plan.id,
    name: "Fase 1",
    phaseOrder: 1,
    startDate: new Date("2026-01-01T00:00:00.000Z"),
  });
  const task = LearningTask.create({
    id: LearningTaskId.create(APP_FIXTURE_IDS.task),
    learningPhaseId: phase.id,
    title: "Tarea",
    estimatedMinutes: 30,
    source,
  });
  return { plan, phase, task };
}

function buildHandler() {
  const learningTaskRepository = makeLearningTaskRepository();
  const learningPhaseRepository = makeLearningPhaseRepository();
  const learningPlanRepository = makeLearningPlanRepository();
  const learningGoalRepository = makeLearningGoalRepository();
  const learningProgressWritePort = makeLearningProgressWritePort();
  const unitOfWork = makeUnitOfWork();
  const eventBus = makeEventBus();
  const logger = makeLogger();
  const ownershipVerificationService = new OwnershipVerificationService(
    learningPlanRepository as never,
    learningPhaseRepository as never,
    learningGoalRepository as never,
  );
  const domainEventPublisher = new DomainEventPublisher(eventBus as never);

  const handler = new CompleteLearningTaskHandler(
    learningTaskRepository as never,
    learningPhaseRepository as never,
    ownershipVerificationService,
    learningProgressWritePort as never,
    unitOfWork as never,
    makeClock(new Date("2026-07-18T10:00:00.000Z")) as never,
    domainEventPublisher,
    logger as never,
  );

  return {
    handler,
    learningTaskRepository,
    learningPhaseRepository,
    learningPlanRepository,
    learningProgressWritePort,
    eventBus,
  };
}

describe("CompleteLearningTaskHandler", () => {
  it("completa una tarea SELF_DIRECTED propia, recalcula la fase, publica PLAN_TASK_COMPLETED y actualiza learning_progress a 1/1 = 100%", async () => {
    const {
      handler,
      learningTaskRepository,
      learningPhaseRepository,
      learningPlanRepository,
      learningProgressWritePort,
      eventBus,
    } = buildHandler();
    const { plan, phase, task } = buildFixtures();
    learningTaskRepository.findById.mockResolvedValue(task);
    learningTaskRepository.findByLearningPhaseId.mockResolvedValue([task]);
    learningPhaseRepository.findById.mockResolvedValue(phase);
    learningPhaseRepository.findByLearningPlanId.mockResolvedValue([phase]);
    learningPlanRepository.findById.mockResolvedValue(plan);

    const result = await handler.handle(
      CompleteLearningTaskCommand.fromRequest({
        taskId: APP_FIXTURE_IDS.task,
        studentId: APP_FIXTURE_IDS.student,
      }),
    );

    expect(result.status).toBe("COMPLETED");
    expect(learningTaskRepository.save).toHaveBeenCalledWith(task);
    expect(learningPhaseRepository.save).toHaveBeenCalledWith(phase);
    expect(phase.status).toBe("COMPLETED");
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    expect(eventBus.publish.mock.calls[0]![0][0]!.eventName).toBe("PLAN_TASK_COMPLETED");
    // learning_progress: 1 tarea, ya COMPLETED en el momento del recount
    // (se ejecuta después de task.save()) => 1/1 = 100%, streak siempre 0.
    expect(learningProgressWritePort.upsert).toHaveBeenCalledTimes(1);
    expect(learningProgressWritePort.upsert).toHaveBeenCalledWith({
      learningPlanId: APP_FIXTURE_IDS.plan,
      completedTasks: 1,
      totalTasks: 1,
      completionPercentage: 100,
      currentStreak: 0,
    });
  });

  it("NOT_STARTED e IN_PROGRESS cuentan para totalTasks pero no para completedTasks", async () => {
    const {
      handler,
      learningTaskRepository,
      learningPhaseRepository,
      learningPlanRepository,
      learningProgressWritePort,
    } = buildHandler();
    const { plan, phase, task } = buildFixtures();
    const siblingNotStarted = LearningTask.create({
      id: LearningTaskId.create("55555555-5555-4555-8555-555555555560"),
      learningPhaseId: phase.id,
      title: "Sibling NOT_STARTED",
      estimatedMinutes: 20,
    });
    const siblingInProgress = LearningTask.create({
      id: LearningTaskId.create("55555555-5555-4555-8555-555555555561"),
      learningPhaseId: phase.id,
      title: "Sibling IN_PROGRESS",
      estimatedMinutes: 20,
    });
    siblingInProgress.start();

    learningTaskRepository.findById.mockResolvedValue(task);
    learningTaskRepository.findByLearningPhaseId.mockResolvedValue([
      task,
      siblingNotStarted,
      siblingInProgress,
    ]);
    learningPhaseRepository.findById.mockResolvedValue(phase);
    learningPhaseRepository.findByLearningPlanId.mockResolvedValue([phase]);
    learningPlanRepository.findById.mockResolvedValue(plan);

    await handler.handle(
      CompleteLearningTaskCommand.fromRequest({
        taskId: APP_FIXTURE_IDS.task,
        studentId: APP_FIXTURE_IDS.student,
      }),
    );

    expect(learningProgressWritePort.upsert).toHaveBeenCalledWith({
      learningPlanId: APP_FIXTURE_IDS.plan,
      completedTasks: 1,
      totalTasks: 3,
      completionPercentage: expect.closeTo(33.33, 2),
      currentStreak: 0,
    });
  });

  it("CANCELLED no cuenta para totalTasks", async () => {
    const {
      handler,
      learningTaskRepository,
      learningPhaseRepository,
      learningPlanRepository,
      learningProgressWritePort,
    } = buildHandler();
    const { plan, phase, task } = buildFixtures();
    const cancelledSibling = LearningTask.create({
      id: LearningTaskId.create("55555555-5555-4555-8555-555555555562"),
      learningPhaseId: phase.id,
      title: "Sibling cancelada",
      estimatedMinutes: 20,
    });
    cancelledSibling.cancel();

    learningTaskRepository.findById.mockResolvedValue(task);
    learningTaskRepository.findByLearningPhaseId.mockResolvedValue([task, cancelledSibling]);
    learningPhaseRepository.findById.mockResolvedValue(phase);
    learningPhaseRepository.findByLearningPlanId.mockResolvedValue([phase]);
    learningPlanRepository.findById.mockResolvedValue(plan);

    await handler.handle(
      CompleteLearningTaskCommand.fromRequest({
        taskId: APP_FIXTURE_IDS.task,
        studentId: APP_FIXTURE_IDS.student,
      }),
    );

    // La tarea cancelada queda excluida — totalTasks sigue siendo 1, no 2.
    expect(learningProgressWritePort.upsert).toHaveBeenCalledWith({
      learningPlanId: APP_FIXTURE_IDS.plan,
      completedTasks: 1,
      totalTasks: 1,
      completionPercentage: 100,
      currentStreak: 0,
    });
  });

  it("rechaza con ConflictException una tarea no SELF_DIRECTED (18.20.5, source guard) y no toca learning_progress", async () => {
    const {
      handler,
      learningTaskRepository,
      learningPhaseRepository,
      learningPlanRepository,
      learningProgressWritePort,
    } = buildHandler();
    const { plan, phase, task } = buildFixtures(LearningTaskSource.ACADEMY);
    learningTaskRepository.findById.mockResolvedValue(task);
    learningPhaseRepository.findById.mockResolvedValue(phase);
    learningPlanRepository.findById.mockResolvedValue(plan);

    await expect(
      handler.handle(
        CompleteLearningTaskCommand.fromRequest({
          taskId: APP_FIXTURE_IDS.task,
          studentId: APP_FIXTURE_IDS.student,
        }),
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(learningProgressWritePort.upsert).not.toHaveBeenCalled();
  });

  it("rechaza con ForbiddenException si la tarea no pertenece al estudiante y no toca learning_progress", async () => {
    const {
      handler,
      learningTaskRepository,
      learningPhaseRepository,
      learningPlanRepository,
      learningProgressWritePort,
    } = buildHandler();
    const { plan, phase, task } = buildFixtures(
      LearningTaskSource.SELF_DIRECTED,
      APP_FIXTURE_IDS.otherStudent,
    );
    learningTaskRepository.findById.mockResolvedValue(task);
    learningPhaseRepository.findById.mockResolvedValue(phase);
    learningPlanRepository.findById.mockResolvedValue(plan);

    await expect(
      handler.handle(
        CompleteLearningTaskCommand.fromRequest({
          taskId: APP_FIXTURE_IDS.task,
          studentId: APP_FIXTURE_IDS.student,
        }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(learningProgressWritePort.upsert).not.toHaveBeenCalled();
  });

  // Slice "enforce paused plan progress rules" — regla "PAUSED = no se
  // puede generar nuevo progreso" (ver auditoría "PAUSED Behavior Audit").
  it("rechaza con ConflictException si el LearningPlan está PAUSED y no persiste ningún cambio", async () => {
    const {
      handler,
      learningTaskRepository,
      learningPhaseRepository,
      learningPlanRepository,
      learningProgressWritePort,
    } = buildHandler();
    const { plan, phase, task } = buildFixtures();
    plan.pause();
    learningTaskRepository.findById.mockResolvedValue(task);
    learningPhaseRepository.findById.mockResolvedValue(phase);
    learningPlanRepository.findById.mockResolvedValue(plan);

    await expect(
      handler.handle(
        CompleteLearningTaskCommand.fromRequest({
          taskId: APP_FIXTURE_IDS.task,
          studentId: APP_FIXTURE_IDS.student,
        }),
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    // Sin side effects: la tarea permanece sin completar, sin persistir.
    expect(task.status).toBe("NOT_STARTED");
    expect(learningTaskRepository.save).not.toHaveBeenCalled();
    expect(learningPhaseRepository.save).not.toHaveBeenCalled();
    expect(learningProgressWritePort.upsert).not.toHaveBeenCalled();
  });
});
