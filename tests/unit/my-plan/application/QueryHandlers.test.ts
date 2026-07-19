import { describe, it, expect } from "vitest";
import { GetActiveLearningPlanHandler } from "@/features/my-plan/application/handlers/GetActiveLearningPlanHandler";
import { GetActiveLearningPlanQuery } from "@/features/my-plan/application/queries/GetActiveLearningPlanQuery";
import { GetDailyPlanHandler } from "@/features/my-plan/application/handlers/GetDailyPlanHandler";
import { GetDailyPlanQuery } from "@/features/my-plan/application/queries/GetDailyPlanQuery";
import { GetWeeklyPlanHandler } from "@/features/my-plan/application/handlers/GetWeeklyPlanHandler";
import { GetWeeklyPlanQuery } from "@/features/my-plan/application/queries/GetWeeklyPlanQuery";
import { GetLearningProgressHandler } from "@/features/my-plan/application/handlers/GetLearningProgressHandler";
import { GetLearningProgressQuery } from "@/features/my-plan/application/queries/GetLearningProgressQuery";
import { GetStudyScheduleHandler } from "@/features/my-plan/application/handlers/GetStudyScheduleHandler";
import { GetStudyScheduleQuery } from "@/features/my-plan/application/queries/GetStudyScheduleQuery";
import { ResourceNotFoundException } from "@/features/my-plan/application/exceptions/ResourceNotFoundException";
import { LearningPlan } from "@/features/my-plan/domain/entities/LearningPlan";
import { StudySchedule } from "@/features/my-plan/domain/entities/StudySchedule";
import { StudyFrequency } from "@/features/my-plan/domain/value-objects/StudyFrequency";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import { StudyScheduleId } from "@/features/my-plan/domain/value-objects/StudyScheduleId";
import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import {
  makeLearningPlanRepository,
  makeStudyScheduleRepository,
  makeDailyPlanReadPort,
  makeWeeklyPlanReadPort,
  makeLearningProgressReadPort,
  makeLogger,
} from "./mocks";
import { APP_FIXTURE_IDS } from "./fixtures";

function buildActivePlan() {
  return LearningPlan.create({
    id: LearningPlanId.create(APP_FIXTURE_IDS.plan),
    studentId: StudentId.create(APP_FIXTURE_IDS.student),
    name: "Plan",
    targetLevel: "B2" as never,
    startDate: new Date("2026-01-01T00:00:00.000Z"),
  });
}

describe("GetActiveLearningPlanHandler", () => {
  it("devuelve el plan activo del estudiante", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    learningPlanRepository.findActiveByStudentId.mockResolvedValue(buildActivePlan());
    const handler = new GetActiveLearningPlanHandler(learningPlanRepository as never, makeLogger() as never);

    const result = await handler.handle(
      GetActiveLearningPlanQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student }),
    );
    expect(result.id).toBe(APP_FIXTURE_IDS.plan);
  });

  it("lanza ResourceNotFoundException si no hay plan activo", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    const handler = new GetActiveLearningPlanHandler(learningPlanRepository as never, makeLogger() as never);

    await expect(
      handler.handle(GetActiveLearningPlanQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student })),
    ).rejects.toBeInstanceOf(ResourceNotFoundException);
  });
});

describe("GetDailyPlanHandler (CQRS read port)", () => {
  it("resuelve el plan activo y delega en DailyPlanReadPort", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    learningPlanRepository.findActiveByStudentId.mockResolvedValue(buildActivePlan());
    const dailyPlanReadPort = makeDailyPlanReadPort();
    dailyPlanReadPort.findByLearningPlanIdAndDate.mockResolvedValue({
      id: "dp-1",
      learningPlanId: APP_FIXTURE_IDS.plan,
      planDate: "2026-07-18",
      estimatedMinutes: 60,
      completedMinutes: 30,
      completionPercentage: 50,
    });
    const handler = new GetDailyPlanHandler(
      learningPlanRepository as never,
      dailyPlanReadPort as never,
      makeLogger() as never,
    );

    const result = await handler.handle(
      GetDailyPlanQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student, date: "2026-07-18" }),
    );
    expect(result.completionPercentage).toBe(50);
    expect(dailyPlanReadPort.findByLearningPlanIdAndDate).toHaveBeenCalledWith(
      APP_FIXTURE_IDS.plan,
      new Date("2026-07-18"),
    );
  });
});

describe("GetWeeklyPlanHandler (CQRS read port)", () => {
  it("resuelve el plan activo y delega en WeeklyPlanReadPort", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    learningPlanRepository.findActiveByStudentId.mockResolvedValue(buildActivePlan());
    const weeklyPlanReadPort = makeWeeklyPlanReadPort();
    weeklyPlanReadPort.findByLearningPlanIdAndWeekNumber.mockResolvedValue({
      id: "wp-1",
      learningPlanId: APP_FIXTURE_IDS.plan,
      weekNumber: 3,
      estimatedMinutes: 300,
      completedMinutes: 100,
      completionPercentage: 33,
    });
    const handler = new GetWeeklyPlanHandler(
      learningPlanRepository as never,
      weeklyPlanReadPort as never,
      makeLogger() as never,
    );

    const result = await handler.handle(
      GetWeeklyPlanQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student, weekNumber: 3 }),
    );
    expect(result.weekNumber).toBe(3);
  });
});

describe("GetLearningProgressHandler (CQRS read port)", () => {
  it("resuelve el plan activo y delega en LearningProgressReadPort", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    learningPlanRepository.findActiveByStudentId.mockResolvedValue(buildActivePlan());
    const learningProgressReadPort = makeLearningProgressReadPort();
    learningProgressReadPort.findByLearningPlanId.mockResolvedValue({
      id: "lp-1",
      learningPlanId: APP_FIXTURE_IDS.plan,
      completedTasks: 5,
      totalTasks: 20,
      completionPercentage: 25,
      currentStreak: 2,
      updatedAt: "2026-07-18T00:00:00.000Z",
    });
    const handler = new GetLearningProgressHandler(
      learningPlanRepository as never,
      learningProgressReadPort as never,
      makeLogger() as never,
    );

    const result = await handler.handle(
      GetLearningProgressQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student }),
    );
    expect(result.completedTasks).toBe(5);
  });
});

describe("GetStudyScheduleHandler", () => {
  it("resuelve el plan activo y devuelve su StudySchedule (relación 1:1, modelo de escritura)", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    const plan = buildActivePlan();
    learningPlanRepository.findActiveByStudentId.mockResolvedValue(plan);
    const studyScheduleRepository = makeStudyScheduleRepository();
    const schedule = StudySchedule.create({
      id: StudyScheduleId.create(APP_FIXTURE_IDS.schedule),
      learningPlanId: plan.id,
      frequency: StudyFrequency.create({ daysPerWeek: 4, sessionsPerDay: 1, minutesPerSession: 25 }),
    });
    studyScheduleRepository.findByLearningPlanId.mockResolvedValue(schedule);
    const handler = new GetStudyScheduleHandler(
      learningPlanRepository as never,
      studyScheduleRepository as never,
      makeLogger() as never,
    );

    const result = await handler.handle(GetStudyScheduleQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student }));
    expect(result.daysPerWeek).toBe(4);
  });
});
