import { prisma } from "@/lib/prisma";
import type { AIProviderFactory } from "@/features/academy/infrastructure/ai/AIProviderFactory";
import type { AcademyInfrastructureConfig } from "@/features/academy/infrastructure/config/academyConfig";

// Health Checks de Infrastructure de Academia — funciones planas (no
// `@nestjs/terminus`, resolución Sprint 6.0/6.2: sin NestJS). Nota de
// alcance: no existe ningún endpoint HTTP para esto en este Sprint (la
// capa de presentación/Route Handlers pertenece a un Sprint posterior,
// "Composition Root + capa API") — estas funciones quedan listas para ser
// invocadas desde un futuro `app/api/academy/health/route.ts`.
export interface AcademyHealthCheckResult {
  readonly name: string;
  readonly healthy: boolean;
  readonly details?: Record<string, unknown>;
  readonly error?: string;
}

/** Conectividad a PostgreSQL vía Prisma (Infrastructure Model v1.1, §11). */
export async function checkDatabaseHealth(): Promise<AcademyHealthCheckResult> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { name: "database", healthy: true };
  } catch (error) {
    return { name: "database", healthy: false, error: String(error) };
  }
}

/** Backlog de la tabla Outbox (`academy_outbox`) — filas PENDING/FAILED
 * por encima de un umbral configurable indica que el publicador (fuera de
 * alcance de este Sprint) no está drenando la cola. Umbral exacto:
 * PENDIENTE DE DECISIÓN DE INFRAESTRUCTURA (Infrastructure Model v1.1,
 * §11) — valor por defecto conservador, sobreescribible por configuración. */
export async function checkOutboxHealth(
  thresholdOverride?: number,
): Promise<AcademyHealthCheckResult> {
  const threshold = thresholdOverride ?? Number(process.env.ACADEMY_OUTBOX_BACKLOG_ALERT_THRESHOLD ?? 500);
  try {
    const backlog = await prisma.academyOutbox.count({ where: { status: { in: ["PENDING", "FAILED"] } } });
    return { name: "event_outbox", healthy: backlog < threshold, details: { backlog, threshold } };
  } catch (error) {
    return { name: "event_outbox", healthy: false, error: String(error) };
  }
}

/** Conectividad mínima al proveedor de IA activo — llamada de bajo costo,
 * nunca persistida (Infrastructure Model v1.1, §11). */
export async function checkAIProviderHealth(factory: AIProviderFactory): Promise<AcademyHealthCheckResult> {
  try {
    const provider = factory.create();
    await provider.generateCompletion({
      messages: [{ role: "user", content: "ping" }],
      maxTokens: 1,
    });
    return { name: "ai_provider", healthy: true, details: { provider: provider.name } };
  } catch (error) {
    return { name: "ai_provider", healthy: false, error: String(error) };
  }
}

/** Verifica que la configuración obligatoria de Infrastructure esté
 * presente (sin exponer secretos en el resultado). */
export function checkConfigurationHealth(config: AcademyInfrastructureConfig): AcademyHealthCheckResult {
  const missing: string[] = [];
  if (config.ai.provider === "claude" && !config.ai.claudeApiKey) missing.push("ACADEMY_CLAUDE_API_KEY");
  if (config.ai.provider === "openai" && !config.ai.openAiApiKey) missing.push("ACADEMY_OPENAI_API_KEY");
  return { name: "configuration", healthy: missing.length === 0, details: { missing } };
}

export async function runAcademyHealthChecks(
  factory: AIProviderFactory,
  config: AcademyInfrastructureConfig,
): Promise<readonly AcademyHealthCheckResult[]> {
  return Promise.all([
    checkDatabaseHealth(),
    checkOutboxHealth(),
    checkAIProviderHealth(factory),
    Promise.resolve(checkConfigurationHealth(config)),
  ]);
}
