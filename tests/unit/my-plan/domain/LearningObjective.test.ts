import { describe, it, expect } from "vitest";
import { LearningObjective } from "@/features/my-plan/domain/entities/LearningObjective";
import { LearningObjectiveId } from "@/features/my-plan/domain/value-objects/LearningObjectiveId";
import { LearningGoalId } from "@/features/my-plan/domain/value-objects/LearningGoalId";
import { LearningObjectiveStatus } from "@/features/my-plan/domain/enums/LearningObjectiveStatus";
import { InvalidStatusTransitionException } from "@/features/my-plan/domain/exceptions/InvalidStatusTransitionException";
import { DomainInvariantViolationException } from "@/features/my-plan/domain/exceptions/DomainInvariantViolationException";
import { FIXTURE_IDS } from "./fixtures";

function buildObjective() {
  return LearningObjective.create({
    id: LearningObjectiveId.create(FIXTURE_IDS.objective),
    learningGoalId: LearningGoalId.create(FIXTURE_IDS.goal),
    title: "Dominar el subjuntivo",
    orderNumber: 1,
  });
}

describe("LearningObjective (13.4 / 18.21)", () => {
  it("nace en NOT_STARTED sin completed_at", () => {
    const objective = buildObjective();
    expect(objective.status).toBe(LearningObjectiveStatus.NOT_STARTED);
    expect(objective.completedAt).toBeNull();
  });

  it("permite la cadena NOT_STARTED -> IN_PROGRESS -> COMPLETED, asignando completed_at automáticamente", () => {
    const objective = buildObjective();
    objective.start();
    expect(objective.status).toBe(LearningObjectiveStatus.IN_PROGRESS);

    const now = new Date("2026-07-17T10:00:00Z");
    objective.complete(now);
    expect(objective.status).toBe(LearningObjectiveStatus.COMPLETED);
    expect(objective.completedAt).toEqual(now);
  });

  it("rechaza completar directamente desde NOT_STARTED (debe pasar por IN_PROGRESS)", () => {
    const objective = buildObjective();
    expect(() => objective.complete(new Date())).toThrow(InvalidStatusTransitionException);
  });

  it("permite revertir COMPLETED -> IN_PROGRESS y limpia completed_at (18.21: entidad de transición manual)", () => {
    const objective = buildObjective();
    objective.start();
    objective.complete(new Date());

    objective.revert();
    expect(objective.status).toBe(LearningObjectiveStatus.IN_PROGRESS);
    expect(objective.completedAt).toBeNull();
  });

  it("rechaza COMPLETED -> CANCELLED sin excepción", () => {
    const objective = buildObjective();
    objective.start();
    objective.complete(new Date());
    expect(() => objective.cancel()).toThrow(InvalidStatusTransitionException);
  });

  it("CANCELLED es terminal: ninguna transición posterior está permitida", () => {
    const objective = buildObjective();
    objective.cancel();
    expect(() => objective.start()).toThrow(InvalidStatusTransitionException);
    expect(() => objective.complete(new Date())).toThrow(InvalidStatusTransitionException);
  });

  it("rechaza construir con completed_at inconsistente con status (invariante 18.21)", () => {
    expect(() =>
      LearningObjective.restore({
        id: LearningObjectiveId.create(FIXTURE_IDS.objective),
        learningGoalId: LearningGoalId.create(FIXTURE_IDS.goal),
        title: "x",
        description: null,
        orderNumber: 0,
        completedAt: new Date(),
        status: LearningObjectiveStatus.IN_PROGRESS,
      }),
    ).toThrow(DomainInvariantViolationException);
  });

  it("rechaza título vacío", () => {
    expect(() =>
      LearningObjective.create({
        id: LearningObjectiveId.create(FIXTURE_IDS.objective),
        learningGoalId: LearningGoalId.create(FIXTURE_IDS.goal),
        title: "   ",
        orderNumber: 0,
      }),
    ).toThrow(DomainInvariantViolationException);
  });
});
