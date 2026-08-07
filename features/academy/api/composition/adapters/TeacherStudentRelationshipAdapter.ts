import type { TeacherStudentRelationshipPort } from "@/features/academy/application/ports/TeacherStudentRelationshipPort";
import { isTeacherStudentDemoWhitelisted } from "./TeacherStudentDemoWhitelist";

// Implementación de `TeacherStudentRelationshipPort` (Application Layer,
// puerto ya Frozen, documentado como "mecanismo exacto: PENDIENTE DE
// DECISIÓN DE ARQUITECTURA (PND-04, delegado a Organización Académica,
// heredado, no resuelto por este Sprint)").
//
// Hallazgo original (disclosed, no BLOCKER): el proyecto real no tiene,
// a la fecha de ese Sprint, ningún módulo de "Organización Académica" (sin
// tabla de relación docente-estudiante, sin `TeacherProfile`, sin
// grupo/clase) — no existe ninguna fuente de datos real contra la cual
// verificar esta relación.
//
// Resolución original: adaptador fail-closed explícito — deniega toda
// relación (`false`) en vez de fabricar una fuente de datos inexistente o
// asumir `true` (lo que abriría un acceso de Profesor sin ninguna
// verificación real). Esto hacía que EP-07/EP-08/EP-20/EP-23 respondieran
// siempre `403` hasta que el módulo de Organización Académica existiera y
// sustituyera este adaptador.
//
// Sprint 1C (MVP de noviembre 2026) — actualización explícitamente
// temporal: delega en `isTeacherStudentDemoWhitelisted`, que solo autoriza
// los pares (teacherId, studentId) enumerados manualmente en
// `ACADEMY_DEMO_TEACHER_STUDENT_PAIRS` — vacía por defecto, con lo cual el
// comportamiento sigue siendo idéntico al original (fail-closed) mientras
// esa variable no se configure explícitamente. No se implementa aquí
// ninguna versión reducida de Organización Académica ni se introduce
// ninguna entidad/tabla nueva (Product Architecture v1.0 §9, punto 5:
// "ninguna entidad de Organización Académica debe residir dentro de
// features/academy" — se respeta). Ver
// `TeacherStudentDemoWhitelist.ts` para el detalle completo, incluidas las
// instrucciones de reversión tras el MVP.
export class TeacherStudentRelationshipAdapter implements TeacherStudentRelationshipPort {
  public async hasRelationship(teacherId: string, studentId: string): Promise<boolean> {
    return isTeacherStudentDemoWhitelisted(teacherId, studentId);
  }
}
