import { randomUUID } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import { mapErrorToHttp } from "./errors";
import { jsonError } from "./response";
import { logRequestStart, logRequestCompleted, logRequestFailed } from "./logging";
import { recordAcademyTelemetry } from "./telemetry";
import type { AcademyRequestContext } from "./types";

// Middleware compuesto de Route Handler (Alcance #14: "Reutilizar
// Authentication, Logging, Correlation Id, Request Context. No crear
// middleware duplicado") — Authentication ya se aplica globalmente en
// `middleware.ts` (Clerk, raíz del proyecto, reutilizado sin cambios); esta
// función compone únicamente lo que es responsabilidad de cada Route
// Handler individual: Correlation Id / Request Id (Sección 2/12 del
// contrato), Logging (Alcance #9) y Telemetry (Alcance #10) — un único
// punto, reutilizado por los 23 endpoints + 3 Health Checks, para no
// duplicar esta composición en cada `route.ts`.
export async function withAcademyRoute(
  request: NextRequest,
  endpoint: string,
  fn: (ctx: AcademyRequestContext) => Promise<NextResponse>,
): Promise<NextResponse> {
  const correlationId = request.headers.get("X-Correlation-Id") ?? randomUUID();
  const requestId = randomUUID();
  const startedAtMs = Date.now();
  const ctx: AcademyRequestContext = {
    correlationId,
    requestId,
    startedAtMs,
    endpoint,
    method: request.method,
  };

  logRequestStart(ctx);
  try {
    const response = await fn(ctx);
    const durationMs = Date.now() - startedAtMs;
    logRequestCompleted(ctx, response.status, durationMs);
    recordAcademyTelemetry({
      endpoint,
      method: ctx.method,
      status: response.status,
      durationMs,
      at: new Date(startedAtMs).toISOString(),
    });
    return response;
  } catch (error) {
    const durationMs = Date.now() - startedAtMs;
    const mapped = mapErrorToHttp(error, correlationId);
    logRequestFailed(ctx, mapped.status, durationMs, error);
    recordAcademyTelemetry({
      endpoint,
      method: ctx.method,
      status: mapped.status,
      durationMs,
      at: new Date(startedAtMs).toISOString(),
    });
    return jsonError(mapped, { correlationId, requestId });
  }
}
