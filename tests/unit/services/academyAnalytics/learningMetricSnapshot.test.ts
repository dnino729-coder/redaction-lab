// Block 2D — lógica de arrastre de campos del snapshot de learning_metric.
// Cubre §14.3 (incrementa completedTasks), §14.14 (studyTimeMinutes igual),
// §14.15 (activeDays igual), §14.16 (otros campos igual).
import { describe, expect, it } from "vitest";
import { buildLearningMetricSnapshotFields } from "@/services/academyAnalytics/learningMetricSnapshot";

describe("buildLearningMetricSnapshotFields", () => {
  it("sin snapshot previo: todo a 0 salvo completedTasks", () => {
    expect(buildLearningMetricSnapshotFields(null, 1)).toEqual({
      studyTimeMinutes: 0,
      completedSessions: 0,
      completedTasks: 1,
      activeDays: 0,
    });
  });

  it("con snapshot previo: arrastra studyTimeMinutes, completedSessions y activeDays; solo cambia completedTasks", () => {
    const previous = { studyTimeMinutes: 42, completedSessions: 3, activeDays: 7 };
    expect(buildLearningMetricSnapshotFields(previous, 5)).toEqual({
      studyTimeMinutes: 42,
      completedSessions: 3,
      completedTasks: 5,
      activeDays: 7,
    });
  });

  it("completedTasks es exactamente el valor recibido (conteo de eventos proyectados), no un incremento sobre el previo", () => {
    const previous = { studyTimeMinutes: 0, completedSessions: 0, activeDays: 0 };
    // El previo tenía completedTasks=9 (irrelevante aquí): el nuevo valor
    // lo determina el conteo del llamador, no `previo + 1`.
    expect(buildLearningMetricSnapshotFields(previous, 3).completedTasks).toBe(3);
  });

  it("nunca inventa studyTimeMinutes ni activeDays desde este evento", () => {
    const fields = buildLearningMetricSnapshotFields(
      { studyTimeMinutes: 120, completedSessions: 8, activeDays: 12 },
      1,
    );
    expect(fields.studyTimeMinutes).toBe(120);
    expect(fields.activeDays).toBe(12);
    expect(fields.completedSessions).toBe(8);
  });
});
