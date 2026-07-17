// Servicio: auth — Autenticación (Clerk — resolución 18.1, sección 12).
// "Los servicios nunca dependerán de componentes visuales" (sección 5.4).
//
// Expone la resolución de identidad Clerk → `studentId` interno (UUID),
// puente necesario para toda lectura con Row Level Security (5.5) — ver
// prisma/schema.prisma, `User.clerkUserId`, y database/repositories/userRepository.ts.
// Es el único punto donde `@clerk/nextjs/server` se combina con Prisma;
// cualquier módulo que necesite el `studentId` autenticado debe pasar por
// aquí, nunca reimplementar esta resolución.

import { auth } from "@clerk/nextjs/server";
import { findStudentIdByClerkId } from "@/database/repositories";

export {
  provisionOrSyncUserFromClerk,
  deactivateUserFromClerkWebhook,
  clerkUserSyncSchema,
  type ClerkUserSyncPayload,
} from "./clerkProvisioning";

export class UnauthenticatedError extends Error {
  constructor() {
    super("No hay sesión activa (middleware.ts debería haber bloqueado esta ruta).");
    this.name = "UnauthenticatedError";
  }
}

export class StudentProfileNotFoundError extends Error {
  constructor() {
    super("No existe un perfil de estudiante asociado a esta sesión de Clerk.");
    this.name = "StudentProfileNotFoundError";
  }
}

/** Devuelve el `studentId` interno o `null` si no hay sesión / perfil. */
export async function getAuthenticatedStudentId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;
  return findStudentIdByClerkId(userId);
}

/** Igual que `getAuthenticatedStudentId`, pero lanza si falta sesión o perfil. */
export async function requireAuthenticatedStudentId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new UnauthenticatedError();

  const studentId = await findStudentIdByClerkId(userId);
  if (!studentId) throw new StudentProfileNotFoundError();

  return studentId;
}
