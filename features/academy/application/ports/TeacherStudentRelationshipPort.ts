// Puerto — verifica la relación docente-estudiante (Application Layer
// Spec v1.0, CMD-10/CMD-11). Mecanismo exacto: PENDIENTE DE DECISIÓN DE
// ARQUITECTURA (PND-04, delegado a Organización Académica, heredado, no
// resuelto por este Sprint).
export interface TeacherStudentRelationshipPort {
  hasRelationship(teacherId: string, studentId: string): Promise<boolean>;
}
