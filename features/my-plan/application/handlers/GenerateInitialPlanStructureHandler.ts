import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import { LearningPhaseId } from "@/features/my-plan/domain/value-objects/LearningPhaseId";
import { LearningTaskId } from "@/features/my-plan/domain/value-objects/LearningTaskId";
import { LearningPhase } from "@/features/my-plan/domain/entities/LearningPhase";
import { LearningTask } from "@/features/my-plan/domain/entities/LearningTask";
import { LearningTaskSource } from "@/features/my-plan/domain/enums/LearningTaskSource";
import type { LearningPlanRepository } from "@/features/my-plan/domain/repositories/LearningPlanRepository";
import type { LearningPhaseRepository } from "@/features/my-plan/domain/repositories/LearningPhaseRepository";
import type { LearningTaskRepository } from "@/features/my-plan/domain/repositories/LearningTaskRepository";
import type { StudyScheduleRepository } from "@/features/my-plan/domain/repositories/StudyScheduleRepository";

import type { GenerateInitialPlanStructureCommand } from "../commands/GenerateInitialPlanStructureCommand";
import type { GenerateInitialPlanStructureResultDto } from "../dto/GenerateInitialPlanStructureDto";
import { validateGenerateInitialPlanStructureRequest } from "../validators/learningPlanValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { UuidGenerator } from "../ports/UuidGenerator";
import type { Logger } from "../ports/Logger";

// Caso de uso: GenerateInitialPlanStructure — productor determinista de la
// ESTRUCTURA mínima (LearningPhase + LearningTask) de un LearningPlan ya
// creado. Deliberadamente NO se llama "LearningPlanner"/"Planner": ese
// nombre está reservado en la documentación (docs/modules/mi-plan.md,
// Vacío 8) para un futuro servicio de IA orquestado ("propone" calendarios
// candidatos, validados por un "Motor Pedagógico Adaptativo" antes de
// persistir) — nada de eso existe hoy. Este Handler es exactamente lo
// opuesto en alcance: no decide contenido pedagógico, no usa IA, no
// recomienda nada; solo garantiza que un plan recién creado tenga al
// menos una unidad de trabajo real y utilizable por el resto del dominio
// ya existente (CompleteLearningTaskHandler, CreateStudySessionHandler).
//
// Alcance explícitamente NO cubierto aquí (ver auditoría "Learning Planner
// Architecture Audit"): LearningGoal/StudySchedule (ya los crea
// CreateLearningPlanHandler, sin modificar), LearningObjective (sin
// productor, fuera de alcance — LearningPhase es estructuralmente
// independiente de LearningGoal, ver comentario de migración de
// learning_phase), StudySession (ya tiene productor propio,
// CreateStudySessionHandler), DailyPlan/WeeklyPlan/LearningProgress (sin
// repositorio de escritura, requieren una decisión de asignación de
// fechas que StudySchedule no permite derivar hoy — fuera de alcance).
//
// Frontera de confianza: este comando NUNCA se expone vía HTTP en este
// slice (no hay Route Handler, no hay DTO público, no hay hook) — solo lo
// invoca la propia orquestación de aplicación (Profile → onboarding),
// inmediatamente después de que CreateLearningPlanHandler confirma la
// creación del plan en su propia transacción, ya cerrada. Por eso no
// verifica ownership contra ningún studentId: no existe una sesión de
// estudiante en este punto de invocación que pudiera falsificar un
// learningPlanId ajeno.
//
// Transacción: propia (UnitOfWork.execute(work) SIN studentId ⇒
// withServiceContext/dashboard_service_role) — CreateLearningPlanHandler
// no se modifica ni se le inyecta ninguna dependencia nueva; esta es una
// SEGUNDA transacción independiente, invocada después de que la primera ya
// confirmó, mismo patrón ya aprobado para
// CompleteStudentOnboardingHandler → CreateLearningPlanHandler. RLS ya
// otorga a dashboard_service_role SELECT+INSERT+UPDATE sobre
// learning_phase/learning_task (migración 202607171400) — dashboard_app_role
// carece deliberadamente de INSERT sobre ambas tablas (el estudiante nunca
// las crea directamente), así que withStudentContext no serviría aquí.
//
// Idempotencia: se comprueba `learningPhaseRepository.findByLearningPlanId`
// ANTES de crear nada — si ya existe al menos una fase, no-op (no hay
// ninguna restricción UNIQUE de clave natural en `learning_phase`/
// `learning_task` que lo protegiera a nivel de base de datos; ver
// auditoría, sección 14). Protege contra onboarding repetido, reintentos
// de aplicación/servidor e invocación accidental duplicada.
export class GenerateInitialPlanStructureHandler {
  constructor(
    private readonly learningPlanRepository: LearningPlanRepository,
    private readonly learningPhaseRepository: LearningPhaseRepository,
    private readonly learningTaskRepository: LearningTaskRepository,
    private readonly studyScheduleRepository: StudyScheduleRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly uuidGenerator: UuidGenerator,
    private readonly logger: Logger,
  ) {}

  public async handle(
    command: GenerateInitialPlanStructureCommand,
  ): Promise<GenerateInitialPlanStructureResultDto> {
    const { request } = command;
    validateGenerateInitialPlanStructureRequest(request);

    const planId = LearningPlanId.create(request.learningPlanId);

    const result = await this.unitOfWork.execute(async () => {
      const plan = await this.learningPlanRepository.findById(planId);
      if (!plan) throw new ResourceNotFoundException("LearningPlan", planId.value);

      const existingPhases = await this.learningPhaseRepository.findByLearningPlanId(planId);
      if (existingPhases.length > 0) {
        // Idempotente: la estructura ya existe (onboarding repetido,
        // reintento, o invocación duplicada) — no se crea nada más.
        return {
          learningPlanId: planId.value,
          created: false,
          phasesCreated: 0,
          tasksCreated: 0,
        };
      }

      const schedule = await this.studyScheduleRepository.findByLearningPlanId(planId);
      if (!schedule) throw new ResourceNotFoundException("StudySchedule", planId.value);

      // Fase única, determinista — "Phase 1" (nombre puramente
      // estructural, sin contenido pedagógico; ver auditoría, sección 8).
      // phaseOrder=1: mismo valor usado consistentemente en todo el
      // dominio/tests existentes (tests/unit/my-plan/domain/LearningPhase.test.ts
      // y otros) para la primera fase. startDate = plan.startDate — no se
      // inventa ninguna otra fecha.
      const phase = LearningPhase.create({
        id: LearningPhaseId.create(this.uuidGenerator.generate()),
        learningPlanId: planId,
        name: "Phase 1",
        phaseOrder: 1,
        startDate: plan.startDate,
      });
      await this.learningPhaseRepository.save(phase);

      // Tarea única, determinista — "Task 1" (mismo criterio de neutralidad
      // que el nombre de la fase). source=SELF_DIRECTED: obligatorio,
      // porque hoy no existe ningún productor de eventos
      // EXTERNAL_ACTIVITY_COMPLETED capaz de completar una tarea de
      // cualquier otro source (ver auditoría, sección 9) — con cualquier
      // otro valor, la tarea sería permanentemente irrealizable por el
      // estudiante. estimatedMinutes = StudySchedule.minutesPerSession:
      // única derivación legítima que el dominio permite hoy (ver
      // auditoría, sección 6) — no se convierte daysPerWeek×sessionsPerDay
      // en número de tareas.
      const task = LearningTask.create({
        id: LearningTaskId.create(this.uuidGenerator.generate()),
        learningPhaseId: phase.id,
        title: "Task 1",
        estimatedMinutes: schedule.frequency.minutesPerSession,
        source: LearningTaskSource.SELF_DIRECTED,
      });
      await this.learningTaskRepository.save(task);

      return {
        learningPlanId: planId.value,
        created: true,
        phasesCreated: 1,
        tasksCreated: 1,
      };
    });

    this.logger.info("GenerateInitialPlanStructure resuelto", {
      learningPlanId: planId.value,
      created: result.created,
      phasesCreated: result.phasesCreated,
      tasksCreated: result.tasksCreated,
    });

    return result;
  }
}
