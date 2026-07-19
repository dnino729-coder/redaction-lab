import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import { StudyFrequency } from "@/features/my-plan/domain/value-objects/StudyFrequency";
import { ReminderTime } from "@/features/my-plan/domain/value-objects/ReminderTime";
import type { LearningPlanRepository } from "@/features/my-plan/domain/repositories/LearningPlanRepository";
import type { StudyScheduleRepository } from "@/features/my-plan/domain/repositories/StudyScheduleRepository";

import type { UpdateStudyScheduleCommand } from "../commands/UpdateStudyScheduleCommand";
import type { StudyScheduleResponseDto } from "../dto/StudyScheduleDto";
import { StudyScheduleMapper } from "../mappers/StudyScheduleMapper";
import { validateUpdateStudyScheduleRequest } from "../validators/studyScheduleSessionValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import { ForbiddenException } from "../exceptions/ForbiddenException";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { Logger } from "../ports/Logger";

// Caso de uso: UpdateStudySchedule. `StudySchedule.reschedule()` es,
// según 18.20.2, "el punto de entrada de dominio del flujo de
// reprogramación" — este Handler solo reconfigura la disponibilidad;
// disparar la propuesta del Learning Planner es responsabilidad de
// `RequestPlanReorganizationHandler` (evento separado, ver ese archivo),
// no de este caso de uso.
export class UpdateStudyScheduleHandler {
  constructor(
    private readonly studyScheduleRepository: StudyScheduleRepository,
    private readonly learningPlanRepository: LearningPlanRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly logger: Logger,
  ) {}

  public async handle(command: UpdateStudyScheduleCommand): Promise<StudyScheduleResponseDto> {
    const { request } = command;
    validateUpdateStudyScheduleRequest(request);

    const studentId = StudentId.create(request.studentId);
    const planId = LearningPlanId.create(request.planId);

    await this.unitOfWork.execute(async () => {
      const plan = await this.learningPlanRepository.findById(planId);
      if (!plan) throw new ResourceNotFoundException("LearningPlan", planId.value);
      if (!plan.studentId.equals(studentId)) {
        throw new ForbiddenException(`El estudiante ${studentId.value} no es propietario del plan ${planId.value}.`);
      }

      const schedule = await this.studyScheduleRepository.findByLearningPlanId(planId);
      if (!schedule) throw new ResourceNotFoundException("StudySchedule", planId.value);

      const frequency = StudyFrequency.create({
        daysPerWeek: request.daysPerWeek,
        sessionsPerDay: request.sessionsPerDay,
        minutesPerSession: request.minutesPerSession,
      });
      const reminderTime =
        request.reminderHour !== undefined &&
        request.reminderHour !== null &&
        request.reminderMinute !== undefined &&
        request.reminderMinute !== null
          ? ReminderTime.create(request.reminderHour, request.reminderMinute)
          : null;

      schedule.reschedule(frequency, reminderTime);
      await this.studyScheduleRepository.save(schedule);
    });

    const schedule = await this.studyScheduleRepository.findByLearningPlanId(planId);
    if (!schedule) throw new ResourceNotFoundException("StudySchedule", planId.value);

    this.logger.info("StudySchedule actualizado", { learningPlanId: planId.value });
    return StudyScheduleMapper.toResponseDto(schedule);
  }
}
