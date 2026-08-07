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

  // Sprint 10 (remediación S1, Destructive Testing Report v1): un `unitId`/
  // `attemptId` que existe pero pertenece a otro estudiante se trata como
  // `ResourceNotFoundException` (404), nunca como `ForbiddenException` (403)
  // — API Contract v1.4, Sección 11, catálogo de `404`: "recurso inexistente
  // o fuera del alcance del actor (nunca se distingue de 'no autorizado'
  // cuando la distinción revelaría información sensible)". El `403` de ese
  // mismo catálogo está reservado a "relación docente-estudiante no
  // establecida, rol insuficiente" (ver `assertTeacherRelationship`), no a
  // ownership simple de estudiante sobre su propio recurso. EP-01/EP-02
  // (Sección 4) ya documentaban explícitamente `404` para "no pertenece al
  // estudiante" — este cambio corrige una desviación del contrato ya
  // congelado, no introduce un contrato nuevo.
  public async assertUnitOwnership(unitId: string, studentId: string): Promise<AcademyUnit> {
    const unit = await this.academyUnitRepository.findById(AcademyUnitId.create(unitId));
    if (!unit || unit.studentId.value !== studentId) {
      throw new ResourceNotFoundException("ACADEMY_NOT_FOUND_UNIT", "AcademyUnit", unitId);
    }
    return unit;
  }

  public async assertAttemptOwnership(attemptId: string, studentId: string): Promise<Attempt> {
    const attempt = await this.attemptRepository.findById(AttemptId.create(attemptId));
    if (!attempt || attempt.studentId.value !== studentId) {
      throw new ResourceNotFoundException("ACADEMY_NOT_FOUND_ATTEMPT", "Attempt", attemptId);
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
