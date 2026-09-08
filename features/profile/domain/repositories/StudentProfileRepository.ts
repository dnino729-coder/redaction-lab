import type { StudentProfile } from "../entities/StudentProfile";
import type { StudentId } from "../value-objects/StudentId";

export interface StudentProfileRepository {
  findByStudentId(studentId: StudentId): Promise<StudentProfile | null>;
  /** Solo alta inicial — nunca `upsert` (StudentProfile.userId es UNIQUE;
   * el caso de uso ya verifica no-existencia antes de llamar a esto). */
  create(profile: StudentProfile): Promise<void>;
}
