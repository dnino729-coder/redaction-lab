import { describe, it, expect } from "vitest";
import { InactivityPolicy } from "@/features/my-plan/domain/services/InactivityPolicy";

describe("InactivityPolicy — umbral de 3 días (18.20.3)", () => {
  const now = new Date("2026-07-17T00:00:00Z");

  it("no alcanza el umbral con 2 días de inactividad", () => {
    const lastSession = new Date("2026-07-15T00:00:00Z");
    expect(InactivityPolicy.daysInactive(lastSession, now)).toBe(2);
    expect(InactivityPolicy.isThresholdReached(lastSession, now)).toBe(false);
  });

  it("alcanza el umbral exactamente a los 3 días", () => {
    const lastSession = new Date("2026-07-14T00:00:00Z");
    expect(InactivityPolicy.daysInactive(lastSession, now)).toBe(3);
    expect(InactivityPolicy.isThresholdReached(lastSession, now)).toBe(true);
  });

  it("sin ninguna sesión previa, se considera inactivo (umbral alcanzado)", () => {
    expect(InactivityPolicy.isThresholdReached(null, now)).toBe(true);
  });

  it("es independiente del umbral de 1 día de Streak (11.4) — valor propio de Mi Plan", () => {
    expect(InactivityPolicy.INACTIVITY_THRESHOLD_DAYS).toBe(3);
  });
});
