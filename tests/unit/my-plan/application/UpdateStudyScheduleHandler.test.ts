import { describe, it, expect } from "vitest";
import { UpdateStudyScheduleHandler } from "@/features/my-plan/application/handlers/UpdateStudyScheduleHandler";
import { UpdateStudyScheduleCommand } from "@/features/my-plan/application/commands/UpdateStudyScheduleCommand";
import { ForbiddenException } from "@/features/my-plan/application/exceptions/ForbiddenException";
import { ResourceNotFoundException } from "@/features/my-plan/application/exceptions/ResourceNotFoundException";
import { LearningPlan } from "@/features/my-plan/domain/entities/LearningPlan";
import { StudySchedule } from "@/features/my-plan/domain/entities/StudySchedule";
import { StudyFrequency } from "@/features/my-plan/domain/value-objects/StudyFrequency";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import { StudyScheduleId } from "@/features/my-plan/domain/value-objects/StudyScheduleId";
import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import { makeStudyScheduleRepository, makeLearningPlanRepository, makeUnitOfWork, makeLogger } from "./mocks";
import { APP_FIXTURE_IDS } from "./fixtures";

function buildFixtures(studentId = APP_FIXTURE_IDS.student) {
  const plan = LearningPlan.create({
    id: LearningPlanId.create(APP_FIXTURE_IDS.plan),
    studentId: StudentId.create(studentId),
    name: "Plan",
    targetLevel: "B2" as never,
    startDate: new Date("2026-01-01T00:00:00.000Z"),
  });
  const schedule = StudySchedule.create({
    id: StudyScheduleId.create(APP_FIXTURE_IDS.schedule),
    learningPlanId: plan.id,
    frequency: StudyFrequency.create({ daysPerWeek: 3, sessionsPerDay: 1, minutesPerSession: 20 }),
  });
  return { plan, schedule };
}

describe("UpdateStudyScheduleHandler", () => {
  it("reconfigura la disponibilidad (StudyFrequency/ReminderTime nuevos), bajo el contexto RLS del propio estudiante (18.24)", async () => {
    const studyScheduleRepository = makeStudyScheduleRepository();
    const learningPlanRepository = makeLearningPlanRepository();
    const { plan, schedule } = buildFixtures();
    learningPlanRepository.findById.mockResolvedValue(plan);
    studyScheduleRepository.findByLearningPlanId.mockResolvedValue(schedule);
    const unitOfWork = makeUnitOfWork();
    const handler = new UpdateStudyScheduleHandler(
      studyScheduleRepository as never,
      learningPlanRepository as never,
      unitOfWork as never,
      makeLogger() as never,
    );

    const result = await handler.handle(
      UpdateStudyScheduleCommand.fromRequest({
        studentId: APP_FIXTURE_IDS.student,
        planId: APP_FIXTURE_IDS.plan,
        daysPerWeek: 6,
        sessionsPerDay: 2,
        minutesPerSession: 45,
        reminderHour: 8,
        reminderMinute: 30,
      }),
    );

    expect(result.daysPerWeek).toBe(6);
    expect(result.reminderHour).toBe(8);
    expect(studyScheduleRepository.save).toHaveBeenCalledWith(schedule);
    expect(unitOfWork.execute).toHaveBeenCalledWith(expect.any(Function), APP_FIXTURE_IDS.student);
  });

  it("rechaza con ForbiddenException si el plan no pertenece al estudiante", async () => {
    const studyScheduleRepository = makeStudyScheduleRepository();
    const learningPlanRepository = makeLearningPlanRepository();
    const { plan } = buildFixtures(APP_FIXTURE_IDS.otherStudent);
    learningPlanRepository.findById.mockResolvedValue(plan);
    const handler = new UpdateStudyScheduleHandler(
      studyScheduleRepository as never,
      learningPlanRepository as never,
      makeUnitOfWork() as never,
      makeLogger() as never,
    );

    await expect(
      handler.handle(
        UpdateStudyScheduleCommand.fromRequest({
          studentId: APP_FIXTURE_IDS.student,
          planId: APP_FIXTURE_IDS.plan,
          daysPerWeek: 6,
          sessionsPerDay: 2,
          minutesPerSession: 45,
        }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rechaza con ResourceNotFoundException si el plan no tiene StudySchedule (relación 1:1)", async () => {
    const studyScheduleRepository = makeStudyScheduleRepository();
    const learningPlanRepository = makeLearningPlanRepository();
    const { plan } = buildFixtures();
    learningPlanRepository.findById.mockResolvedValue(plan);
    studyScheduleRepository.findByLearningPlanId.mockResolvedValue(null);
    const handler = new UpdateStudyScheduleHandler(
      studyScheduleRepository as never,
      learningPlanRepository as never,
      makeUnitOfWork() as never,
      makeLogger() as never,
    );

    await expect(
      handler.handle(
        UpdateStudyScheduleCommand.fromRequest({
          studentId: APP_FIXTURE_IDS.student,
          planId: APP_FIXTURE_IDS.plan,
          daysPerWeek: 6,
          sessionsPerDay: 2,
          minutesPerSession: 45,
        }),
      ),
    ).rejects.toBeInstanceOf(ResourceNotFoundException);
  });
});
