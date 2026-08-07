// P-01 — Mapa de unidades. Ver limitación de entorno documentada en
// `shared.ts`: sin sesión de Clerk real, se verifica la protección de ruta
// y accesibilidad de la pantalla de acceso; no el criterio de aceptación
// funcional (mapa/filtro/continuación), que exige sesión + DB reales.
import { test, expect } from "@playwright/test";
import { expectProtectedRouteRedirectsToSignIn, runAxeScan } from "./shared";

test.describe("P-01 — Mapa de unidades (/academy)", () => {
  test("la ruta existe y está protegida (redirige a sign-in sin sesión)", async ({ page }) => {
    await expectProtectedRouteRedirectsToSignIn(page, "/academy");
  });

  test("accesibilidad (axe): sin violaciones críticas en la pantalla de acceso", async ({ page }) => {
    await expectProtectedRouteRedirectsToSignIn(page, "/academy");
    const results = await runAxeScan(page);
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
  });
});
