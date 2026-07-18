import { describe, it, expect } from "vitest";
import { LearningPlan } from "@/features/my-plan/domain/entities/LearningPlan";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import { LearningPlanStatus } from "@/features/my-plan/domain/enums/LearningPlanStatus";
import { CefrLevel } from "@/features/my-plan/domain/enums/CefrLevel";
import { PlanCreatedEvent } from "@/features/my-plan/domain/events/PlanCreatedEvent";
import { InvalidStatusTransitionException } from "@/features/my-plan/domain/exceptions/InvalidStatusTransitionException";
import { FIXTURE_IDS } from "./fixtures";

function buildPlan() {
  return LearningPlan.create({
    id: LearningPlanId.create(FIXTURE_IDS.plan),
    studentId: StudentId.create(FIXTURE_IDS.student),
    name: "Preparación DELF B2 — Julio 2026",
    targetLevel: CefrLevel.B2,
    startDate: new Date("2026-07-01"),
  });
}

describe("LearningPlan (13.4 / Aggregate Root)", () => {
  it("create() nace ACTIVE y emite PLAN_CREATED", () => {
    const plan = buildPlan();
    expect(plan.status).toBe(LearningPlanStatus.ACTIVE);

    const events = plan.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(PlanCreatedEvent);
    expect((events[0] as PlanCreatedEvent).payload).toEqual({
      studentId: FIXTURE_IDS.student,
      learningPlanId: FIXTURE_IDS.plan,
    });
  });

  it("pause()/resume() transicionan ACTIVE <-> PAUSED", () => {
    const plan = buildPlan();
    plan.pause();
    expect(plan.status).toBe(LearningPlanStatus.PAUSED);
    plan.resume();
    expect(plan.status).toBe(LearningPlanStatus.ACTIVE);
  });

  it("complete() y cancel() son válidos desde ACTIVE o PAUSED", () => {
    const plan1 = buildPlan();
    plan1.complete(new Date("2026-08-01"));
    expect(plan1.status).toBe(LearningPlanStatus.COMPLETED);

    const plan2 = buildPlan();
    plan2.pause();
    plan2.cancel(new Date("2026-08-01"));
    expect(plan2.status).toBe(LearningPlanStatus.CANCELLED);
  });

  it("COMPLETED y CANCELLED son terminales: ninguna transición posterior es válida", () => {
    const plan = buildPlan();
    plan.complete(new Date("2026-08-01"));
    expect(() => plan.pause()).toThrow(InvalidStatusTransitionException);
    expect(() => plan.cancel(new Date())).toThrow(InvalidStatusTransitionException);
  });

  it("restore() no dispara ningún Domain Event (reconstrucción desde persistencia)", () => {
    const plan = LearningPlan.restore({
      id: LearningPlanId.create(FIXTURE_IDS.plan),
      studentId: StudentId.create(FIXTURE_IDS.student),
      name: "Plan ya existente",
      description: null,
      targetLevel: CefrLevel.B2,
      startDate: new Date("2026-01-01"),
      endDate: null,
      status: LearningPlanStatus.ACTIVE,
    });
    expect(plan.pullDomainEvents()).toHaveLength(0);
  });
});
