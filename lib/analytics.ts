// Cliente PostHog (server-side) — sección 15.5: "Herramientas a integrar:
// Sentry, PostHog, OpenTelemetry...". Wiring de infraestructura genérico
// (no específico del Dashboard): cualquier Server Action de cualquier módulo
// que necesite emitir un evento de interacción/analítica (ej.
// `dashboard_recommendation_dismissed`, sección 8 del diseño del Dashboard)
// pasa por aquí. Sin lógica de negocio ni de módulo.
//
// No-op seguro si `NEXT_PUBLIC_POSTHOG_KEY` no está configurada (entornos
// locales/tests) — nunca lanza ni bloquea la Server Action que lo invoca.

import { PostHog } from "posthog-node";

const globalForPostHog = globalThis as unknown as { posthog?: PostHog };

function getClient(): PostHog | null {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) return null;

  if (!globalForPostHog.posthog) {
    globalForPostHog.posthog = new PostHog(apiKey, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return globalForPostHog.posthog;
}

export async function trackEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  const client = getClient();
  if (!client) return;

  client.capture({ distinctId, event, properties });
  await client.flush();
}
