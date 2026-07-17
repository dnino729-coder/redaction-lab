// Consultas Prisma reutilizables — Usuario y Perfil (13.1/13.2). Ver el
// límite exacto entre /prisma, database/ y services/database en
// ARCHITECTURE.md, sección 2.1. Sin reglas de negocio: solo acceso a datos.

import type { StudentScopedClient } from "@/database/repositories/withStudentContext";

export function queryUserWithProfile(tx: StudentScopedClient, studentId: string) {
  return tx.user.findUnique({
    where: { id: studentId },
    include: { studentProfile: true },
  });
}

/**
 * Resuelve el `id` interno (UUID) a partir del `userId` de Clerk — el paso
 * de "arranque" de sesión: todavía no conocemos el `studentId` interno, por
 * lo que `withStudentContext` (que exige ese mismo id para fijar el contexto
 * RLS) no puede usarse aquí. Se ejecuta bajo `withServiceContext`
 * (BYPASSRLS) en vez de exponer una política RLS permisiva sobre `user` —
 * ver database/repositories/userRepository.ts. El valor de `clerkUserId`
 * siempre proviene del servidor (sesión de Clerk ya verificada, nunca de
 * input de usuario sin validar), así que esta única excepción no expone
 * datos de otro estudiante en la práctica (12.3/12.4).
 */
export function queryStudentIdByClerkId(tx: StudentScopedClient, clerkUserId: string) {
  return tx.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });
}

/**
 * Datos de identidad sincronizados desde el webhook de Clerk (12.3/12.4).
 * Cierra el hallazgo crítico de la auditoría de producción: sin este flujo,
 * ningún estudiante real llegaba a tener `User.clerkUserId` poblado y el
 * Dashboard era inalcanzable de extremo a extremo. Se ejecuta bajo
 * `withServiceContext` (BYPASSRLS) como `queryStudentIdByClerkId`, por el
 * mismo motivo: el `studentId` interno todavía no existe o no se conoce en
 * el momento en que llega el evento del webhook.
 */
export interface ClerkUserSyncInput {
  clerkUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  emailVerified: boolean;
}

/**
 * `upsert` por `clerkUserId` (no `create`): los webhooks de Clerk (como
 * cualquier webhook basado en Svix) tienen entrega "at-least-once" — el
 * mismo evento `user.created` puede llegar más de una vez. Un `create` puro
 * fallaría por violación de unicidad en la segunda entrega; el `upsert` hace
 * el aprovisionamiento idempotente frente a reintentos, y también
 * autorepara el caso en que `user.updated` llegue antes de que
 * `user.created` haya sido procesado (orden de entrega no garantizado).
 */
export function upsertUserFromClerk(tx: StudentScopedClient, data: ClerkUserSyncInput) {
  return tx.user.upsert({
    where: { clerkUserId: data.clerkUserId },
    // `status` no se fija aquí a propósito: el esquema ya define
    // `@default(PENDING)` (13.1) y la transición PENDING→ACTIVE es una regla
    // de negocio del futuro módulo de Autenticación/Onboarding
    // (02_authentication), no de este puente de identidad — decidirla aquí
    // sería inventar una regla de producto no especificada, fuera del
    // alcance de esta corrección (solo bloqueantes de auth/RLS).
    create: {
      clerkUserId: data.clerkUserId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      avatarUrl: data.avatarUrl,
      emailVerified: data.emailVerified,
    },
    update: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      avatarUrl: data.avatarUrl,
      emailVerified: data.emailVerified,
    },
  });
}

/**
 * Desactivación por eliminación en Clerk (`user.deleted`). `updateMany` en
 * vez de `update`: no lanza si la fila no existe todavía (p. ej. la cuenta
 * se creó y se borró en Clerk antes de que este backend procesara el
 * `user.created`), evitando que un reintento de Clerk falle indefinidamente
 * por una condición de carrera legítima. No es un borrado físico (13.12,
 * Soft Delete: `deletedAt`) — preserva las filas hijas ya existentes
 * (entregas, intentos de examen, etc.) para trazabilidad.
 */
export function deactivateUserByClerkId(tx: StudentScopedClient, clerkUserId: string) {
  return tx.user.updateMany({
    where: { clerkUserId },
    data: { status: "INACTIVE", deletedAt: new Date() },
  });
}
