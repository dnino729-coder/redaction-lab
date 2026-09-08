import { describe, it, expect } from "vitest";
import { LearningProgressCalculator } from "@/features/my-plan/application/services/LearningProgressCalculator";
import { LearningTaskStatus } from "@/features/my-plan/domain/enums/LearningTaskStatus";

describe("LearningProgressCalculator.fromTaskStatuses", () => {
  it("0 tareas: 0/0, 0%", () => {
    expect(LearningProgressCalculator.fromTaskStatuses([])).toEqual({
      completedTasks: 0,
      totalTasks: 0,
      completionPercentage: 0,
    });
  });

  it("1 NOT_STARTED: cuenta para total, no para completadas", () => {
    expect(LearningProgressCalculator.fromTaskStatuses([LearningTaskStatus.NOT_STARTED])).toEqual({
      completedTasks: 0,
      totalTasks: 1,
      completionPercentage: 0,
    });
  });

  it("1 IN_PROGRESS: cuenta para total, no para completadas", () => {
    expect(LearningProgressCalculator.fromTaskStatuses([LearningTaskStatus.IN_PROGRESS])).toEqual({
      completedTasks: 0,
      totalTasks: 1,
      completionPercentage: 0,
    });
  });

  it("1 COMPLETED: cuenta para total y para completadas (100%)", () => {
    expect(LearningProgressCalculator.fromTaskStatuses([LearningTaskStatus.COMPLETED])).toEqual({
      completedTasks: 1,
      totalTasks: 1,
      completionPercentage: 100,
    });
  });

  it("1 CANCELLED: no cuenta para total (0/0, no 0/1)", () => {
    expect(LearningProgressCalculator.fromTaskStatuses([LearningTaskStatus.CANCELLED])).toEqual({
      completedTasks: 0,
      totalTasks: 0,
      completionPercentage: 0,
    });
  });

  it("mezcla de estados: NOT_STARTED + IN_PROGRESS + COMPLETED + CANCELLED", () => {
    const result = LearningProgressCalculator.fromTaskStatuses([
      LearningTaskStatus.NOT_STARTED,
      LearningTaskStatus.IN_PROGRESS,
      LearningTaskStatus.COMPLETED,
      LearningTaskStatus.CANCELLED,
    ]);
    // CANCELLED excluida => total real = 3 (NOT_STARTED, IN_PROGRESS, COMPLETED).
    expect(result.totalTasks).toBe(3);
    expect(result.completedTasks).toBe(1);
    expect(result.completionPercentage).toBeCloseTo(33.33, 2);
  });

  it("todas CANCELLED: 0/0, 0% (no explota con total=0)", () => {
    expect(
      LearningProgressCalculator.fromTaskStatuses([
        LearningTaskStatus.CANCELLED,
        LearningTaskStatus.CANCELLED,
      ]),
    ).toEqual({
      completedTasks: 0,
      totalTasks: 0,
      completionPercentage: 0,
    });
  });

  it("el porcentaje coincide exactamente con CompletionProgress.fromCounts()", () => {
    const result = LearningProgressCalculator.fromTaskStatuses([
      LearningTaskStatus.COMPLETED,
      LearningTaskStatus.COMPLETED,
      LearningTaskStatus.NOT_STARTED,
    ]);
    expect(result.completionPercentage).toBeCloseTo(66.67, 2);
  });
});
