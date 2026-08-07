// P-02 (Detalle de unidad) / P-03 (Historial de intentos). Ver limitación
// de entorno documentada en `shared.ts`.
import { test, expect } from "@playwright/test";
import { expectProtectedRouteRedirectsToSignIn, runAxeScan } from "./shared";

const SAMPLE_UNIT_ID = "00000000-0000-4000-8000-000000000000";

test.describe("P-02 — Detalle de unidad (/academy/units/[unitId])", () => {
  test("la ruta existe y está protegida", async ({ page }) => {
    await expectProtectedRouteRedirectsToSignIn(page, `/academy/units/${SAMPLE_UNIT_ID}`);
  });
});

test.describe("P-03 — Historial de intentos (/academy/units/[unitId]/history)", () => {
  test("la ruta existe y está protegida", async ({ page }) => {
    await expectProtectedRouteRedirectsToSignIn(page, `/academy/units/${SAMPLE_UNIT_ID}/history`);
  });

  test("accesibilidad (axe): sin violaciones críticas en la pantalla de acceso", async ({ page }) => {
    await expectProtectedRouteRedirectsToSignIn(page, `/academy/units/${SAMPLE_UNIT_ID}/history`);
    const results = await runAxeScan(page);
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
  });
});
