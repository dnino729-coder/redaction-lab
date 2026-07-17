// Repositorio: Usuario / Perfil (13.1/13.2). Envuelve database/queries con
// una interfaz orientada a entidad; no contiene reglas de negocio ni
// llamadas a servicios externos — ver ARCHITECTURE.md, sección 2.1.

import {
  deactivateUserByClerkId,
  queryStudentIdByClerkId,
  queryUserWithProfile,
  upsertUserFromClerk,
  type ClerkUserSyncInput,
} from "@/database/queries/user";
import { withServiceContext, type StudentScopedClient } from "./withStudentContext";

/**
 * Resuelve el `studentId` interno a partir del `userId` de sesión de Clerk.
 * Debe llamarse antes de cualquier lectura con `withStudentContext` — ver
 * comentario en database/queries/user.ts sobre por qué usa
 * `withServiceContext` en vez de contexto de estudiante.
 */
export async function findStudentIdByClerkId(clerkUserId: string): Promise<string | null> {
  const user = await withServiceContext((tx) => queryStudentIdByClerkId(tx, clerkUserId));
  return user?.id ?? null;
}

export type { ClerkUserSyncInput };

/**
 * Aprovisiona o sincroniza (idempotente) un `User` a partir de un evento
 * `user.created`/`user.updated` de Clerk — ver database/queries/user.ts,
 * `upsertUserFromClerk`, para el detalle de por qué es un `upsert`.
 */
export async function saveUserFromClerk(data: ClerkUserSyncInput): Promise<{ studentId: string }> {
  const user = await withServiceContext((tx) => upsertUserFromClerk(tx, data));
  return { studentId: user.id };
}

/** Desactiva (soft delete) un `User` a partir de un evento `user.deleted` de Clerk. */
export async function deactivateUserFromClerk(clerkUserId: string): Promise<void> {
  await withServiceContext((tx) => deactivateUserByClerkId(tx, clerkUserId));
}

export interface StudentIdentitySummary {
  studentId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  language: string;
  currentLevel: string | null;
  targetLevel: string | null;
  lastLoginAt: Date | null;
  /// Ver prisma/schema.prisma, StudentProfile.targetExamDate (cierre de la
  /// omisión de 13.2 frente a 12.2).
  targetExamDate: Date | null;
}

export async function findStudentIdentity(
  tx: StudentScopedClient,
  studentId: string,
): Promise<StudentIdentitySummary | null> {
  const user = await queryUserWithProfile(tx, studentId);
  if (!user) return null;

  return {
    studentId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    language: user.language,
    currentLevel: user.studentProfile?.currentLevel ?? null,
    targetLevel: user.studentProfile?.targetLevel ?? null,
    lastLoginAt: user.lastLoginAt,
    targetExamDate: user.studentProfile?.targetExamDate ?? null,
  };
}
