import { LearningPlan } from "@/features/my-plan/domain/entities/LearningPlan";
import { LearningGoal } from "@/features/my-plan/domain/entities/LearningGoal";
import { StudySchedule } from "@/features/my-plan/domain/entities/StudySchedule";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import { LearningGoalId } from "@/features/my-plan/domain/value-objects/LearningGoalId";
import { StudyScheduleId } from "@/features/my-plan/domain/value-objects/StudyScheduleId";
import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import { StudyFrequency } from "@/features/my-plan/domain/value-objects/StudyFrequency";
import { ReminderTime } from "@/features/my-plan/domain/value-objects/ReminderTime";
import type { CefrLevel } from "@/features/my-plan/domain/enums/CefrLevel";
import type { GoalPriority } from "@/features/my-plan/domain/enums/GoalPriority";
import type { LearningPlanRepository } from "@/features/my-plan/domain/repositories/LearningPlanRepository";
import type { LearningGoalRepository } from "@/features/my-plan/domain/repositories/LearningGoalRepository";
import type { StudyScheduleRepository } from "@/features/my-plan/domain/repositories/StudyScheduleRepository";

import type { CreateLearningPlanCommand } from "../commands/CreateLearningPlanCommand";
import type { LearningPlanResponseDto } from "../dto/LearningPlanDto";
import { LearningPlanMapper } from "../mappers/LearningPlanMapper";
import { validateCreateLearningPlanRequest } from "../validators/learningPlanValidators";
import { ConflictException } from "../exceptions/ConflictException";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { UuidGenerator } from "../ports/UuidGenerator";
import type { Logger } from "../ports/Logger";
import { DomainEventPublisher } from "../services/DomainEventPublisher";

// Caso de uso: CreateLearningPlan.
//
// ALCANCE DE ESTA IMPLEMENTACIÓN (ambigüedad reportada, ver informe de
// entrega): el flujo completo descrito en docs/modules/mi-plan.md 2.5
// ("Learning Planner (propuesta inicial) → Motor Pedagógico Adaptativo
// (valida y persiste)") requiere invocar al AI Orchestrator — eso es
// infraestructura de IA, explícitamente fuera de alcance de este sprint
// ("Solo coordina: entidades, repositorios, eventos, servicios de
// dominio... No implementar infraestructura"). Este Handler implementa
// únicamente la persistencia de un plan ya decidido: recibe las metas
// iniciales y la configuración de horario como parte del propio Request
// (en vez de generarlas internamente), garantizando estructuralmente el
// MUST de 13.4 ("todo plan requiere ≥1 objetivo") sin inventar contenido
// pedagógico. No crea `LearningPhase`/`LearningTask` — su generación
// depende del Learning Planner y queda fuera de alcance (tampoco existe
// un caso de uso "CreateLearningPhase/CreateLearningTask" en el encargo).
export class CreateLearningPlanHandler {
  constructor(
    private readonly learningPlanRepository: LearningPlanRepository,
    private readonly learningGoalRepository: LearningGoalRepository,
    private readonly studyScheduleRepository: StudyScheduleRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly uuidGenerator: UuidGenerator,
    private readonly domainEventPublisher: DomainEventPublisher,
    private readonly logger: Logger,
  ) {}

  public async handle(command: CreateLearningPlanCommand): Promise<LearningPlanResponseDto> {
    const { request } = command;
    validateCreateLearningPlanRequest(request);

    const studentId = StudentId.create(request.studentId);

    // 13.4 MUST: "un estudiante puede tener múltiples planes, pero solo un
    // plan activo" — verificado aquí porque es una invariante que cruza
    // agregados (no puede vivir dentro de un único `LearningPlan.create()`
    // sin conocer los demás planes del estudiante).
    const existingActivePlan = await this.learningPlanRepository.findActiveByStudentId(studentId);
    if (existingActivePlan) {
      throw new ConflictException(
        `El estudiante ${studentId.value} ya tiene un plan activo (${existingActivePlan.id.value}) — 13.4 MUST: solo un plan activo por estudiante.`,
      );
    }

    const plan = LearningPlan.create({
      id: LearningPlanId.create(this.uuidGenerator.generate()),
      studentId,
      name: request.name,
      description: request.description ?? null,
      targetLevel: request.targetLevel as CefrLevel,
      startDate: new Date(request.startDate),
      endDate: request.endDate ? new Date(request.endDate) : null,
    });

    const goals = request.initialGoals.map((goalRequest) =>
      LearningGoal.create({
        id: LearningGoalId.create(this.uuidGenerator.generate()),
        learningPlanId: plan.id,
        title: goalRequest.title,
        description: goalRequest.description ?? null,
        priority: goalRequest.priority as GoalPriority | undefined,
        targetDate: goalRequest.targetDate ? new Date(goalRequest.targetDate) : null,
      }),
    );

    const schedule = StudySchedule.create({
      id: StudyScheduleId.create(this.uuidGenerator.generate()),
      learningPlanId: plan.id,
      frequency: StudyFrequency.create({
        daysPerWeek: request.studySchedule.daysPerWeek,
        sessionsPerDay: request.studySchedule.sessionsPerDay,
        minutesPerSession: request.studySchedule.minutesPerSession,
      }),
      reminderTime:
        request.studySchedule.reminderHour !== undefined && request.studySchedule.reminderMinute !== undefined
          ? ReminderTime.create(request.studySchedule.reminderHour, request.studySchedule.reminderMinute)
          : null,
    });

    await this.unitOfWork.execute(async () => {
      await this.learningPlanRepository.save(plan);
      for (const goal of goals) {
        await this.learningGoalRepository.save(goal);
      }
      await this.studyScheduleRepository.save(schedule);
    });

    // Publicación de eventos únicamente tras confirmar la transacción
    // ("PUBLICACIÓN DE EVENTOS... únicamente desde Application Layer").
    await this.domainEventPublisher.publishFrom(plan);

    this.logger.info("LearningPlan creado", { learningPlanId: plan.id.value, studentId: studentId.value });

    return LearningPlanMapper.toResponseDto(plan);
  }
}
