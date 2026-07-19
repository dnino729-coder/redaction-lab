import { describe, it, expect } from "vitest";
import { UpdateLearningObjectiveHandler } from "@/features/my-plan/application/handlers/UpdateLearningObjectiveHandler";
import { UpdateLearningObjectiveCommand } from "@/features/my-plan/application/commands/UpdateLearningObjectiveCommand";
import { OwnershipVerificationService } from "@/features/my-plan/application/services/OwnershipVerificationService";
import { ConflictException } from "@/features/my-plan/application/exceptions/ConflictException";
import { LearningPlan } from "@/features/my-plan/domain/entities/LearningPlan";
import { LearningGoal } from "@/features/my-plan/domain/entities/LearningGoal";
import { LearningObjective } from "@/features/my-plan/domain/entities/LearningObjective";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import { LearningGoalId } from "@/features/my-plan/domain/value-objects/LearningGoalId";
import { LearningObjectiveId } from "@/features/my-plan/domain/value-objects/LearningObjectiveId";
import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import {
  makeLearningObjectiveRepository,
  makeLearningGoalRepository,
  makeLearningPlanRepository,
  makeLearningPhaseRepository,
  makeUnitOfWork,
  makeClock,
  makeLogger,
} from "./mocks";
import { APP_FIXTURE_IDS } from "./fixtures";

function buildFixtures() {
  const plan = LearningPlan.create({
    id: LearningPlanId.create(APP_FIXTURE_IDS.plan),
    studentId: StudentId.create(APP_FIXTURE_IDS.student),
    name: "Plan",
    targetLevel: "B2" as never,
    startDate: new Date("2026-01-01T00:00:00.000Z"),
  });
  const goal = LearningGoal.create({
    id: LearningGoalId.create(APP_FIXTURE_IDS.goal),
    learningPlanId: plan.id,
    title: "Meta 1",
  });
  const objective = LearningObjective.create({
    id: LearningObjectiveId.create(APP_FIXTURE_IDS.objective),
    learningGoalId: goal.id,
    title: "Objetivo 1",
    orderNumber: 1,
  });
  return { plan, goal, objective };
}

function buildHandler() {
  const learningObjectiveRepository = makeLearningObjectiveRepository();
  const learningGoalRepository = makeLearningGoalRepository();
  const learningPlanRepository = makeLearningPlanRepository();
  const learningPhaseRepository = makeLearningPhaseRepository();
  const ownershipVerificationService = new OwnershipVerificationService(
    learningPlanRepository as never,
    learningPhaseRepository as never,
    learningGoalRepository as never,
  );
  const handler = new UpdateLearningObjectiveHandler(
    learningObjectiveRepository as never,
    learningGoalRepository as never,
    ownershipVerificationService,
    makeUnitOfWork() as never,
    makeClock(new Date("2026-07-18T10:00:00.000Z")) as never,
    makeLogger() as never,
  );
  return { handler, learningObjectiveRepository, learningGoalRepository, learningPlanRepository };
}

describe("UpdateLearningObjectiveHandler", () => {
  it("START -> COMPLETE recalcula LearningGoal.status vía el estado de sus objetivos hermanos", async () => {
    const { handler, learningObjectiveRepository, learningGoalRepository, learningPlanRepository } = buildHandler();
    const { plan, goal, objective } = buildFixtures();
    learningObjectiveRepository.findById.mockResolvedValue(objective);
    learningGoalRepository.findById.mockResolvedValue(goal);
    learningPlanRepository.findById.mockResolvedValue(plan);
    objective.start();
    learningObjectiveRepository.findByLearningGoalId.mockResolvedValue([objective]);

    const result = await handler.handle(
      UpdateLearningObjectiveCommand.fromRequest({
        objectiveId: APP_FIXTURE_IDS.objective,
        studentId: APP_FIXTURE_IDS.student,
        action: "COMPLETE",
      }),
    );

    expect(result.status).toBe("COMPLETED");
    expect(goal.status).toBe("COMPLETED");
    expect(learningGoalRepository.save).toHaveBeenCalledWith(goal);
  });

  it("traduce InvalidStatusTransitionException a ConflictException (COMPLETE sin START previo: NOT_STARTED -> COMPLETED no es un borde válido de 18.21)", async () => {
    const { handler, learningObjectiveRepository, learningGoalRepository, learningPlanRepository } = buildHandler();
    const { plan, goal, objective } = buildFixtures();
    learningObjectiveRepository.findById.mockResolvedValue(objective);
    learningGoalRepository.findById.mockResolvedValue(goal);
    learningPlanRepository.findById.mockResolvedValue(plan);
    learningObjectiveRepository.findByLearningGoalId.mockResolvedValue([objective]);

    await expect(
      handler.handle(
        UpdateLearningObjectiveCommand.fromRequest({
          objectiveId: APP_FIXTURE_IDS.objective,
          studentId: APP_FIXTURE_IDS.student,
          action: "COMPLETE",
        }),
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
