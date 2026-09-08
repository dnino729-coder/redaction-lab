import type { StudentProfileRepository } from "@/features/profile/domain/repositories/StudentProfileRepository";
import type { StudentProfile } from "@/features/profile/domain/entities/StudentProfile";
import type { StudentId } from "@/features/profile/domain/value-objects/StudentId";
import { withStudentContext } from "@/database/repositories/withStudentContext";
import { StudentProfilePersistenceMapper } from "../mappers/StudentProfilePersistenceMapper";
import { translatePrismaError } from "@/features/profile/infrastructure/exceptions/PrismaExceptionTranslator";

// Profile solo tiene esta única escritura (create, nunca upsert — ver
// auditoría: StudentProfile.userId es UNIQUE y no debe sobrescribirse
// silenciosamente) y una sola entidad — a diferencia de My Plan/
// Laboratory (varios Repositories que necesitan compartir una misma
// transacción vía UnitOfWork + AsyncLocalStorage), aquí no hace falta esa
// abstracción: cada método abre su propio contexto de estudiante
// (`withStudentContext`, RLS real bajo dashboard_app_role — la migración
// 202609081200 le concede exactamente el INSERT/UPDATE que necesita).
export class PrismaStudentProfileRepository implements StudentProfileRepository {
  public async findByStudentId(studentId: StudentId): Promise<StudentProfile | null> {
    const row = await withStudentContext(studentId.value, (tx) =>
      tx.studentProfile.findUnique({ where: { userId: studentId.value } }),
    );
    return row ? StudentProfilePersistenceMapper.toDomain(row) : null;
  }

  public async create(profile: StudentProfile): Promise<void> {
    const data = StudentProfilePersistenceMapper.toCreateData(profile);
    try {
      await withStudentContext(profile.studentId.value, (tx) => tx.studentProfile.create({ data }));
    } catch (error) {
      translatePrismaError(error, "StudentProfile", profile.id.value);
    }
  }
}
