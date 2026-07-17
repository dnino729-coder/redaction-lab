import { describe, expect, it } from "vitest";
import { clampPercentage, formatMinutesAsHoursLabel } from "@/features/dashboard/utils/dashboard.utils";

describe("formatMinutesAsHoursLabel", () => {
  it("muestra solo minutos si son menos de 60", () => {
    expect(formatMinutesAsHoursLabel(45)).toBe("45 min");
  });

  it("muestra solo horas si los minutos son un múltiplo exacto de 60", () => {
    expect(formatMinutesAsHoursLabel(120)).toBe("2 h");
  });

  it("combina horas y minutos cuando corresponde", () => {
    expect(formatMinutesAsHoursLabel(95)).toBe("1 h 35 min");
  });

  it("maneja 0 minutos", () => {
    expect(formatMinutesAsHoursLabel(0)).toBe("0 min");
  });
});

describe("clampPercentage", () => {
  it("deja pasar valores dentro del rango 0-100", () => {
    expect(clampPercentage(42)).toBe(42);
  });

  it("recorta valores negativos a 0", () => {
    expect(clampPercentage(-10)).toBe(0);
  });

  it("recorta valores mayores a 100", () => {
    expect(clampPercentage(150)).toBe(100);
  });
});
