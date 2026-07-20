import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import type { LearningPlanRepository } from "@/features/my-plan/domain/repositories/LearningPlanRepository";

import type { GetActiveLearningPlanQuery } from "../queries/GetActiveLearningPlanQuery";
import type { LearningPlanResponseDto } from "../dto/LearningPlanDto";
import { LearningPlanMapper } from "../mappers/LearningPlanMapper";
import { validateGetActiveLearningPlanRequest } from "../validators/learningPlanValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { Logger } from "../ports/Logger";

// Caso de uso: GetActiveLearningPlan (Query, CQRS) — 13.4 MUST: "un
// estudiante puede tener múltiples planes, pero solo un plan activo".
// Lectura pura: no hay escritura que envolver, pero desde la resolución
// 18.24 sí se envuelve en `UnitOfWork.execute(..., studentId)` para que
// Infrastructure pueda ejecutar la lectura bajo el contexto de sesión
// del propio estudiante (`withStudentContext`, RLS real) en vez del rol
// de servicio — `dashboard_app_role` ya tiene GRANT SELECT sobre
// `learning_plan` desde la migración de RLS del Dashboard.
export class GetActiveLearningPlanHandler {
  constructor(
    private readonly learningPlanRepository: LearningPlanRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly logger: Logger,
  ) {}

  public async handle(query: GetActiveLearningPlanQuery): Promise<LearningPlanResponseDto> {
    const { request } = query;
    validateGetActiveLearningPlanRequest(request);

    const studentId = StudentId.create(request.studentId);

    const plan = await this.unitOfWork.execute(async () => {
      const found = await this.learningPlanRepository.findActiveByStudentId(studentId);
      if (!found) throw new ResourceNotFoundException("LearningPlan (activo)", studentId.value);
      return found;
    }, studentId.value);

    this.logger.debug("GetActiveLearningPlan resuelto", { studentId: studentId.value });
    return LearningPlanMapper.toResponseDto(plan);
  }
}
