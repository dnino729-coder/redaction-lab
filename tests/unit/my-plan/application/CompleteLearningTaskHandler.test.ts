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
  makeUnitOfWork,
  makeClock,
  makeEventBus,
  makeLogger,
} from "./mocks";
import { APP_FIXTURE_IDS } from "./fixtures";

function buildFixtures(source: LearningTaskSource = LearningTaskSource.SELF_DIRECTED, studentId = APP_FIXTURE_IDS.student) {
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
    unitOfWork as never,
    makeClock(new Date("2026-07-18T10:00:00.000Z")) as never,
    domainEventPublisher,
    logger as never,
  );

  return { handler, learningTaskRepository, learningPhaseRepository, learningPlanRepository, eventBus };
}

describe("CompleteLearningTaskHandler", () => {
  it("completa una tarea SELF_DIRECTED propia, recalcula la fase y publica PLAN_TASK_COMPLETED", async () => {
    const { handler, learningTaskRepository, learningPhaseRepository, learningPlanRepository, eventBus } =
      buildHandler();
    const { plan, phase, task } = buildFixtures();
    learningTaskRepository.findById.mockResolvedValue(task);
    learningTaskRepository.findByLearningPhaseId.mockResolvedValue([task]);
    learningPhaseRepository.findById.mockResolvedValue(phase);
    learningPlanRepository.findById.mockResolvedValue(plan);

    const result = await handler.handle(
      CompleteLearningTaskCommand.fromRequest({ taskId: APP_FIXTURE_IDS.task, studentId: APP_FIXTURE_IDS.student }),
    );

    expect(result.status).toBe("COMPLETED");
    expect(learningTaskRepository.save).toHaveBeenCalledWith(task);
    expect(learningPhaseRepository.save).toHaveBeenCalledWith(phase);
    expect(phase.status).toBe("COMPLETED");
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    expect(eventBus.publish.mock.calls[0]![0][0].eventName).toBe("PLAN_TASK_COMPLETED");
  });

  it("rechaza con ConflictException una tarea no SELF_DIRECTED (18.20.5, source guard)", async () => {
    const { handler, learningTaskRepository, learningPhaseRepository, learningPlanRepository } = buildHandler();
    const { plan, phase, task } = buildFixtures(LearningTaskSource.ACADEMY);
    learningTaskRepository.findById.mockResolvedValue(task);
    learningPhaseRepository.findById.mockResolvedValue(phase);
    learningPlanRepository.findById.mockResolvedValue(plan);

    await expect(
      handler.handle(
        CompleteLearningTaskCommand.fromRequest({ taskId: APP_FIXTURE_IDS.task, studentId: APP_FIXTURE_IDS.student }),
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rechaza con ForbiddenException si la tarea no pertenece al estudiante", async () => {
    const { handler, learningTaskRepository, learningPhaseRepository, learningPlanRepository } = buildHandler();
    const { plan, phase, task } = buildFixtures(LearningTaskSource.SELF_DIRECTED, APP_FIXTURE_IDS.otherStudent);
    learningTaskRepository.findById.mockResolvedValue(task);
    learningPhaseRepository.findById.mockResolvedValue(phase);
    learningPlanRepository.findById.mockResolvedValue(plan);

    await expect(
      handler.handle(
        CompleteLearningTaskCommand.fromRequest({ taskId: APP_FIXTURE_IDS.task, studentId: APP_FIXTURE_IDS.student }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
