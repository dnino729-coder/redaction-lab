// Helper compartido de los specs E2E de Academia (Fase 6, Roadmap §24).
//
// Limitación real de este entorno, verificada antes de escribir estos specs
// (no asumida): no existe `DATABASE_URL` configurada en `.env.local`, no
// existe ningún usuario de prueba de Clerk ni mecanismo de bypass de sesión
// (`@clerk/testing` no está instalado — no forma parte del alcance
// aprobado de esta fase, que solo autorizó `@axe-core/playwright`). En
// consecuencia, ninguna de las 12 pantallas de Academia es alcanzable en un
// recorrido autenticado real dentro de este entorno: `middleware.ts` ya
// protege todas las rutas de Academia (no están en `isPublicRoute`), por lo
// que cualquier visita sin sesión redirige a `/sign-in`.
//
// Estos specs verifican, con evidencia real y sin fabricar resultados, lo
// único genuinamente comprobable hoy: (a) la ruta existe y está realmente
// protegida (regresión real de seguridad — una ruta que dejara de proteger
// una pantalla de Academia sería un defecto grave), y (b) una auditoría de
// accesibilidad real (axe) sobre la pantalla de acceso que todo usuario debe
// atravesar primero. La verificación de los criterios de aceptación
// funcionales de cada pantalla (P-01 a P-14) exige sesión de Clerk +
// `DATABASE_URL` real — infraestructura de entorno pendiente, no un defecto
// de código, documentada explícitamente en el informe de esta fase.
import { expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

export async function expectProtectedRouteRedirectsToSignIn(page: Page, path: string) {
  await page.goto(path);
  await page.waitForURL(/\/sign-in/, { timeout: 15_000 });
  expect(page.url()).toContain("/sign-in");
}

export async function runAxeScan(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  return results;
}
