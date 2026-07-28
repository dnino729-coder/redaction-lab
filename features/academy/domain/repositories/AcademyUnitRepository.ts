import { AcademyUnit } from "../aggregates/AcademyUnit";
import { AcademyUnitId } from "../value-objects/AcademyUnitId";
import { StudentId } from "../value-objects/StudentId";
import { TextType } from "../enums/TextType";

// Puerto de repositorio (Domain Model v1.1 / Persistence Layer v1.0 §2) —
// implementado por PrismaAcademyUnitRepository en infraestructura.
export interface AcademyUnitRepository {
  findById(id: AcademyUnitId): Promise<AcademyUnit | null>;
  findAllByStudentId(studentId: StudentId): Promise<AcademyUnit[]>;
  findByStudentTextTypeAndPosition(
    studentId: StudentId,
    textType: TextType,
    position: number,
  ): Promise<AcademyUnit | null>;
  save(unit: AcademyUnit): Promise<void>;
}
