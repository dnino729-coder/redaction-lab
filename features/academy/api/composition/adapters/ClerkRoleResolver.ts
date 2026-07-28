// Resolución de rol (STUDENT/TEACHER/ADMIN) para la API de Academia.
//
// Hallazgo de este Sprint (disclosed, no BLOCKER): ningún documento Frozen
// ni el `schema.prisma` real definen una columna `role` en `User`, ni existe
// una tabla `TeacherProfile`/`Role` en el proyecto — `services/auth` (Sprint
// 3.x/Dashboard) solo resuelve `studentId`, nunca un rol. El API Contract
// v1.3, Sección 7, asume "se reutiliza exactamente el catálogo de roles ya
// reconocido... Academia no define scopes propios" — pero ese catálogo no
// existe todavía en ningún lugar del código real.
//
// Resolución de este Sprint (Presentation/API, sin tocar Domain/Application/
// Infrastructure/Prisma): el rol se lee de `sessionClaims` de Clerk
// (`publicMetadata.role`/`metadata.role`, mecanismo ya vigente de Clerk para
// claims arbitrarios, sin migración ni tabla nueva) — si el claim está
// ausente o no es uno de los tres valores reconocidos, se resuelve `null`
// (fail-closed: nunca se asume `STUDENT` por defecto para una operación de
// Profesor/Administrador). Mismo criterio de "PENDIENTE DE DECISIÓN DE
// ARQUITECTURA" ya aplicado por el propio Application Model a
// `TeacherStudentRelationshipPort` (PND-04).
export type AcademyRole = "STUDENT" | "TEACHER" | "ADMIN";

const RECOGNIZED_ROLES: readonly AcademyRole[] = ["STUDENT", "TEACHER", "ADMIN"];

export function resolveAcademyRoleFromClaims(sessionClaims: unknown): AcademyRole | null {
  if (typeof sessionClaims !== "object" || sessionClaims === null) return null;
  const claims = sessionClaims as Record<string, unknown>;

  const direct = claims["role"];
  if (typeof direct === "string" && RECOGNIZED_ROLES.includes(direct as AcademyRole)) {
    return direct as AcademyRole;
  }

  const metadata = claims["metadata"];
  if (typeof metadata === "object" && metadata !== null) {
    const metadataRole = (metadata as Record<string, unknown>)["role"];
    if (typeof metadataRole === "string" && RECOGNIZED_ROLES.includes(metadataRole as AcademyRole)) {
      return metadataRole as AcademyRole;
    }
  }

  const publicMetadata = claims["publicMetadata"];
  if (typeof publicMetadata === "object" && publicMetadata !== null) {
    const publicRole = (publicMetadata as Record<string, unknown>)["role"];
    if (typeof publicRole === "string" && RECOGNIZED_ROLES.includes(publicRole as AcademyRole)) {
      return publicRole as AcademyRole;
    }
  }

  return null;
}
