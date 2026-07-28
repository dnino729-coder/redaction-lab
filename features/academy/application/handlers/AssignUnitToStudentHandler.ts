import type { AcademyUnitRepository } from "@/features/academy/domain/repositories/AcademyUnitRepository";
import type { TeacherRecommendationRepository } from "@/features/academy/domain/repositories/TeacherRecommendationRepository";
import { AcademyUnitId } from "@/features/academy/domain/value-objects/AcademyUnitId";
import { TeacherRecommendationId } from "@/features/academy/domain/value-objects/TeacherRecommendationId";
import { TeacherRecommendation } from "@/features/academy/domain/entities/TeacherRecommendation";

import type { AssignUnitToStudentCommand } from "../commands/AssignUnitToStudentCommand";
import type { TeacherRecommendationResponseDto } from "../dto/TeacherRecommendationDto";
import { TeacherRecommendationMapper } from "../mappers/TeacherRecommendationMapper";
import { validateAssignUnitToStudentRequest } from "../validators/teacherRecommendationValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import type { UuidGenerator } from "../ports/UuidGenerator";
import { AcademyAuthorizationGuard } from "../services/AcademyAuthorizationGuard";

// CMD-11 AssignUnitToStudent (recomendar) — "sin efecto de estado"
// (resolución ARB, ACP-002-A). **Sin Aggregate involucrado, sin
// UnitOfWork transaccional** (Application Layer Spec v1.0: "no hay
// Aggregate de dominio que proteger").
export class AssignUnitToStudentHandler {
  constructor(
    private readonly academyUnitRepository: AcademyUnitRepository,
    private readonly teacherRecommendationRepository: TeacherRecommendationRepository,
    private readonly uuidGenerator: UuidGenerator,
    private readonly authorizationGuard: AcademyAuthorizationGuard,
  ) {}

  public async handle(command: AssignUnitToStudentCommand): Promise<TeacherRecommendationResponseDto> {
    const { request } = command;
    validateAssignUnitToStudentRequest(request);
    await this.authorizationGuard.assertTeacherRelationship(request.teacherId, request.studentId);

    const unit = await this.academyUnitRepository.findById(AcademyUnitId.create(request.unitId));
    if (!unit) {
      throw new ResourceNotFoundException("ACADEMY_NOT_FOUND_UNIT", "AcademyUnit", request.unitId);
    }

    const recommendation = TeacherRecommendation.create({
      id: TeacherRecommendationId.create(this.uuidGenerator.generate()),
      unitId: request.unitId,
      studentId: request.studentId,
      teacherId: request.teacherId,
    });
    await this.teacherRecommendationRepository.create(recommendation);

    return TeacherRecommendationMapper.toDto(recommendation);
  }
}
