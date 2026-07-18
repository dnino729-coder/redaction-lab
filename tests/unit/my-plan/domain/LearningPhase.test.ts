import { describe, it, expect } from "vitest";
import { LearningPhase } from "@/features/my-plan/domain/entities/LearningPhase";
import { LearningPhaseId } from "@/features/my-plan/domain/value-objects/LearningPhaseId";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import { LearningPhaseStatus } from "@/features/my-plan/domain/enums/LearningPhaseStatus";
import { DomainInvariantViolationException } from "@/features/my-plan/domain/exceptions/DomainInvariantViolationException";
import { FIXTURE_IDS } from "./fixtures";

describe("LearningPhase — status calculado a partir de LearningTask (18.21)", () => {
  it("recalculateStatus() refleja el estado agregado de sus tareas", () => {
    const phase = LearningPhase.create({
      id: LearningPhaseId.create(FIXTURE_IDS.phase),
      learningPlanId: LearningPlanId.create(FIXTURE_IDS.plan),
      name: "Fase 1 — Fundamentos",
      phaseOrder: 1,
      startDate: new Date("2026-07-01"),
    });

    phase.recalculateStatus(["NOT_STARTED", "NOT_STARTED"], new Date());
    expect(phase.status).toBe(LearningPhaseStatus.NOT_STARTED);

    phase.recalculateStatus(["COMPLETED", "IN_PROGRESS"], new Date());
    expect(phase.status).toBe(LearningPhaseStatus.IN_PROGRESS);

    const completionDate = new Date("2026-08-01");
    phase.recalculateStatus(["COMPLETED", "COMPLETED"], completionDate);
    expect(phase.status).toBe(LearningPhaseStatus.COMPLETED);
    expect(phase.completedAt).toEqual(completionDate);
  });

  it("rechaza end_date anterior a start_date", () => {
    expect(() =>
      LearningPhase.create({
        id: LearningPhaseId.create(FIXTURE_IDS.phase),
        learningPlanId: LearningPlanId.create(FIXTURE_IDS.plan),
        name: "Fase inválida",
        phaseOrder: 1,
        startDate: new Date("2026-08-01"),
        endDate: new Date("2026-07-01"),
      }),
    ).toThrow(DomainInvariantViolationException);
  });
});
