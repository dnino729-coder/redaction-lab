import { describe, it, expect } from "vitest";
import { LearningGoal } from "@/features/my-plan/domain/entities/LearningGoal";
import { LearningGoalId } from "@/features/my-plan/domain/value-objects/LearningGoalId";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import { LearningGoalStatus } from "@/features/my-plan/domain/enums/LearningGoalStatus";
import { InvalidStatusTransitionException } from "@/features/my-plan/domain/exceptions/InvalidStatusTransitionException";
import { FIXTURE_IDS } from "./fixtures";

function buildGoal() {
  return LearningGoal.create({
    id: LearningGoalId.create(FIXTURE_IDS.goal),
    learningPlanId: LearningPlanId.create(FIXTURE_IDS.plan),
    title: "Aprobar la prueba de expresión escrita",
  });
}

describe("LearningGoal — status calculado, nunca editado manualmente (18.21)", () => {
  it("no expone complete()/start() manuales — solo recalculateStatus()", () => {
    const goal = buildGoal();
    expect((goal as unknown as Record<string, unknown>).complete).toBeUndefined();
    expect((goal as unknown as Record<string, unknown>).start).toBeUndefined();
  });

  it("recalculateStatus() pasa a COMPLETED y asigna completed_at cuando todos los objetivos terminan", () => {
    const goal = buildGoal();
    const now = new Date("2026-07-17T12:00:00Z");
    goal.recalculateStatus(["COMPLETED", "COMPLETED"], now);

    expect(goal.status).toBe(LearningGoalStatus.COMPLETED);
    expect(goal.completedAt).toEqual(now);
  });

  it("recalculateStatus() limpia completed_at si vuelve a IN_PROGRESS (p. ej. se agregó un nuevo objetivo)", () => {
    const goal = buildGoal();
    goal.recalculateStatus(["COMPLETED"], new Date());
    expect(goal.status).toBe(LearningGoalStatus.COMPLETED);

    goal.recalculateStatus(["COMPLETED", "NOT_STARTED"], new Date());
    expect(goal.status).toBe(LearningGoalStatus.IN_PROGRESS);
    expect(goal.completedAt).toBeNull();
  });

  it("cancel() es una transición explícita permitida, independiente del cálculo automático", () => {
    const goal = buildGoal();
    goal.cancel();
    expect(goal.status).toBe(LearningGoalStatus.CANCELLED);
  });

  it("CANCELLED es terminal: recalculateStatus() posterior no tiene efecto", () => {
    const goal = buildGoal();
    goal.cancel();
    goal.recalculateStatus(["COMPLETED", "COMPLETED"], new Date());
    expect(goal.status).toBe(LearningGoalStatus.CANCELLED);
  });

  it("no permite cancelar un goal ya COMPLETED (COMPLETED -> CANCELLED prohibida)", () => {
    const goal = buildGoal();
    goal.recalculateStatus(["COMPLETED"], new Date());
    expect(() => goal.cancel()).toThrow(InvalidStatusTransitionException);
  });
});
