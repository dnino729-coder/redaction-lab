// Block 2F — Route Handler del job programado que invoca el consumer de
// Block 2D. La lógica de proyección/idempotencia/retry NO se re-testea aquí
// (está cubierta en tests/unit/services/academyAnalytics/) — este archivo
// solo cubre la ruta: autenticación por CRON_SECRET, forma de la respuesta,
// y manejo de error.
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const runReflectionCompletedProjection = vi.fn();
vi.mock("@/services/academyAnalytics", () => ({
  runReflectionCompletedProjection: (...args: unknown[]) =>
    runReflectionCompletedProjection(...args),
}));

import * as route from "@/app/api/internal/jobs/academy-reflection-projection/route";

const SECRET = "test-cron-secret-value";

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request("https://example.com/api/internal/jobs/academy-reflection-projection", {
    method: "POST",
    headers,
  });
}

describe("POST/GET /api/internal/jobs/academy-reflection-projection", () => {
  const originalSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    runReflectionCompletedProjection.mockReset();
    process.env.CRON_SECRET = SECRET;
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = originalSecret;
  });

  it("request autorizado (Bearer CRON_SECRET): ejecuta el consumer y devuelve su resumen", async () => {
    runReflectionCompletedProjection.mockResolvedValue({
      claimed: 3,
      projected: 2,
      skipped: 1,
      failed: 0,
    });

    const res = await route.POST(makeRequest({ authorization: `Bearer ${SECRET}` }));

    expect(res.status).toBe(200);
    expect(runReflectionCompletedProjection).toHaveBeenCalledTimes(1);
    expect(runReflectionCompletedProjection).toHaveBeenCalledWith();
    await expect(res.json()).resolves.toEqual({ claimed: 3, projected: 2, skipped: 1, failed: 0 });
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("GET autorizado (Vercel Cron usa GET): también ejecuta el consumer", async () => {
    runReflectionCompletedProjection.mockResolvedValue({
      claimed: 0,
      projected: 0,
      skipped: 0,
      failed: 0,
    });

    const res = await route.GET(makeRequest({ authorization: `Bearer ${SECRET}` }));

    expect(res.status).toBe(200);
    expect(runReflectionCompletedProjection).toHaveBeenCalledTimes(1);
  });

  it("request sin header Authorization: 401, no ejecuta el consumer", async () => {
    const res = await route.POST(makeRequest());

    expect(res.status).toBe(401);
    expect(runReflectionCompletedProjection).not.toHaveBeenCalled();
    await expect(res.json()).resolves.toEqual({ error: "unauthorized" });
  });

  it("request con secreto incorrecto: 401", async () => {
    const res = await route.POST(makeRequest({ authorization: "Bearer wrong-secret" }));

    expect(res.status).toBe(401);
    expect(runReflectionCompletedProjection).not.toHaveBeenCalled();
  });

  it("fail-closed: si CRON_SECRET no está configurada, rechaza incluso un Bearer bien formado", async () => {
    delete process.env.CRON_SECRET;

    const res = await route.POST(makeRequest({ authorization: "Bearer anything" }));

    expect(res.status).toBe(401);
    expect(runReflectionCompletedProjection).not.toHaveBeenCalled();
  });

  it("error del consumer: 500 con mensaje genérico (sin detalle interno)", async () => {
    runReflectionCompletedProjection.mockRejectedValue(
      new Error("connection to database failed: host unreachable"),
    );
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await route.POST(makeRequest({ authorization: `Bearer ${SECRET}` }));

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ error: "projection run failed" });
    expect(JSON.stringify(body)).not.toContain("database");
    expect(JSON.stringify(body)).not.toContain("unreachable");
    errorSpy.mockRestore();
  });

  it("solo expone GET y POST (los demás métodos → 405 automático de Next.js)", () => {
    expect(typeof route.GET).toBe("function");
    expect(typeof route.POST).toBe("function");
    expect("PUT" in route).toBe(false);
    expect("PATCH" in route).toBe(false);
    expect("DELETE" in route).toBe(false);
  });

  it("declara la ruta como dinámica (nunca cacheada)", () => {
    expect(route.dynamic).toBe("force-dynamic");
  });
});
