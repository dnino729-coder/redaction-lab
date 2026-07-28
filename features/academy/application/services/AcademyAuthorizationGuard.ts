import type { AcademyUnitRepository } from "@/features/academy/domain/repositories/AcademyUnitRepository";
import type { AttemptRepository } from "@/features/academy/domain/repositories/AttemptRepository";
import type { AcademyUnit } from "@/features/academy/domain/aggregates/AcademyUnit";
import type { Attempt } from "@/features/academy/domain/aggregates/Attempt";
import { AcademyUnitId } from "@/features/academy/domain/value-objects/AcademyUnitId";
import { AttemptId } from "@/features/academy/domain/value-objects/AttemptId";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import { ForbiddenException } from "../exceptions/ForbiddenException";
import type { TeacherStudentRelationshipPort } from "../ports/TeacherStudentRelationshipPort";

// Servicio de aplicación — control de autorización (ownership /
// relación docente-estudiante), nunca una regla de negocio de dominio
// (mismo criterio que `OwnershipVerificationService` de Mi Plan).
export class AcademyAuthorizationGuard {
  constructor(
    private readonly academyUnitRepository: AcademyUnitRepository,
    private readonly attemptRepository: AttemptRepository,
    private readonly teacherStudentRelationshipPort: TeacherStudentRelationshipPort,
  ) {}

  public async assertUnitOwnership(unitId: string, studentId: string): Promise<AcademyUnit> {
    const unit = await this.academyUnitRepository.findById(AcademyUnitId.create(unitId));
    if (!unit) throw new ResourceNotFoundException("ACADEMY_NOT_FOUND_UNIT", "AcademyUnit", unitId);
    if (unit.studentId.value !== studentId) {
      throw new ForbiddenException(
        "ACADEMY_FORBIDDEN_NOT_OWNER",
        `El estudiante ${studentId} no es propietario de la unidad ${unitId}.`,
      );
    }
    return unit;
  }

  public async assertAttemptOwnership(attemptId: string, studentId: string): Promise<Attempt> {
    const attempt = await this.attemptRepository.findById(AttemptId.create(attemptId));
    if (!attempt) throw new ResourceNotFoundException("ACADEMY_NOT_FOUND_ATTEMPT", "Attempt", attemptId);
    if (attempt.studentId.value !== studentId) {
      throw new ForbiddenException(
        "ACADEMY_FORBIDDEN_NOT_OWNER",
        `El estudiante ${studentId} no es propietario del intento ${attemptId}.`,
      );
    }
    return attempt;
  }

  public async assertTeacherRelationship(teacherId: string, studentId: string): Promise<void> {
    const hasRelationship = await this.teacherStudentRelationshipPort.hasRelationship(
      teacherId,
      studentId,
    );
    if (!hasRelationship) {
      throw new ForbiddenException(
        "ACADEMY_FORBIDDEN_NO_TEACHER_RELATIONSHIP",
        `El profesor ${teacherId} no tiene relación docente con el estudiante ${studentId}.`,
      );
    }
  }
}
