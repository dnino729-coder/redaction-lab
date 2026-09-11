// Punto de entrada programado del consumer de proyección
// ReflectionCompletedEvent -> learning_metric (implementado en Block 2D).
//
// Esta ruta SOLO invoca `runReflectionCompletedProjection()`. No contiene
// lógica de proyección, retry, idempotencia ni concurrencia — todas esas
// garantías viven en el consumer y en el SQL (Block 2D: FOR UPDATE SKIP
// LOCKED + re-chequeo de status + advisory lock por estudiante +
// transacción atómica). Por eso una invocación duplicada o concurrente del
// cron no puede duplicar una proyección.
//
// AUTENTICACIÓN — mecanismo oficial de Vercel Cron ("Securing cron jobs"):
// cuando `CRON_SECRET` está configurada en el proyecto, Vercel envía
// `Authorization: Bearer ${CRON_SECRET}` en cada invocación programada.
// La ruta verifica ese header. Mismo patrón arquitectónico que el webhook
// de Clerk (app/api/webhooks/clerk/route.ts): la ruta está en
// `isPublicRoute` (middleware/auth.ts) para que el middleware de sesión de
// Clerk no la intercepte, y aplica su propia autenticación de secreto.
// NO usa autenticación de usuario de Clerk — el job corre como
// `dashboard_service_role` vía `withServiceContext`, igual que el consumer.
//
// FAIL-CLOSED: si `CRON_SECRET` no está configurada (dev local, cualquier
// entorno sin el secreto), toda petición se rechaza con 401 — el endpoint
// queda inerte hasta que un operador configure el secreto en Vercel.
//
// MÉTODO: Vercel Cron dispara los jobs con una petición GET (restricción de
// plataforma — el método del cron no es configurable). Se exporta GET para
// esa invocación y POST para invocación manual de operador (`curl`) o un
// futuro scheduler no-Vercel. Ambos son idénticos, protegidos por el mismo
// secreto y no cacheables.

import { NextResponse } from "next/server";
import { runReflectionCompletedProjection } from "@/services/academyAnalytics";

export const dynamic = "force-dynamic";

function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // fail-closed: sin secreto configurado, se rechaza todo
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function handleScheduledRun(request: Request): Promise<Response> {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runReflectionCompletedProjection();
    return NextResponse.json(summary, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    // Error completo a los logs del servidor; en la respuesta solo un
    // mensaje genérico (sin payloads, sin studentId, sin detalle interno).
    // Mismo criterio de logging que app/api/webhooks/clerk/route.ts.
    // eslint-disable-next-line no-console -- sin logging estructurado todavía (fuera de alcance de este bloque)
    console.error("[academy-reflection-projection] projection run failed", error);
    return NextResponse.json({ error: "projection run failed" }, { status: 500 });
  }
}

export async function GET(request: Request): Promise<Response> {
  return handleScheduledRun(request);
}

export async function POST(request: Request): Promise<Response> {
  return handleScheduledRun(request);
}
