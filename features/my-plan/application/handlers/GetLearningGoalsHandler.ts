import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import { LearningGoalStatus } from "@/features/my-plan/domain/enums/LearningGoalStatus";
import type { LearningGoal } from "@/features/my-plan/domain/entities/LearningGoal";
import type { LearningPlanRepository } from "@/features/my-plan/domain/repositories/LearningPlanRepository";
import type { LearningGoalRepository } from "@/features/my-plan/domain/repositories/LearningGoalRepository";

import type { GetLearningGoalsQuery } from "../queries/GetLearningGoalsQuery";
import type { LearningGoalSummaryDto, LearningGoalsReadModel } from "../dto/LearningGoalDto";
import { validateGetLearningGoalsRequest } from "../validators/readModelQueryValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { Logger } from "../ports/Logger";

// Caso de uso: GetLearningGoals (Query, CQRS) — igual que GetStudySchedule,
// `LearningGoal` sí tiene Entity y Repository de dominio (Sprint 3.3.2),
// así que esta consulta lee directamente el modelo de escritura vía
// `LearningGoalRepository.findByLearningPlanId`, sin necesitar un puerto de
// lectura dedicado (a diferencia de DailyPlan/WeeklyPlan/LearningProgress).
// Envuelto en `UnitOfWork.execute(..., studentId)` para leer bajo
// `withStudentContext` (RLS real) — mismo patrón que el resto de los 5
// Handlers de consulta ya existentes (resolución 18.24).
//
// Ownership: el `learningPlanId` NUNCA lo decide el cliente — se resuelve
// aquí, server-side, a partir del `studentId` autenticado (resuelto por
// resolveMyPlanActor() en la capa API) vía
// `LearningPlanRepository.findActiveByStudentId`. Un estudiante A no puede
// pedir los goals de otro plan: no existe ningún parámetro de entrada que
// acepte un `learningPlanId` externo.
//
// Clasificación active/completed (ver auditoría, sección 6): `COMPLETED`
// → completed; `NOT_STARTED`/`IN_PROGRESS` → active; `CANCELLED` se
// excluye de ambos grupos — mismo criterio que
// `AutoCompletionStatusCalculator` ya aplica en el dominio ("las hijas en
// CANCELLED se excluyen del cálculo"): un goal cancelado no es "activo"
// (no hay trabajo en curso) ni "completado" (no se logró), así que
// mostrarlo en cualquiera de las dos listas induciría a error. Hoy esto
// es un caso teórico — no existe ningún productor que cancele un
// LearningGoal — pero se documenta explícitamente para no dejarlo como
// comportamiento implícito.
export class GetLearningGoalsHandler {
  constructor(
    private readonly learningPlanRepository: LearningPlanRepository,
    private readonly learningGoalRepository: LearningGoalRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly logger: Logger,
  ) {}

  public async handle(query: GetLearningGoalsQuery): Promise<LearningGoalsReadModel> {
    const { request } = query;
    validateGetLearningGoalsRequest(request);

    const studentId = StudentId.create(request.studentId);

    const goals = await this.unitOfWork.execute(async () => {
      const plan = await this.learningPlanRepository.findActiveByStudentId(studentId);
      if (!plan) throw new ResourceNotFoundException("LearningPlan (activo)", studentId.value);

      return this.learningGoalRepository.findByLearningPlanId(plan.id);
    }, studentId.value);

    this.logger.debug("GetLearningGoals resuelto", {
      studentId: studentId.value,
      count: goals.length,
    });
    return GetLearningGoalsHandler.toReadModel(goals);
  }

  private static toReadModel(goals: readonly LearningGoal[]): LearningGoalsReadModel {
    const active: LearningGoalSummaryDto[] = [];
    const completed: LearningGoalSummaryDto[] = [];

    for (const goal of goals) {
      const summary: LearningGoalSummaryDto = {
        id: goal.id.value,
        title: goal.title,
        priority: goal.priority,
        status: goal.status,
      };

      if (goal.status === LearningGoalStatus.COMPLETED) {
        completed.push(summary);
      } else if (goal.status !== LearningGoalStatus.CANCELLED) {
        active.push(summary);
      }
      // CANCELLED: excluido deliberadamente de ambos grupos (ver comentario de clase).
    }

    return { active, completed };
  }
}
