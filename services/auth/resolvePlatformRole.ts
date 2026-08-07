// Resolución de rol de plataforma (STUDENT/TEACHER/ADMIN) a partir de los
// `sessionClaims` de Clerk — únicamente para decidir el destino del
// redirect post-login en `app/[locale]/page.tsx` (Sprint 2, "cerrar el
// recorrido Login → Dashboard"). No es una fuente de autorización: cada
// pantalla/endpoint sigue verificando el rol por su cuenta (mismo criterio
// ya establecido por `features/academy/api/composition/adapters/
// ClerkRoleResolver.ts`, del que este archivo replica deliberadamente el
// mismo orden de precedencia de claims) — `app/` no puede importar nada de
// `features/academy` salvo `features/academy/pages` (`import/no-restricted-
// paths`), por lo que esta pequeña duplicación, acotada a un único uso de
// enrutamiento, es preferible a violar esa regla o a invertir la
// dependencia de `services/` hacia una feature concreta.
export type PlatformRole = "STUDENT" | "TEACHER" | "ADMIN";

const RECOGNIZED_ROLES: readonly PlatformRole[] = ["STUDENT", "TEACHER", "ADMIN"];

export function resolvePlatformRoleFromClaims(sessionClaims: unknown): PlatformRole | null {
  if (typeof sessionClaims !== "object" || sessionClaims === null) return null;
  const claims = sessionClaims as Record<string, unknown>;

  const direct = claims["role"];
  if (typeof direct === "string" && RECOGNIZED_ROLES.includes(direct as PlatformRole)) {
    return direct as PlatformRole;
  }

  const metadata = claims["metadata"];
  if (typeof metadata === "object" && metadata !== null) {
    const metadataRole = (metadata as Record<string, unknown>)["role"];
    if (typeof metadataRole === "string" && RECOGNIZED_ROLES.includes(metadataRole as PlatformRole)) {
      return metadataRole as PlatformRole;
    }
  }

  const publicMetadata = claims["publicMetadata"];
  if (typeof publicMetadata === "object" && publicMetadata !== null) {
    const publicRole = (publicMetadata as Record<string, unknown>)["role"];
    if (typeof publicRole === "string" && RECOGNIZED_ROLES.includes(publicRole as PlatformRole)) {
      return publicRole as PlatformRole;
    }
  }

  return null;
}

/** Ruta de aterrizaje tras autenticarse, según el rol resuelto. `STUDENT` y
 * cualquier rol ausente/no reconocido aterrizan en `/dashboard` (vista sin
 * ninguna operación privilegiada) — nunca se asume `TEACHER`/`ADMIN` por
 * defecto, mismo criterio fail-closed ya aplicado en `ClerkRoleResolver.ts`. */
export function resolvePostAuthRedirectPath(sessionClaims: unknown): string {
  const role = resolvePlatformRoleFromClaims(sessionClaims);
  if (role === "TEACHER") return "/academy/teacher";
  if (role === "ADMIN") return "/academy/admin/model-examples";
  return "/dashboard";
}
