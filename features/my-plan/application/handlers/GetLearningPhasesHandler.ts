import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import type { LearningPhase } from "@/features/my-plan/domain/entities/LearningPhase";
import type { LearningTask } from "@/features/my-plan/domain/entities/LearningTask";
import type { LearningPlanRepository } from "@/features/my-plan/domain/repositories/LearningPlanRepository";
import type { LearningPhaseRepository } from "@/features/my-plan/domain/repositories/LearningPhaseRepository";
import type { LearningTaskRepository } from "@/features/my-plan/domain/repositories/LearningTaskRepository";

import type { GetLearningPhasesQuery } from "../queries/GetLearningPhasesQuery";
import type {
  LearningPhaseSummaryDto,
  LearningPhasesReadModel,
  LearningTaskSummaryDto,
} from "../dto/LearningPhaseDto";
import { validateGetLearningPhasesRequest } from "../validators/readModelQueryValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { Logger } from "../ports/Logger";

// Caso de uso: GetLearningPhases (Query, CQRS) — mismo patrón que
// GetLearningGoalsHandler/GetStudyScheduleHandler: `LearningPhase`/
// `LearningTask` tienen Entity y Repository de dominio (Sprint 3.3.2), así
// que esta consulta lee directamente el modelo de escritura, sin
// necesitar un puerto de lectura dedicado. Envuelto en
// `UnitOfWork.execute(..., studentId)` para leer bajo `withStudentContext`
// (RLS real) — mismo patrón que el resto de los Handlers de consulta ya
// existentes (resolución 18.24). `dashboard_app_role` ya tiene GRANT
// SELECT sobre `learning_phase`/`learning_task` (migración
// 202607171400_my_plan_rls_policies) — sin cambios de RLS/GRANT.
//
// Ownership: el `learningPlanId` NUNCA lo decide el cliente — se resuelve
// aquí, server-side, a partir del `studentId` autenticado (resuelto por
// resolveMyPlanActor() en la capa API) vía
// `LearningPlanRepository.findActiveByStudentId`, exactamente igual que
// GetLearningGoalsHandler.
//
// Orden de fases: `LearningPhaseRepository.findByLearningPlanId` (igual
// que su implementación Prisma) no garantiza ningún orden — se ordena
// aquí explícitamente por `phaseOrder` ascendente antes de mapear (13.4:
// columna real del dominio, ver LearningPhase.phaseOrder). `phaseOrder` en
// sí no se expone en el DTO (la UI no lo renderiza, solo depende de que
// las fases ya lleguen ordenadas).
//
// Orden de tareas: `LearningTask` NO tiene ningún campo de orden en el
// dominio (auditoría "Learning Planner Architecture Audit", confirmado —
// a diferencia de LearningPhase/LearningObjective) — se preserva tal cual
// el orden que devuelve el repositorio, sin inventar ningún criterio de
// ordenación adicional.
//
// StudySession: deliberadamente NO se consulta aquí. `PhasesAndTasks.tsx`
// (antes de este slice) solo mostraba un conteo de sesiones por tarea,
// pero `StudySessionRepository.findByLearningTaskId` no tiene hoy ningún
// llamador real en ningún Handler existente — conectarlo aquí introduciría
// un nuevo camino de lectura de producción por primera vez, exactamente
// lo que esta auditoría pide detener y reportar en vez de expandir
// automáticamente (alcance de este slice: LearningPhase → LearningTask
// únicamente). Se retira esa línea de la UI en vez de inventar datos —
// ver PhasesAndTasks.tsx y el reporte final de este slice.
export class GetLearningPhasesHandler {
  constructor(
    private readonly learningPlanRepository: LearningPlanRepository,
    private readonly learningPhaseRepository: LearningPhaseRepository,
    private readonly learningTaskRepository: LearningTaskRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly logger: Logger,
  ) {}

  public async handle(query: GetLearningPhasesQuery): Promise<LearningPhasesReadModel> {
    const { request } = query;
    validateGetLearningPhasesRequest(request);

    const studentId = StudentId.create(request.studentId);

    const phases = await this.unitOfWork.execute(async () => {
      const plan = await this.learningPlanRepository.findActiveByStudentId(studentId);
      if (!plan) throw new ResourceNotFoundException("LearningPlan (activo)", studentId.value);

      const foundPhases = await this.learningPhaseRepository.findByLearningPlanId(plan.id);
      const orderedPhases = [...foundPhases].sort((a, b) => a.phaseOrder - b.phaseOrder);

      const phasesWithTasks: Array<{ phase: LearningPhase; tasks: LearningTask[] }> = [];
      for (const phase of orderedPhases) {
        const tasks = await this.learningTaskRepository.findByLearningPhaseId(phase.id);
        phasesWithTasks.push({ phase, tasks });
      }
      return phasesWithTasks;
    }, studentId.value);

    this.logger.debug("GetLearningPhases resuelto", {
      studentId: studentId.value,
      phaseCount: phases.length,
    });
    return GetLearningPhasesHandler.toReadModel(phases);
  }

  private static toReadModel(
    phases: ReadonlyArray<{ phase: LearningPhase; tasks: readonly LearningTask[] }>,
  ): LearningPhasesReadModel {
    return {
      phases: phases.map(({ phase, tasks }): LearningPhaseSummaryDto => ({
        id: phase.id.value,
        name: phase.name,
        status: phase.status,
        tasks: tasks.map((task): LearningTaskSummaryDto => ({
          id: task.id.value,
          title: task.title,
          status: task.status,
          source: task.source,
        })),
      })),
    };
  }
}
