import { describe, it, expect } from "vitest";
import { AutoCompletionStatusCalculator } from "@/features/my-plan/domain/services/AutoCompletionStatusCalculator";

describe("AutoCompletionStatusCalculator (18.21, punto 2)", () => {
  it("NOT_STARTED si no hay hijas", () => {
    expect(AutoCompletionStatusCalculator.calculate([])).toBe("NOT_STARTED");
  });

  it("NOT_STARTED si todas las hijas relevantes están NOT_STARTED", () => {
    expect(AutoCompletionStatusCalculator.calculate(["NOT_STARTED", "NOT_STARTED"])).toBe("NOT_STARTED");
  });

  it("IN_PROGRESS si al menos una hija inició sin que todas terminen", () => {
    expect(AutoCompletionStatusCalculator.calculate(["NOT_STARTED", "IN_PROGRESS"])).toBe("IN_PROGRESS");
    expect(AutoCompletionStatusCalculator.calculate(["COMPLETED", "NOT_STARTED"])).toBe("IN_PROGRESS");
  });

  it("COMPLETED cuando el 100% de las hijas no CANCELLED están COMPLETED", () => {
    expect(AutoCompletionStatusCalculator.calculate(["COMPLETED", "COMPLETED"])).toBe("COMPLETED");
  });

  it("excluye CANCELLED del cálculo (18.21: queda excluida de la condición de completado automático)", () => {
    expect(AutoCompletionStatusCalculator.calculate(["COMPLETED", "CANCELLED"])).toBe("COMPLETED");
    expect(AutoCompletionStatusCalculator.calculate(["CANCELLED", "CANCELLED"])).toBe("NOT_STARTED");
  });

  it("no queda nunca en CANCELLED (esa transición es explícita, no calculada)", () => {
    const result = AutoCompletionStatusCalculator.calculate(["CANCELLED", "IN_PROGRESS"]);
    expect(result).not.toBe("CANCELLED");
  });
});
