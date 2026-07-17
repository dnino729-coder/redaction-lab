// Prueba e2e de humo (Playwright) — confirma que el servidor responde.
// No valida ninguna funcionalidad de producto todavía.
import { expect, test } from "@playwright/test";

test("la aplicación responde", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
});
