import { describe, it, expect } from "vitest";
import { PauseLearningPlanHandler } from "@/features/my-plan/application/handlers/PauseLearningPlanHandler";
import { PauseLearningPlanCommand } from "@/features/my-plan/application/commands/PauseLearningPlanCommand";
import { ResumeLearningPlanHandler } from "@/features/my-plan/application/handlers/ResumeLearningPlanHandler";
import { ResumeLearningPlanCommand } from "@/features/my-plan/application/commands/ResumeLearningPlanCommand";
import { CancelLearningPlanHandler } from "@/features/my-plan/application/handlers/CancelLearningPlanHandler";
import { CancelLearningPlanCommand } from "@/features/my-plan/application/commands/CancelLearningPlanCommand";
import { ResourceNotFoundException } from "@/features/my-plan/application/exceptions/ResourceNotFoundException";
import { ForbiddenException } from "@/features/my-plan/application/exceptions/ForbiddenException";
import { ConflictException } from "@/features/my-plan/application/exceptions/ConflictException";
import { LearningPlan } from "@/features/my-plan/domain/entities/LearningPlan";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import { makeLearningPlanRepository, makeUnitOfWork, makeClock, makeLogger } from "./mocks";
import { APP_FIXTURE_IDS } from "./fixtures";

function activePlan(studentId = APP_FIXTURE_IDS.student) {
  return LearningPlan.create({
    id: LearningPlanId.create(APP_FIXTURE_IDS.plan),
    studentId: StudentId.create(studentId),
    name: "Plan activo",
    targetLevel: "B2" as never,
    startDate: new Date("2026-01-01T00:00:00.000Z"),
  });
}

describe("PauseLearningPlanHandler", () => {
  it("pausa un plan ACTIVE propio", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    learningPlanRepository.findById.mockResolvedValue(activePlan());
    const handler = new PauseLearningPlanHandler(
      learningPlanRepository as never,
      makeUnitOfWork() as never,
      makeLogger() as never,
    );

    const result = await handler.handle(
      PauseLearningPlanCommand.fromRequest({ planId: APP_FIXTURE_IDS.plan, studentId: APP_FIXTURE_IDS.student }),
    );
    expect(result.status).toBe("PAUSED");
  });

  it("lanza ResourceNotFoundException si el plan no existe", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    const handler = new PauseLearningPlanHandler(
      learningPlanRepository as never,
      makeUnitOfWork() as never,
      makeLogger() as never,
    );

    await expect(
      handler.handle(
        PauseLearningPlanCommand.fromRequest({ planId: APP_FIXTURE_IDS.plan, studentId: APP_FIXTURE_IDS.student }),
      ),
    ).rejects.toBeInstanceOf(ResourceNotFoundException);
  });

  it("lanza ForbiddenException si el plan pertenece a otro estudiante", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    learningPlanRepository.findById.mockResolvedValue(activePlan(APP_FIXTURE_IDS.otherStudent));
    const handler = new PauseLearningPlanHandler(
      learningPlanRepository as never,
      makeUnitOfWork() as never,
      makeLogger() as never,
    );

    await expect(
      handler.handle(
        PauseLearningPlanCommand.fromRequest({ planId: APP_FIXTURE_IDS.plan, studentId: APP_FIXTURE_IDS.student }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("traduce InvalidStatusTransitionException del dominio a ConflictException", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    const plan = activePlan();
    plan.cancel(new Date("2026-02-01T00:00:00.000Z")); // ahora es terminal (CANCELLED)
    learningPlanRepository.findById.mockResolvedValue(plan);
    const handler = new PauseLearningPlanHandler(
      learningPlanRepository as never,
      makeUnitOfWork() as never,
      makeLogger() as never,
    );

    await expect(
      handler.handle(
        PauseLearningPlanCommand.fromRequest({ planId: APP_FIXTURE_IDS.plan, studentId: APP_FIXTURE_IDS.student }),
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

describe("ResumeLearningPlanHandler", () => {
  it("reanuda un plan PAUSED propio", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    const plan = activePlan();
    plan.pause();
    learningPlanRepository.findById.mockResolvedValue(plan);
    const handler = new ResumeLearningPlanHandler(
      learningPlanRepository as never,
      makeUnitOfWork() as never,
      makeLogger() as never,
    );

    const result = await handler.handle(
      ResumeLearningPlanCommand.fromRequest({ planId: APP_FIXTURE_IDS.plan, studentId: APP_FIXTURE_IDS.student }),
    );
    expect(result.status).toBe("ACTIVE");
  });
});

describe("CancelLearningPlanHandler", () => {
  it("cancela un plan y usa Clock.now() para endDate, nunca un valor del cliente", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    learningPlanRepository.findById.mockResolvedValue(activePlan());
    const fixedNow = new Date("2026-07-18T12:00:00.000Z");
    const handler = new CancelLearningPlanHandler(
      learningPlanRepository as never,
      makeUnitOfWork() as never,
      makeClock(fixedNow) as never,
      makeLogger() as never,
    );

    const result = await handler.handle(
      CancelLearningPlanCommand.fromRequest({ planId: APP_FIXTURE_IDS.plan, studentId: APP_FIXTURE_IDS.student }),
    );
    expect(result.status).toBe("CANCELLED");
    expect(result.endDate).toBe(fixedNow.toISOString());
  });
});
