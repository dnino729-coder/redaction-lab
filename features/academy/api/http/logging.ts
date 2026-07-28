import { AcademyConsoleLogger } from "@/features/academy/infrastructure/logging/AcademyConsoleLogger";
import type { AcademyRequestContext } from "./types";

// Logging (Alcance #9) — reutiliza EXCLUSIVAMENTE el Logger ya construido
// en Infrastructure (Sprint 6.2, `AcademyConsoleLogger`, que ya redacta
// claves sensibles) — ningún logger nuevo se introduce aquí.
const logger = new AcademyConsoleLogger();

export function logRequestStart(ctx: AcademyRequestContext): void {
  logger.info("academy_api_request_started", {
    endpoint: ctx.endpoint,
    method: ctx.method,
    correlationId: ctx.correlationId,
    requestId: ctx.requestId,
  });
}

export function logRequestCompleted(
  ctx: AcademyRequestContext,
  status: number,
  durationMs: number,
): void {
  logger.info("academy_api_request_completed", {
    endpoint: ctx.endpoint,
    method: ctx.method,
    status,
    durationMs,
    correlationId: ctx.correlationId,
    requestId: ctx.requestId,
  });
}

export function logRequestFailed(
  ctx: AcademyRequestContext,
  status: number,
  durationMs: number,
  error: unknown,
): void {
  logger.error("academy_api_request_failed", error, {
    endpoint: ctx.endpoint,
    method: ctx.method,
    status,
    durationMs,
    correlationId: ctx.correlationId,
    requestId: ctx.requestId,
  });
}

export { logger as academyApiLogger };
