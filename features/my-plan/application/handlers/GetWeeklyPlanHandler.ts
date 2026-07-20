import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import type { LearningPlanRepository } from "@/features/my-plan/domain/repositories/LearningPlanRepository";

import type { GetWeeklyPlanQuery } from "../queries/GetWeeklyPlanQuery";
import type { WeeklyPlanReadModel } from "../dto/WeeklyPlanDto";
import { validateGetWeeklyPlanRequest } from "../validators/readModelQueryValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import type { WeeklyPlanReadPort } from "../ports/WeeklyPlanReadPort";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { Logger } from "../ports/Logger";

// Caso de uso: GetWeeklyPlan (Query, CQRS) — misma resolución de
// GetDailyPlanHandler, aplicada a `WeeklyPlan`. Envuelto en
// `UnitOfWork.execute(..., studentId)` desde la resolución 18.24.
export class GetWeeklyPlanHandler {
  constructor(
    private readonly learningPlanRepository: LearningPlanRepository,
    private readonly weeklyPlanReadPort: WeeklyPlanReadPort,
    private readonly unitOfWork: UnitOfWork,
    private readonly logger: Logger,
  ) {}

  public async handle(query: GetWeeklyPlanQuery): Promise<WeeklyPlanReadModel> {
    const { request } = query;
    validateGetWeeklyPlanRequest(request);

    const studentId = StudentId.create(request.studentId);

    const weeklyPlan = await this.unitOfWork.execute(async () => {
      const plan = await this.learningPlanRepository.findActiveByStudentId(studentId);
      if (!plan) throw new ResourceNotFoundException("LearningPlan (activo)", studentId.value);

      const found = await this.weeklyPlanReadPort.findByLearningPlanIdAndWeekNumber(
        plan.id.value,
        request.weekNumber,
      );
      if (!found) throw new ResourceNotFoundException("WeeklyPlan", String(request.weekNumber));
      return found;
    }, studentId.value);

    this.logger.debug("GetWeeklyPlan resuelto", { studentId: studentId.value, weekNumber: request.weekNumber });
    return weeklyPlan;
  }
}
