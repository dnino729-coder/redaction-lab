import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import type { LearningPhase } from "@/features/my-plan/domain/entities/LearningPhase";
import type { LearningTask } from "@/features/my-plan/domain/entities/LearningTask";
import type { StudySession } from "@/features/my-plan/domain/entities/StudySession";
import type { LearningPlanRepository } from "@/features/my-plan/domain/repositories/LearningPlanRepository";
import type { LearningPhaseRepository } from "@/features/my-plan/domain/repositories/LearningPhaseRepository";
import type { LearningTaskRepository } from "@/features/my-plan/domain/repositories/LearningTaskRepository";
import type { StudySessionRepository } from "@/features/my-plan/domain/repositories/StudySessionRepository";

import type { GetLearningPhasesQuery } from "../queries/GetLearningPhasesQuery";
import type {
  LearningPhaseSummaryDto,
  LearningPhasesReadModel,
  LearningTaskSessionSummaryDto,
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
// StudySession (slice "connect study session history"): se embebe aquí,
// dentro de esta misma consulta, en vez de crear un endpoint dedicado
// GET /api/v1/my-plan/tasks/:taskId/sessions — la auditoría "Study Session
// Architecture Audit" concluyó que esa segunda opción obligaría al
// frontend a hacer una petición HTTP por tarea visible (N+1), mientras que
// esta consulta ya itera fase→tarea en una única transacción; añadir un
// `findByLearningTaskId` más por tarea a ese mismo bucle no introduce
// ninguna petición HTTP adicional. Ownership: las sesiones nunca se
// verifican por separado — ya están scoped por la misma cadena
// plan→fase→tarea que este Handler ya resuelve contra el `studentId`
// autenticado; una tarea que no pertenece al estudiante nunca llega a
// pedirle sesiones a este bucle. `dashboard_app_role` ya tiene GRANT
// SELECT sobre `study_session` (migración 202607171400) — sin cambios de
// RLS/GRANT. Reutiliza `StudySessionRepository.findByLearningTaskId` sin
// modificarlo — primer llamador real de ese método.
export class GetLearningPhasesHandler {
  constructor(
    private readonly learningPlanRepository: LearningPlanRepository,
    private readonly learningPhaseRepository: LearningPhaseRepository,
    private readonly learningTaskRepository: LearningTaskRepository,
    private readonly studySessionRepository: StudySessionRepository,
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

      const phasesWithTasks: Array<{
        phase: LearningPhase;
        tasks: Array<{ task: LearningTask; sessions: StudySession[] }>;
      }> = [];
      for (const phase of orderedPhases) {
        const tasks = await this.learningTaskRepository.findByLearningPhaseId(phase.id);
        const tasksWithSessions: Array<{ task: LearningTask; sessions: StudySession[] }> = [];
        for (const task of tasks) {
          const sessions = await this.studySessionRepository.findByLearningTaskId(task.id);
          tasksWithSessions.push({ task, sessions });
        }
        phasesWithTasks.push({ phase, tasks: tasksWithSessions });
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
    phases: ReadonlyArray<{
      phase: LearningPhase;
      tasks: ReadonlyArray<{ task: LearningTask; sessions: readonly StudySession[] }>;
    }>,
  ): LearningPhasesReadModel {
    return {
      phases: phases.map(({ phase, tasks }): LearningPhaseSummaryDto => ({
        id: phase.id.value,
        name: phase.name,
        status: phase.status,
        tasks: tasks.map(({ task, sessions }): LearningTaskSummaryDto => ({
          id: task.id.value,
          title: task.title,
          status: task.status,
          source: task.source,
          sessions: sessions.map((session): LearningTaskSessionSummaryDto => ({
            id: session.id.value,
            startedAt: session.startedAt.toISOString(),
            finishedAt: session.finishedAt ? session.finishedAt.toISOString() : null,
            durationMinutes: session.duration ? session.duration.minutes : null,
            completed: session.completed,
          })),
        })),
      })),
    };
  }
}
