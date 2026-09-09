import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import { LearningTaskId } from "@/features/my-plan/domain/value-objects/LearningTaskId";
import { LearningTaskStatus } from "@/features/my-plan/domain/enums/LearningTaskStatus";
import type { LearningTaskRepository } from "@/features/my-plan/domain/repositories/LearningTaskRepository";
import type { LearningPhaseRepository } from "@/features/my-plan/domain/repositories/LearningPhaseRepository";
import { InvalidStatusTransitionException } from "@/features/my-plan/domain/exceptions/InvalidStatusTransitionException";
import { InvalidTaskSourceOperationException } from "@/features/my-plan/domain/exceptions/InvalidTaskSourceOperationException";

import type { CompleteLearningTaskCommand } from "../commands/CompleteLearningTaskCommand";
import type { LearningTaskResponseDto } from "../dto/LearningTaskDto";
import { LearningTaskMapper } from "../mappers/LearningTaskMapper";
import { validateCompleteLearningTaskRequest } from "../validators/learningTaskObjectiveValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import { ConflictException } from "../exceptions/ConflictException";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { Clock } from "../ports/Clock";
import type { Logger } from "../ports/Logger";
import type { OwnershipVerificationService } from "../services/OwnershipVerificationService";
import type { DomainEventPublisher } from "../services/DomainEventPublisher";
import type { LearningProgressWritePort } from "../ports/LearningProgressWritePort";
import { LearningProgressCalculator } from "../services/LearningProgressCalculator";

// Caso de uso: CompleteLearningTask — completa manualmente una
// LearningTask (siempre por la vía `complete()`, nunca
// `completeFromExternalEvent()`: esa segunda vía la invoca el receptor
// del evento EXTERNAL_ACTIVITY_COMPLETED, un caso de uso distinto, no
// solicitado en este sprint). El dominio rechaza la operación por sí
// mismo si `source != SELF_DIRECTED` (`InvalidTaskSourceOperationException`,
// 18.20.5) — este Handler solo traduce esa excepción de dominio a
// `ConflictException` de aplicación.
//
// DECISIÓN DE COORDINACIÓN (no altera el dominio ni añade una regla de
// negocio nueva): 18.21 exige la transición intermedia `NOT_STARTED ->
// IN_PROGRESS` antes de `-> COMPLETED` (tabla de transiciones común,
// domain/shared/statusTransitions.ts) — `LearningTask.complete()` no la
// hace implícita. El encargo de este sprint no incluye un caso de uso
// "StartLearningTask" independiente (los 15 nombrados no lo listan), y
// desde la perspectiva del estudiante "completar una tarea" es una única
// acción. Este Handler invoca `task.start()` (ya existente en el
// dominio, sin ningún cambio) inmediatamente antes de `task.complete()`
// únicamente si la tarea sigue `NOT_STARTED` — pura coordinación de una
// secuencia de dos métodos de dominio ya aprobados, no una tercera regla
// inventada.
//
// Tras completar la tarea, recalcula el `status` de su `LearningPhase`
// padre (18.21: "LearningPhase.status se calcula automáticamente a partir
// de sus LearningTask") — aplicar esa regla ya aprobada es coordinación
// de aplicación, no una regla de negocio nueva.
//
// Slice "maintain learning progress" (ver auditoría "Learning Progress
// Architecture Audit"): además, en la misma transacción, recalcula y
// escribe `learning_progress` (recount completo de todas las
// LearningTask del plan, vía LearningProgressCalculator) — mantiene la
// proyección persistida consistente con el mismo cambio que la invalidó,
// sin una segunda transacción ni EventBus.
export class CompleteLearningTaskHandler {
  constructor(
    private readonly learningTaskRepository: LearningTaskRepository,
    private readonly learningPhaseRepository: LearningPhaseRepository,
    private readonly ownershipVerificationService: OwnershipVerificationService,
    private readonly learningProgressWritePort: LearningProgressWritePort,
    private readonly unitOfWork: UnitOfWork,
    private readonly clock: Clock,
    private readonly domainEventPublisher: DomainEventPublisher,
    private readonly logger: Logger,
  ) {}

  public async handle(command: CompleteLearningTaskCommand): Promise<LearningTaskResponseDto> {
    const { request } = command;
    validateCompleteLearningTaskRequest(request);

    const studentId = StudentId.create(request.studentId);
    const taskId = LearningTaskId.create(request.taskId);

    await this.unitOfWork.execute(async () => {
      const task = await this.learningTaskRepository.findById(taskId);
      if (!task) throw new ResourceNotFoundException("LearningTask", taskId.value);

      const { phase, plan } = await this.ownershipVerificationService.verifyTaskOwnership(
        task,
        studentId,
      );

      // Regla "PAUSED = no se puede generar nuevo progreso" (ver auditoría
      // "PAUSED Behavior Audit"): completar una tarea es la operación que
      // define "progreso" en el dominio (LearningProgress solo depende de
      // LearningTaskStatus) — solo se permite con el plan ACTIVE. Se
      // verifica aquí, tras resolver ownership y antes de mutar la tarea,
      // para no persistir ningún cambio si el plan está pausado.
      if (!plan.isActive) {
        throw new ConflictException(
          `El LearningPlan ${plan.id.value} está ${plan.status}, no ACTIVE — no se puede completar la tarea ${taskId.value} mientras el plan no esté activo.`,
        );
      }

      try {
        if (task.status === LearningTaskStatus.NOT_STARTED) {
          task.start();
        }
        task.complete(studentId, this.clock.now());
      } catch (error) {
        if (
          error instanceof InvalidTaskSourceOperationException ||
          error instanceof InvalidStatusTransitionException
        ) {
          throw new ConflictException(error.message);
        }
        throw error;
      }

      await this.learningTaskRepository.save(task);

      const siblingTasks = await this.learningTaskRepository.findByLearningPhaseId(phase.id);
      phase.recalculateStatus(
        siblingTasks.map((sibling) => sibling.status),
        this.clock.now(),
      );
      await this.learningPhaseRepository.save(phase);

      // learning_progress se recalcula en la misma transacción — ver
      // auditoría "Learning Progress Architecture Audit", secciones 6/11.
      // `phase.learningPlanId` ya lo conocemos por
      // OwnershipVerificationService.verifyTaskOwnership(); no se hace
      // ninguna consulta adicional solo para descubrirlo.
      //
      // Recount completo (no incremental): se recorren TODAS las fases
      // del plan y TODAS sus tareas — evita drift, mismo patrón ya usado
      // arriba para recalcular LearningPhase.status a partir de sus
      // hijas. currentStreak = 0: sin semántica de streak válida hoy para
      // My Plan (ver LearningProgressCalculator.ts / auditoría, sección 5).
      const allPhases = await this.learningPhaseRepository.findByLearningPlanId(
        phase.learningPlanId,
      );
      const allTaskStatuses: LearningTaskStatus[] = [];
      for (const planPhase of allPhases) {
        const tasksOfPhase = await this.learningTaskRepository.findByLearningPhaseId(planPhase.id);
        allTaskStatuses.push(...tasksOfPhase.map((planTask) => planTask.status));
      }
      const progress = LearningProgressCalculator.fromTaskStatuses(allTaskStatuses);
      await this.learningProgressWritePort.upsert({
        learningPlanId: phase.learningPlanId.value,
        completedTasks: progress.completedTasks,
        totalTasks: progress.totalTasks,
        completionPercentage: progress.completionPercentage,
        currentStreak: 0,
      });
    });

    const task = await this.learningTaskRepository.findById(taskId);
    if (!task) throw new ResourceNotFoundException("LearningTask", taskId.value);

    // Publicación de eventos únicamente tras confirmar la transacción —
    // misma política que CreateLearningPlanHandler (cierre de
    // inconsistencia detectada durante la verificación de este sprint:
    // antes de este cierre, este Handler publicaba dentro del propio
    // `unitOfWork.execute()`).
    await this.domainEventPublisher.publishFrom(task);

    this.logger.info("LearningTask completada", {
      learningTaskId: taskId.value,
      studentId: studentId.value,
    });
    return LearningTaskMapper.toResponseDto(task);
  }
}
