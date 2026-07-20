import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import type { LearningPlanRepository } from "@/features/my-plan/domain/repositories/LearningPlanRepository";
import type { StudyScheduleRepository } from "@/features/my-plan/domain/repositories/StudyScheduleRepository";

import type { GetStudyScheduleQuery } from "../queries/GetStudyScheduleQuery";
import type { StudyScheduleResponseDto } from "../dto/StudyScheduleDto";
import { StudyScheduleMapper } from "../mappers/StudyScheduleMapper";
import { validateGetStudyScheduleRequest } from "../validators/studyScheduleSessionValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { Logger } from "../ports/Logger";

// Caso de uso: GetStudySchedule (Query, CQRS) — a diferencia de
// DailyPlan/WeeklyPlan/LearningProgress, `StudySchedule` sí tiene Entity
// y Repository de dominio (Sprint 3.3.2) — esta consulta pasa por el
// modelo de escritura normalmente, sin necesitar un puerto de lectura
// dedicado. Envuelto en `UnitOfWork.execute(..., studentId)` desde la
// resolución 18.24.
export class GetStudyScheduleHandler {
  constructor(
    private readonly learningPlanRepository: LearningPlanRepository,
    private readonly studyScheduleRepository: StudyScheduleRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly logger: Logger,
  ) {}

  public async handle(query: GetStudyScheduleQuery): Promise<StudyScheduleResponseDto> {
    const { request } = query;
    validateGetStudyScheduleRequest(request);

    const studentId = StudentId.create(request.studentId);

    const schedule = await this.unitOfWork.execute(async () => {
      const plan = await this.learningPlanRepository.findActiveByStudentId(studentId);
      if (!plan) throw new ResourceNotFoundException("LearningPlan (activo)", studentId.value);

      const found = await this.studyScheduleRepository.findByLearningPlanId(plan.id);
      if (!found) throw new ResourceNotFoundException("StudySchedule", plan.id.value);
      return found;
    }, studentId.value);

    this.logger.debug("GetStudySchedule resuelto", { studentId: studentId.value });
    return StudyScheduleMapper.toResponseDto(schedule);
  }
}
