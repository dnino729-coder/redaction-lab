// P-04 → P-10 — Recorrido completo de un intento (Container paramétrico
// único). Ver limitación de entorno documentada en `shared.ts`: el
// recorrido de punta a punta (contextualizar → ... → reflexionar) exige
// sesión de estudiante real + un intento real en progreso — no verificable
// hoy sin `DATABASE_URL` ni usuario de prueba de Clerk. Se verifica aquí
// únicamente que cada slug de paso está protegido por el mismo mecanismo.
import { test, expect } from "@playwright/test";
import { expectProtectedRouteRedirectsToSignIn, runAxeScan } from "./shared";

const SAMPLE_ATTEMPT_ID = "00000000-0000-4000-8000-000000000001";
const STEP_SLUGS = [
  "contextualize",
  "define-objectives",
  "comprehend",
  "observe",
  "analyze",
  "practice",
  "produce",
  "feedback",
  "rewrite",
  "reflect",
] as const;

for (const slug of STEP_SLUGS) {
  test(`paso "${slug}" — la ruta existe y está protegida`, async ({ page }) => {
    await expectProtectedRouteRedirectsToSignIn(page, `/academy/attempts/${SAMPLE_ATTEMPT_ID}/${slug}`);
  });
}

test("accesibilidad (axe): sin violaciones críticas en la pantalla de acceso", async ({ page }) => {
  await expectProtectedRouteRedirectsToSignIn(page, `/academy/attempts/${SAMPLE_ATTEMPT_ID}/produce`);
  const results = await runAxeScan(page);
  const critical = results.violations.filter((v) => v.impact === "critical");
  expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
});
