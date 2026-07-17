// Pruebas de la lógica pura del Dashboard Service (sección 15.6/16.2:
// cobertura mínima 90%). Sin mocks de Prisma/Redis: dashboardService.logic.ts
// no depende de infraestructura — ver comentario en ese archivo.
import { describe, expect, it } from "vitest";
import {
  buildEcosystemLinks,
  daysBetween,
  selectWelcomeVariant,
} from "@/features/dashboard/services/dashboardService.logic";
import { REACTIVATION_THRESHOLD_DAYS } from "@/features/dashboard/constants/dashboard.constants";
import { NAVIGATION_ITEMS } from "@/config/navigation";

describe("daysBetween", () => {
  it("calcula la diferencia en días completos entre dos fechas", () => {
    const from = new Date("2026-07-01T00:00:00Z");
    const to = new Date("2026-07-06T00:00:00Z");
    expect(daysBetween(from, to)).toBe(5);
  });

  it("devuelve un número negativo si `to` es anterior a `from`", () => {
    const from = new Date("2026-07-06T00:00:00Z");
    const to = new Date("2026-07-01T00:00:00Z");
    expect(daysBetween(from, to)).toBe(-5);
  });
});

describe("selectWelcomeVariant", () => {
  it("devuelve empty-first-visit cuando no hay ningún historial", () => {
    expect(selectWelcomeVariant({ hasAnyHistory: false, lastLoginAt: null })).toBe(
      "empty-first-visit",
    );
  });

  it("devuelve reactivation cuando la inactividad alcanza el umbral (sección 3, tono 2.3)", () => {
    const now = new Date("2026-07-16T00:00:00Z");
    const lastLoginAt = new Date(now);
    lastLoginAt.setDate(lastLoginAt.getDate() - REACTIVATION_THRESHOLD_DAYS);

    expect(
      selectWelcomeVariant({ hasAnyHistory: true, lastLoginAt, now }),
    ).toBe("reactivation");
  });

  it("devuelve ready cuando hay historial y la última sesión es reciente", () => {
    const now = new Date("2026-07-16T00:00:00Z");
    const lastLoginAt = new Date("2026-07-15T00:00:00Z");

    expect(selectWelcomeVariant({ hasAnyHistory: true, lastLoginAt, now })).toBe("ready");
  });

  it("devuelve ready cuando hay historial pero no se conoce la última sesión", () => {
    expect(selectWelcomeVariant({ hasAnyHistory: true, lastLoginAt: null })).toBe("ready");
  });
});

describe("buildEcosystemLinks", () => {
  it("excluye 'dashboard' y expone los 8 espacios restantes (sección 15)", () => {
    const links = buildEcosystemLinks();

    expect(links).toHaveLength(NAVIGATION_ITEMS.length - 1);
    expect(links.some((link) => link.key === "dashboard")).toBe(false);
  });

  it("genera un href estable de la forma /<clave> para cada espacio", () => {
    const links = buildEcosystemLinks();
    for (const link of links) {
      expect(link.href).toBe(`/${link.key}`);
    }
  });
});
