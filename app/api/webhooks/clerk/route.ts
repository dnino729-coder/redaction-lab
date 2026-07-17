// Webhook de Clerk (sincronización de identidad → sección 12.4, flujo de
// registro). Corrige el hallazgo crítico de la auditoría de producción: sin
// este handler, ningún usuario que se registrara en Clerk llegaba a tener
// una fila en "user" con clerk_user_id poblado, y el Dashboard
// (services/auth, requireAuthenticatedStudentId) era inalcanzable de
// extremo a extremo para cualquier cuenta real.
//
// Verificación de firma: Clerk firma cada entrega con Svix (HMAC-SHA256) —
// nunca se procesa un payload sin verificar la firma primero (evita que
// cualquier tercero con la URL pública de este endpoint pueda inyectar o
// desactivar usuarios). Ver middleware/auth.ts: esta ruta está en
// PUBLIC_ROUTES/"/api/webhooks(.*)" a propósito — no puede exigir sesión de
// Clerk (es Clerk quien la llama), la autenticación es la firma Svix, no una
// cookie de sesión.

import { NextResponse } from "next/server";
import { Webhook } from "svix";
import {
  deactivateUserFromClerkWebhook,
  provisionOrSyncUserFromClerk,
} from "@/services/auth";

interface ClerkEmailAddress {
  id: string;
  email_address: string;
  verification: { status: string } | null;
}

interface ClerkUserEventData {
  id: string;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
}

interface ClerkDeletedUserEventData {
  id: string;
  deleted?: boolean;
}

type ClerkWebhookEvent =
  | { type: "user.created" | "user.updated"; data: ClerkUserEventData }
  | { type: "user.deleted"; data: ClerkDeletedUserEventData }
  | { type: string; data: unknown };

/** Resuelve el email primario del payload de Clerk (nunca asume que el primer elemento del array lo es). */
function resolvePrimaryEmail(data: ClerkUserEventData): { email: string; verified: boolean } | null {
  const primary =
    data.email_addresses.find((address) => address.id === data.primary_email_address_id) ??
    data.email_addresses[0];
  if (!primary) return null;
  return {
    email: primary.email_address,
    verified: primary.verification?.status === "verified",
  };
}

export async function POST(request: Request): Promise<Response> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    // eslint-disable-next-line no-console -- sin logging estructurado todavía (fuera de alcance de este módulo)
    console.error("[clerk-webhook] CLERK_WEBHOOK_SECRET no configurado — se rechaza la petición.");
    return NextResponse.json({ error: "webhook not configured" }, { status: 500 });
  }

  // El body crudo (sin parsear) es obligatorio: la firma Svix es sensible a
  // cualquier cambio, incluso a un re-serializado JSON->JSON que preserve el
  // mismo contenido semántico (docs.svix.com/receiving/verifying-payloads).
  const payload = await request.text();
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "missing svix headers" }, { status: 400 });
  }

  let event: ClerkWebhookEvent;
  try {
    event = new Webhook(webhookSecret).verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    // Firma inválida: no se confía en el payload, se rechaza sin procesar.
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const data = event.data as ClerkUserEventData;
        const emailInfo = resolvePrimaryEmail(data);
        if (!emailInfo) {
          return NextResponse.json({ error: "no email on payload" }, { status: 400 });
        }
        await provisionOrSyncUserFromClerk({
          clerkUserId: data.id,
          email: emailInfo.email,
          firstName: data.first_name ?? "",
          lastName: data.last_name ?? "",
          avatarUrl: data.image_url ?? null,
          emailVerified: emailInfo.verified,
        });
        break;
      }
      case "user.deleted": {
        const data = event.data as ClerkDeletedUserEventData;
        await deactivateUserFromClerkWebhook(data.id);
        break;
      }
      default:
        // Evento no relevante para el Dashboard (p. ej. session.*,
        // organization.*) — se reconoce con 200 para que Clerk no reintente
        // indefinidamente un evento que este backend nunca va a procesar.
        break;
    }
  } catch (error) {
    // eslint-disable-next-line no-console -- sin logging estructurado todavía (fuera de alcance de este módulo)
    console.error("[clerk-webhook] error al procesar el evento", event.type, error);
    // 500 (no 400): el payload era válido y la firma correcta, el fallo es
    // nuestro (p. ej. base de datos no disponible) — Clerk debe reintentar.
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
