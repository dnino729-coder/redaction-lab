// P-14 — Gestión de Biblioteca de Modelos (Administrador). Ver limitación
// de entorno documentada en `shared.ts`.
import { test, expect } from "@playwright/test";
import { expectProtectedRouteRedirectsToSignIn, runAxeScan } from "./shared";

test.describe("P-14 — Gestión de Biblioteca de Modelos (/academy/admin/model-examples)", () => {
  test("la ruta existe y está protegida", async ({ page }) => {
    await expectProtectedRouteRedirectsToSignIn(page, "/academy/admin/model-examples");
  });

  test("accesibilidad (axe): sin violaciones críticas en la pantalla de acceso", async ({ page }) => {
    await expectProtectedRouteRedirectsToSignIn(page, "/academy/admin/model-examples");
    const results = await runAxeScan(page);
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
  });
});
