import { describe, it, expect } from "vitest";
import { RequestPlanReorganizationHandler } from "@/features/my-plan/application/handlers/RequestPlanReorganizationHandler";
import { RequestPlanReorganizationCommand } from "@/features/my-plan/application/commands/RequestPlanReorganizationCommand";
import { ForbiddenException } from "@/features/my-plan/application/exceptions/ForbiddenException";
import { LearningPlan } from "@/features/my-plan/domain/entities/LearningPlan";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import { makeLearningPlanRepository, makeEventBus, makeClock, makeLogger } from "./mocks";
import { APP_FIXTURE_IDS } from "./fixtures";

function buildPlan(studentId = APP_FIXTURE_IDS.student) {
  return LearningPlan.create({
    id: LearningPlanId.create(APP_FIXTURE_IDS.plan),
    studentId: StudentId.create(studentId),
    name: "Plan",
    targetLevel: "B2" as never,
    startDate: new Date("2026-01-01T00:00:00.000Z"),
  });
}

describe("RequestPlanReorganizationHandler", () => {
  it("publica PLAN_REORGANIZATION_REQUESTED sin persistir ningún cambio de dominio", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    learningPlanRepository.findById.mockResolvedValue(buildPlan());
    const eventBus = makeEventBus();
    const fixedNow = new Date("2026-07-18T15:00:00.000Z");
    const handler = new RequestPlanReorganizationHandler(
      learningPlanRepository as never,
      eventBus as never,
      makeClock(fixedNow) as never,
      makeLogger() as never,
    );

    const result = await handler.handle(
      RequestPlanReorganizationCommand.fromRequest({
        planId: APP_FIXTURE_IDS.plan,
        studentId: APP_FIXTURE_IDS.student,
        reason: "EXAM_DATE_CHANGED",
      }),
    );

    expect(result.accepted).toBe(true);
    expect(result.reason).toBe("EXAM_DATE_CHANGED");
    expect(result.requestedAt).toBe(fixedNow.toISOString());
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const [events] = eventBus.publish.mock.calls[0]!;
    expect(events[0].eventName).toBe("PLAN_REORGANIZATION_REQUESTED");
    expect(learningPlanRepository.save).not.toHaveBeenCalled();
  });

  it("rechaza con ForbiddenException si el plan no pertenece al estudiante", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    learningPlanRepository.findById.mockResolvedValue(buildPlan(APP_FIXTURE_IDS.otherStudent));
    const handler = new RequestPlanReorganizationHandler(
      learningPlanRepository as never,
      makeEventBus() as never,
      makeClock(new Date()) as never,
      makeLogger() as never,
    );

    await expect(
      handler.handle(
        RequestPlanReorganizationCommand.fromRequest({
          planId: APP_FIXTURE_IDS.plan,
          studentId: APP_FIXTURE_IDS.student,
          reason: "AVAILABILITY_CHANGED",
        }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
