// Servicio: auth — aprovisionamiento de identidad desde el webhook de Clerk
// (12.3/12.4). "Los servicios nunca dependerán de componentes visuales"
// (sección 5.4).
//
// Cierra el hallazgo crítico de la auditoría de producción: sin este
// servicio, app/api/webhooks/clerk/route.ts era un stub (501) y ningún
// estudiante real llegaba a tener `User.clerkUserId` poblado — el Dashboard
// (services/auth/index.ts, requireAuthenticatedStudentId) era inalcanzable
// de extremo a extremo para cualquier cuenta nueva.
//
// Validación con Zod en el borde del sistema (sección 5.2): el payload del
// webhook es input no confiable (aunque la firma ya se verificó en la
// Route Handler antes de llegar aquí — ver app/api/webhooks/clerk/route.ts).

import { z } from "zod";
import { deactivateUserFromClerk, saveUserFromClerk } from "@/database/repositories";

export const clerkUserSyncSchema = z.object({
  clerkUserId: z.string().min(1),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  avatarUrl: z.string().url().nullable(),
  emailVerified: z.boolean(),
});
export type ClerkUserSyncPayload = z.infer<typeof clerkUserSyncSchema>;

/**
 * Aprovisiona (evento `user.created`) o sincroniza (`user.updated`) un
 * `User` a partir del payload ya verificado del webhook de Clerk. Idempotente
 * — ver database/queries/user.ts, `upsertUserFromClerk`.
 */
export async function provisionOrSyncUserFromClerk(payload: ClerkUserSyncPayload): Promise<void> {
  const data = clerkUserSyncSchema.parse(payload);
  await saveUserFromClerk(data);
}

/** Desactiva (soft delete) un `User` a partir del evento `user.deleted` de Clerk. */
export async function deactivateUserFromClerkWebhook(clerkUserId: string): Promise<void> {
  await deactivateUserFromClerk(clerkUserId);
}
