import { NextResponse } from "next/server";
import { createAcademyContainer } from "../composition/academyContainer";
import { jsonSuccess, type AcademyResponseHeaders } from "../http/response";
import {
  runAcademyHealthChecks,
  checkDatabaseHealth,
  checkConfigurationHealth,
} from "@/features/academy/infrastructure/health/academyHealthChecks";
import { loadAcademyInfrastructureConfig } from "@/features/academy/infrastructure/config/academyConfig";

// Health Endpoints (Alcance #11) — reutiliza EXCLUSIVAMENTE las funciones
// ya construidas en Infrastructure (Sprint 6.2,
// `features/academy/infrastructure/health/academyHealthChecks.ts`) — Route
// Handlers ligeros que solo invocan y traducen a HTTP, sin lógica de
// Health Check nueva. Nunca requieren sesión Clerk (ver
// `middleware/auth.ts`, patrón público añadido en este Sprint).

// GET /api/v1/academy/health — verificación completa (Prisma/Outbox/AI/Config).
export async function handleHealth(headers: AcademyResponseHeaders): Promise<NextResponse> {
  const container = createAcademyContainer();
  const config = loadAcademyInfrastructureConfig();
  const results = await runAcademyHealthChecks(container.ai.providerFactory, config);
  const healthy = results.every((result) => result.healthy);
  return jsonSuccess({ status: healthy ? "ok" : "degraded", checks: results }, healthy ? 200 : 503, headers);
}

// GET /api/v1/academy/health/readiness — ¿puede el proceso servir tráfico
// ahora mismo? (Base de datos + configuración obligatoria). No evalúa IA/
// Outbox (fallas ahí no deben sacar la instancia de rotación, solo
// degradar esa función puntual — mismo criterio ya usado por
// `checkConfigurationHealth`/`checkDatabaseHealth`, invocadas de forma
// independiente aquí en vez de `runAcademyHealthChecks` completo).
export async function handleReadiness(headers: AcademyResponseHeaders): Promise<NextResponse> {
  const config = loadAcademyInfrastructureConfig();
  const [database, configuration] = await Promise.all([
    checkDatabaseHealth(),
    Promise.resolve(checkConfigurationHealth(config)),
  ]);
  const ready = database.healthy && configuration.healthy;
  return jsonSuccess({ status: ready ? "ready" : "not_ready", checks: [database, configuration] }, ready ? 200 : 503, headers);
}

// GET /api/v1/academy/health/liveness — ¿el proceso sigue vivo? Sin
// dependencias externas (mismo criterio que `app/api/health/route.ts` ya
// existente a nivel de plataforma) — nunca debe fallar por una
// dependencia externa caída (esa es responsabilidad de Readiness).
export async function handleLiveness(headers: AcademyResponseHeaders): Promise<NextResponse> {
  return jsonSuccess({ status: "alive" }, 200, headers);
}
