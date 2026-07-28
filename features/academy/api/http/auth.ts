import { auth } from "@clerk/nextjs/server";
import { findStudentIdByClerkId } from "@/database/repositories";
import { UnauthorizedException } from "@/features/academy/application/exceptions/UnauthorizedException";
import { ForbiddenException } from "@/features/academy/application/exceptions/ForbiddenException";
import { resolveAcademyRoleFromClaims, type AcademyRole } from "../composition/adapters";
import type { AcademyActor } from "./types";

// Resolución de identidad — reutiliza EXACTAMENTE el mismo puente Clerk →
// `studentId` interno ya construido por `services/auth`
// (`findStudentIdByClerkId`), nunca reimplementado (mismo criterio que
// `requireAuthenticatedStudentId`, `services/auth/index.ts`). El middleware
// raíz (`middleware.ts`) ya exige sesión Clerk válida antes de que
// cualquier Route Handler de `/api/v1/academy/*` se ejecute — esta función
// solo traduce esa sesión ya verificada a un `AcademyActor` con rol.
//
// Ver `features/academy/api/composition/adapters/ClerkRoleResolver.ts`
// (Nota de hallazgo) para la resolución de rol: ausencia de claim de rol
// se trata como `STUDENT` (comportamiento ya vigente en el resto de la
// plataforma, donde nunca existió otro rol) — NUNCA como `TEACHER`/`ADMIN`
// por defecto, para no escalar privilegios silenciosamente.
export async function resolveAcademyActor(): Promise<AcademyActor> {
  const { userId: clerkUserId, sessionClaims } = await auth();
  if (!clerkUserId) {
    throw new UnauthorizedException(
      "ACADEMY_UNAUTHORIZED_NO_SESSION",
      "No hay sesión Clerk activa (middleware.ts debería haber bloqueado esta ruta).",
    );
  }

  const internalUserId = await findStudentIdByClerkId(clerkUserId);
  if (!internalUserId) {
    throw new UnauthorizedException(
      "ACADEMY_UNAUTHORIZED_NO_PROFILE",
      "No existe un perfil interno asociado a esta sesión de Clerk.",
    );
  }

  const resolvedRole = resolveAcademyRoleFromClaims(sessionClaims);
  return { userId: internalUserId, role: resolvedRole ?? "STUDENT" };
}

/** 403 si el actor no tiene exactamente uno de los roles permitidos —
 * nunca asume un rol elevado por ausencia de dato (ver nota de arriba). */
export function requireRole(actor: AcademyActor, allowed: readonly AcademyRole[]): void {
  if (!allowed.includes(actor.role)) {
    throw new ForbiddenException(
      "ACADEMY_FORBIDDEN_ROLE",
      `Rol '${actor.role}' no autorizado para esta operación (requiere uno de: ${allowed.join(", ")}).`,
    );
  }
}
