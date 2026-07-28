import type { TeacherStudentRelationshipPort } from "@/features/academy/application/ports/TeacherStudentRelationshipPort";

// Implementación de `TeacherStudentRelationshipPort` (Application Layer,
// puerto ya Frozen, documentado como "mecanismo exacto: PENDIENTE DE
// DECISIÓN DE ARQUITECTURA (PND-04, delegado a Organización Académica,
// heredado, no resuelto por este Sprint)").
//
// Hallazgo de este Sprint (disclosed, no BLOCKER): el proyecto real no
// tiene, a la fecha de este Sprint, ningún módulo de "Organización
// Académica" (sin tabla de relación docente-estudiante, sin
// `TeacherProfile`, sin grupo/clase) — no existe ninguna fuente de datos
// real contra la cual verificar esta relación.
//
// Resolución: adaptador fail-closed explícito — deniega toda relación
// (`false`) en vez de fabricar una fuente de datos inexistente o asumir
// `true` (lo que abriría un acceso de Profesor sin ninguna verificación
// real). Esto hace que EP-07/EP-08/EP-20/EP-23 respondan siempre `403`
// hasta que el módulo de Organización Académica exista y se sustituya este
// adaptador — comportamiento honesto dado el estado real del proyecto, no
// una simulación de éxito. Ver informe de entrega, Sección 5.
export class TeacherStudentRelationshipAdapter implements TeacherStudentRelationshipPort {
  public async hasRelationship(_teacherId: string, _studentId: string): Promise<boolean> {
    return false;
  }
}
