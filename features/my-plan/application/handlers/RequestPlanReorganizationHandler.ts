import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import type { LearningPlanRepository } from "@/features/my-plan/domain/repositories/LearningPlanRepository";
import { PlanReorganizationRequestedEvent } from "@/features/my-plan/domain/events/PlanReorganizationRequestedEvent";
import { ReprogrammingReason } from "@/features/my-plan/domain/enums/ReprogrammingReason";

import type { RequestPlanReorganizationCommand } from "../commands/RequestPlanReorganizationCommand";
import type { RequestPlanReorganizationResponseDto } from "../dto/PlanReorganizationDto";
import { validateRequestPlanReorganizationRequest } from "../validators/planReorganizationValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import { ForbiddenException } from "../exceptions/ForbiddenException";
import type { EventBus } from "../ports/EventBus";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { Clock } from "../ports/Clock";
import type { Logger } from "../ports/Logger";

// Caso de uso: RequestPlanReorganization — Vacío 2 / 18.20.2 ("el
// estudiante modifica un dato disparador (fecha del examen o
// disponibilidad) ⇒ se dispara PLAN_REORGANIZATION_REQUESTED"). No
// persiste ningún cambio de estado de dominio por sí mismo (el cambio de
// `endDate`/disponibilidad ya ocurrió en otro caso de uso previo —
// `UpdateStudySchedule` para disponibilidad; `UpdateLearningPlan` para
// fecha de examen, actualmente bloqueado, ver informe de entrega): este
// Handler únicamente valida que el plan exista y pertenezca al
// estudiante, y publica el evento para que el Learning Planner (Vacío 8,
// fuera de alcance) reaccione. Por eso NO usa `DomainEventPublisher` (que
// extrae eventos de un Aggregate Root mutado) — el evento se construye
// directamente aquí, no proviene de `pullDomainEvents()`.
//
// Resolución 18.24 (cierre del hallazgo A, Sprint 3.3.4.2): la lectura de
// `learning_plan` se envuelve en `UnitOfWork.execute(..., studentId)` —
// mismo patrón ya aplicado a los 5 Query Handlers — porque
// `dashboard_app_role` ya tiene GRANT SELECT + política
// `learning_plan_self_access` sobre esa tabla (migración
// `202607170900_dashboard_rls_policies`). `UnitOfWork` se usa aquí
// únicamente para la lectura bajo RLS; el evento sigue publicándose fuera
// de `execute()`, después de confirmada la lectura, sin cambios de
// comportamiento respecto a antes.
export class RequestPlanReorganizationHandler {
  constructor(
    private readonly learningPlanRepository: LearningPlanRepository,
    private readonly eventBus: EventBus,
    private readonly unitOfWork: UnitOfWork,
    private readonly clock: Clock,
    private readonly logger: Logger,
  ) {}

  public async handle(
    command: RequestPlanReorganizationCommand,
  ): Promise<RequestPlanReorganizationResponseDto> {
    const { request } = command;
    validateRequestPlanReorganizationRequest(request);

    const studentId = StudentId.create(request.studentId);
    const planId = LearningPlanId.create(request.planId);

    const plan = await this.unitOfWork.execute(async () => {
      const found = await this.learningPlanRepository.findById(planId);
      if (!found) throw new ResourceNotFoundException("LearningPlan", planId.value);
      if (!found.studentId.equals(studentId)) {
        throw new ForbiddenException(`El estudiante ${studentId.value} no es propietario del plan ${planId.value}.`);
      }
      return found;
    }, studentId.value);

    const reason = request.reason as ReprogrammingReason;
    const requestedAt = this.clock.now();

    const event = new PlanReorganizationRequestedEvent({
      aggregateId: plan.id.value,
      payload: {
        studentId: studentId.value,
        learningPlanId: plan.id.value,
        reason,
      },
      occurredAt: requestedAt,
    });
    await this.eventBus.publish([event]);

    this.logger.info("PlanReorganizationRequested publicado", {
      learningPlanId: planId.value,
      reason,
    });

    return {
      accepted: true,
      learningPlanId: plan.id.value,
      reason: request.reason,
      requestedAt: requestedAt.toISOString(),
    };
  }
}
