import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import type { LearningPlanRepository } from "@/features/my-plan/domain/repositories/LearningPlanRepository";

import type { GetDailyPlanQuery } from "../queries/GetDailyPlanQuery";
import type { DailyPlanReadModel } from "../dto/DailyPlanDto";
import { validateGetDailyPlanRequest } from "../validators/readModelQueryValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import type { DailyPlanReadPort } from "../ports/DailyPlanReadPort";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { Logger } from "../ports/Logger";

// Caso de uso: GetDailyPlan (Query, CQRS) — lee el plan activo del
// estudiante para resolver `learningPlanId` y delega en
// `DailyPlanReadPort` (ver justificación de ese puerto: `DailyPlan` no
// tiene Entity de dominio, resolución CQRS reportada en el informe de
// entrega). Desde la resolución 18.24, ambas lecturas (Repository y
// ReadPort) se envuelven en `UnitOfWork.execute(..., studentId)` para
// ejecutarse bajo el contexto de sesión del propio estudiante
// (`withStudentContext`) — `dashboard_app_role` ya tiene GRANT SELECT
// sobre `learning_plan` y `daily_plan`.
export class GetDailyPlanHandler {
  constructor(
    private readonly learningPlanRepository: LearningPlanRepository,
    private readonly dailyPlanReadPort: DailyPlanReadPort,
    private readonly unitOfWork: UnitOfWork,
    private readonly logger: Logger,
  ) {}

  public async handle(query: GetDailyPlanQuery): Promise<DailyPlanReadModel> {
    const { request } = query;
    validateGetDailyPlanRequest(request);

    const studentId = StudentId.create(request.studentId);

    const dailyPlan = await this.unitOfWork.execute(async () => {
      const plan = await this.learningPlanRepository.findActiveByStudentId(studentId);
      if (!plan) throw new ResourceNotFoundException("LearningPlan (activo)", studentId.value);

      const found = await this.dailyPlanReadPort.findByLearningPlanIdAndDate(
        plan.id.value,
        new Date(request.date),
      );
      if (!found) throw new ResourceNotFoundException("DailyPlan", request.date);
      return found;
    }, studentId.value);

    this.logger.debug("GetDailyPlan resuelto", { studentId: studentId.value, date: request.date });
    return dailyPlan;
  }
}
