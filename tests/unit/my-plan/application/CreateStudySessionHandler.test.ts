import { describe, it, expect } from "vitest";
import { CreateStudySessionHandler } from "@/features/my-plan/application/handlers/CreateStudySessionHandler";
import { CreateStudySessionCommand } from "@/features/my-plan/application/commands/CreateStudySessionCommand";
import { OwnershipVerificationService } from "@/features/my-plan/application/services/OwnershipVerificationService";
import { ForbiddenException } from "@/features/my-plan/application/exceptions/ForbiddenException";
import { ResourceNotFoundException } from "@/features/my-plan/application/exceptions/ResourceNotFoundException";
import { LearningPlan } from "@/features/my-plan/domain/entities/LearningPlan";
import { LearningPhase } from "@/features/my-plan/domain/entities/LearningPhase";
import { LearningTask } from "@/features/my-plan/domain/entities/LearningTask";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import { LearningPhaseId } from "@/features/my-plan/domain/value-objects/LearningPhaseId";
import { LearningTaskId } from "@/features/my-plan/domain/value-objects/LearningTaskId";
import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import {
  makeStudySessionRepository,
  makeLearningTaskRepository,
  makeLearningPhaseRepository,
  makeLearningPlanRepository,
  makeLearningGoalRepository,
  makeUnitOfWork,
  makeClock,
  makeUuidGenerator,
  makeLogger,
} from "./mocks";
import { APP_FIXTURE_IDS } from "./fixtures";

function buildFixtures(studentId = APP_FIXTURE_IDS.student) {
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
  });
  return { plan, phase, task };
}

function buildHandler() {
  const studySessionRepository = makeStudySessionRepository();
  const learningTaskRepository = makeLearningTaskRepository();
  const learningPhaseRepository = makeLearningPhaseRepository();
  const learningPlanRepository = makeLearningPlanRepository();
  const learningGoalRepository = makeLearningGoalRepository();
  const ownershipVerificationService = new OwnershipVerificationService(
    learningPlanRepository as never,
    learningPhaseRepository as never,
    learningGoalRepository as never,
  );
  const handler = new CreateStudySessionHandler(
    studySessionRepository as never,
    learningTaskRepository as never,
    ownershipVerificationService,
    makeUnitOfWork() as never,
    makeClock(new Date("2026-07-18T09:00:00.000Z")) as never,
    makeUuidGenerator([APP_FIXTURE_IDS.session]) as never,
    makeLogger() as never,
  );
  return { handler, studySessionRepository, learningTaskRepository, learningPhaseRepository, learningPlanRepository };
}

describe("CreateStudySessionHandler", () => {
  it("inicia una StudySession abierta (finishedAt = null, completed = false)", async () => {
    const { handler, studySessionRepository, learningTaskRepository, learningPhaseRepository, learningPlanRepository } =
      buildHandler();
    const { plan, phase, task } = buildFixtures();
    learningTaskRepository.findById.mockResolvedValue(task);
    learningPhaseRepository.findById.mockResolvedValue(phase);
    learningPlanRepository.findById.mockResolvedValue(plan);
    studySessionRepository.findById.mockImplementation(async () => studySessionRepository.save.mock.calls[0]?.[0] ?? null);

    const result = await handler.handle(
      CreateStudySessionCommand.fromRequest({
        studentId: APP_FIXTURE_IDS.student,
        learningTaskId: APP_FIXTURE_IDS.task,
      }),
    );

    expect(result.id).toBe(APP_FIXTURE_IDS.session);
    expect(result.completed).toBe(false);
    expect(result.finishedAt).toBeNull();
    expect(studySessionRepository.save).toHaveBeenCalledTimes(1);
  });

  it("rechaza con ResourceNotFoundException si la tarea no existe", async () => {
    const { handler, learningTaskRepository } = buildHandler();
    await expect(
      handler.handle(
        CreateStudySessionCommand.fromRequest({
          studentId: APP_FIXTURE_IDS.student,
          learningTaskId: APP_FIXTURE_IDS.task,
        }),
      ),
    ).rejects.toBeInstanceOf(ResourceNotFoundException);
  });

  it("rechaza con ForbiddenException si la tarea no pertenece al estudiante", async () => {
    const { handler, learningTaskRepository, learningPhaseRepository, learningPlanRepository } = buildHandler();
    const { plan, phase, task } = buildFixtures(APP_FIXTURE_IDS.otherStudent);
    learningTaskRepository.findById.mockResolvedValue(task);
    learningPhaseRepository.findById.mockResolvedValue(phase);
    learningPlanRepository.findById.mockResolvedValue(plan);

    await expect(
      handler.handle(
        CreateStudySessionCommand.fromRequest({
          studentId: APP_FIXTURE_IDS.student,
          learningTaskId: APP_FIXTURE_IDS.task,
        }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
