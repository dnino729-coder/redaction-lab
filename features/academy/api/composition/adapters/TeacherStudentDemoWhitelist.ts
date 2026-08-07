// Whitelist temporal de demo — Sprint 1C, MVP de noviembre 2026.
//
// Resuelve, de forma explícitamente temporal y acotada, el bloqueador
// PND-04 (`TeacherStudentRelationshipAdapter.hasRelationship()` fail-closed)
// sin esperar la implementación real de Organización Académica —Bounded
// Context nuevo, ya diseñado y `FROZEN` a nivel de documentación
// (`docs/platform/organization-management-*`, `product-architecture-v1.0`
// §6-9), pero sin ningún código implementado todavía (sin `features/`, sin
// migración Prisma) — un esfuerzo de varias semanas, fuera de alcance de
// este Sprint.
//
// Alcance deliberadamente mínimo, elegido explícitamente para no reabrir la
// misma clase de vulnerabilidad IDOR/BOLA (OWASP API1:2023) ya confirmada
// una vez como BLOCKER en este proyecto para el rol STUDENT (ver
// `ACA-001-Report.md`/`ACA-002-Report.md`, hallazgo H-01): en vez de un
// booleano universal ("cualquier Profesor ve a cualquier Estudiante"), solo
// autoriza los pares (teacherId, studentId) explícitamente enumerados en la
// variable de entorno `ACADEMY_DEMO_TEACHER_STUDENT_PAIRS` — vacía por
// defecto, mismo comportamiento fail-closed de hoy si no se configura.
//
// Formato de la variable: "teacherId1:studentId1,teacherId1:studentId2".
// Los IDs son los `userId` reales de Clerk de las cuentas de demo — nunca
// datos inventados ni un patrón que acepte comodines.
//
// CÓMO ELIMINAR ESTA SOLUCIÓN DESPUÉS DEL MVP (documentado también en el
// Sprint 1C Report):
// 1. Borrar este archivo.
// 2. Borrar el import y el uso de `isTeacherStudentDemoWhitelisted` en
//    `TeacherStudentRelationshipAdapter.ts`, revirtiendo `hasRelationship`
//    a `return false` (su estado original).
// 3. Borrar `ACADEMY_DEMO_TEACHER_STUDENT_PAIRS` de cualquier entorno
//    donde se haya configurado (`.env.local`, Vercel, etc.) y de
//    `.env.example`.
export function isTeacherStudentDemoWhitelisted(
  teacherId: string,
  studentId: string,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const raw = env.ACADEMY_DEMO_TEACHER_STUDENT_PAIRS;
  if (!raw) return false;

  return raw
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .some((pair) => pair === `${teacherId}:${studentId}`);
}
