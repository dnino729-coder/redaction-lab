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
import { GetLearningGoalsHandler } from "@/features/my-plan/application/handlers/GetLearningGoalsHandler";
import { GetLearningGoalsQuery } from "@/features/my-plan/application/queries/GetLearningGoalsQuery";
import { ResourceNotFoundException } from "@/features/my-plan/application/exceptions/ResourceNotFoundException";
import { ValidationException } from "@/features/my-plan/application/exceptions/ValidationException";
import { LearningPlan } from "@/features/my-plan/domain/entities/LearningPlan";
import { LearningGoal } from "@/features/my-plan/domain/entities/LearningGoal";
import { StudySchedule } from "@/features/my-plan/domain/entities/StudySchedule";
import { StudyFrequency } from "@/features/my-plan/domain/value-objects/StudyFrequency";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import { LearningGoalId } from "@/features/my-plan/domain/value-objects/LearningGoalId";
import { StudyScheduleId } from "@/features/my-plan/domain/value-objects/StudyScheduleId";
import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import { GoalPriority } from "@/features/my-plan/domain/enums/GoalPriority";
import {
  makeLearningPlanRepository,
  makeLearningGoalRepository,
  makeStudyScheduleRepository,
  makeDailyPlanReadPort,
  makeWeeklyPlanReadPort,
  makeLearningProgressReadPort,
  makeUnitOfWork,
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
  it("devuelve el plan activo del estudiante, leyendo bajo el contexto RLS del propio estudiante (18.24)", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    learningPlanRepository.findActiveByStudentId.mockResolvedValue(buildActivePlan());
    const unitOfWork = makeUnitOfWork();
    const handler = new GetActiveLearningPlanHandler(
      learningPlanRepository as never,
      unitOfWork as never,
      makeLogger() as never,
    );

    const result = await handler.handle(
      GetActiveLearningPlanQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student }),
    );
    expect(result.id).toBe(APP_FIXTURE_IDS.plan);
    expect(unitOfWork.execute).toHaveBeenCalledWith(expect.any(Function), APP_FIXTURE_IDS.student);
  });

  it("lanza ResourceNotFoundException si no hay plan activo", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    const handler = new GetActiveLearningPlanHandler(
      learningPlanRepository as never,
      makeUnitOfWork() as never,
      makeLogger() as never,
    );

    await expect(
      handler.handle(
        GetActiveLearningPlanQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student }),
      ),
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
    const unitOfWork = makeUnitOfWork();
    const handler = new GetDailyPlanHandler(
      learningPlanRepository as never,
      dailyPlanReadPort as never,
      unitOfWork as never,
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
    expect(unitOfWork.execute).toHaveBeenCalledWith(expect.any(Function), APP_FIXTURE_IDS.student);
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
    const unitOfWork = makeUnitOfWork();
    const handler = new GetWeeklyPlanHandler(
      learningPlanRepository as never,
      weeklyPlanReadPort as never,
      unitOfWork as never,
      makeLogger() as never,
    );

    const result = await handler.handle(
      GetWeeklyPlanQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student, weekNumber: 3 }),
    );
    expect(result.weekNumber).toBe(3);
    expect(unitOfWork.execute).toHaveBeenCalledWith(expect.any(Function), APP_FIXTURE_IDS.student);
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
    const unitOfWork = makeUnitOfWork();
    const handler = new GetLearningProgressHandler(
      learningPlanRepository as never,
      learningProgressReadPort as never,
      unitOfWork as never,
      makeLogger() as never,
    );

    const result = await handler.handle(
      GetLearningProgressQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student }),
    );
    expect(result.completedTasks).toBe(5);
    expect(unitOfWork.execute).toHaveBeenCalledWith(expect.any(Function), APP_FIXTURE_IDS.student);
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
      frequency: StudyFrequency.create({
        daysPerWeek: 4,
        sessionsPerDay: 1,
        minutesPerSession: 25,
      }),
    });
    studyScheduleRepository.findByLearningPlanId.mockResolvedValue(schedule);
    const unitOfWork = makeUnitOfWork();
    const handler = new GetStudyScheduleHandler(
      learningPlanRepository as never,
      studyScheduleRepository as never,
      unitOfWork as never,
      makeLogger() as never,
    );

    const result = await handler.handle(
      GetStudyScheduleQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student }),
    );
    expect(result.daysPerWeek).toBe(4);
    expect(unitOfWork.execute).toHaveBeenCalledWith(expect.any(Function), APP_FIXTURE_IDS.student);
  });
});

function buildGoal(
  idSuffix: string,
  title: string,
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
) {
  const goal = LearningGoal.create({
    id: LearningGoalId.create(`22222222-2222-4222-8222-2222222222${idSuffix}`),
    learningPlanId: LearningPlanId.create(APP_FIXTURE_IDS.plan),
    title,
    priority: GoalPriority.MEDIUM,
  });
  if (status === "IN_PROGRESS") goal.recalculateStatus(["IN_PROGRESS" as never], new Date());
  if (status === "COMPLETED") goal.recalculateStatus(["COMPLETED" as never], new Date());
  if (status === "CANCELLED") goal.cancel();
  return goal;
}

describe("GetLearningGoalsHandler", () => {
  it("1. plan activo con un único goal activo: lo devuelve en `active`, `completed` vacío", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    learningPlanRepository.findActiveByStudentId.mockResolvedValue(buildActivePlan());
    const learningGoalRepository = makeLearningGoalRepository();
    learningGoalRepository.findByLearningPlanId.mockResolvedValue([
      buildGoal("01", "Meta 1", "NOT_STARTED"),
    ]);
    const unitOfWork = makeUnitOfWork();
    const handler = new GetLearningGoalsHandler(
      learningPlanRepository as never,
      learningGoalRepository as never,
      unitOfWork as never,
      makeLogger() as never,
    );

    const result = await handler.handle(
      GetLearningGoalsQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student }),
    );
    expect(result.active).toHaveLength(1);
    expect(result.completed).toHaveLength(0);
    expect(result.active[0]).toEqual({
      id: expect.any(String),
      title: "Meta 1",
      priority: "MEDIUM",
      status: "NOT_STARTED",
    });
    expect(unitOfWork.execute).toHaveBeenCalledWith(expect.any(Function), APP_FIXTURE_IDS.student);
  });

  it("2/6. separa correctamente goals activos y completados, y excluye CANCELLED de ambos grupos", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    const plan = buildActivePlan();
    learningPlanRepository.findActiveByStudentId.mockResolvedValue(plan);
    const learningGoalRepository = makeLearningGoalRepository();
    learningGoalRepository.findByLearningPlanId.mockResolvedValue([
      buildGoal("01", "Not started", "NOT_STARTED"),
      buildGoal("02", "In progress", "IN_PROGRESS"),
      buildGoal("03", "Completed", "COMPLETED"),
      buildGoal("04", "Cancelled", "CANCELLED"),
    ]);
    const handler = new GetLearningGoalsHandler(
      learningPlanRepository as never,
      learningGoalRepository as never,
      makeUnitOfWork() as never,
      makeLogger() as never,
    );

    const result = await handler.handle(
      GetLearningGoalsQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student }),
    );
    expect(result.active.map((g) => g.title)).toEqual(["Not started", "In progress"]);
    expect(result.completed.map((g) => g.title)).toEqual(["Completed"]);
    // El goal CANCELLED no aparece en ninguno de los dos grupos.
    expect([...result.active, ...result.completed].some((g) => g.title === "Cancelled")).toBe(
      false,
    );
  });

  it("3. sin plan activo: lanza ResourceNotFoundException y no consulta el repositorio de goals", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    const learningGoalRepository = makeLearningGoalRepository();
    const handler = new GetLearningGoalsHandler(
      learningPlanRepository as never,
      learningGoalRepository as never,
      makeUnitOfWork() as never,
      makeLogger() as never,
    );

    await expect(
      handler.handle(GetLearningGoalsQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student })),
    ).rejects.toBeInstanceOf(ResourceNotFoundException);
    expect(learningGoalRepository.findByLearningPlanId).not.toHaveBeenCalled();
  });

  it("4. el repositorio devuelve una lista vacía: responde con ambos grupos vacíos, sin lanzar", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    learningPlanRepository.findActiveByStudentId.mockResolvedValue(buildActivePlan());
    const learningGoalRepository = makeLearningGoalRepository();
    learningGoalRepository.findByLearningPlanId.mockResolvedValue([]);
    const handler = new GetLearningGoalsHandler(
      learningPlanRepository as never,
      learningGoalRepository as never,
      makeUnitOfWork() as never,
      makeLogger() as never,
    );

    const result = await handler.handle(
      GetLearningGoalsQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student }),
    );
    expect(result).toEqual({ active: [], completed: [] });
  });

  it("5. error del repositorio de goals: se propaga sin ser capturado", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    learningPlanRepository.findActiveByStudentId.mockResolvedValue(buildActivePlan());
    const learningGoalRepository = makeLearningGoalRepository();
    learningGoalRepository.findByLearningPlanId.mockRejectedValue(new Error("db down"));
    const handler = new GetLearningGoalsHandler(
      learningPlanRepository as never,
      learningGoalRepository as never,
      makeUnitOfWork() as never,
      makeLogger() as never,
    );

    await expect(
      handler.handle(GetLearningGoalsQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student })),
    ).rejects.toThrow("db down");
  });

  it("7. resuelve el learningPlanId server-side desde el plan activo del estudiante — no acepta uno externo", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    const plan = buildActivePlan();
    learningPlanRepository.findActiveByStudentId.mockResolvedValue(plan);
    const learningGoalRepository = makeLearningGoalRepository();
    learningGoalRepository.findByLearningPlanId.mockResolvedValue([]);
    const handler = new GetLearningGoalsHandler(
      learningPlanRepository as never,
      learningGoalRepository as never,
      makeUnitOfWork() as never,
      makeLogger() as never,
    );

    // GetLearningGoalsRequestDto no declara ningún campo learningPlanId —
    // la única entrada posible es studentId; el plan se resuelve aquí.
    await handler.handle(GetLearningGoalsQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student }));
    expect(learningPlanRepository.findActiveByStudentId).toHaveBeenCalledWith(
      StudentId.create(APP_FIXTURE_IDS.student),
    );
    expect(learningGoalRepository.findByLearningPlanId).toHaveBeenCalledWith(plan.id);
  });

  it("rechaza un studentId inválido antes de tocar cualquier repositorio", async () => {
    const learningPlanRepository = makeLearningPlanRepository();
    const learningGoalRepository = makeLearningGoalRepository();
    const handler = new GetLearningGoalsHandler(
      learningPlanRepository as never,
      learningGoalRepository as never,
      makeUnitOfWork() as never,
      makeLogger() as never,
    );

    await expect(
      handler.handle(GetLearningGoalsQuery.fromRequest({ studentId: "not-a-uuid" })),
    ).rejects.toBeInstanceOf(ValidationException);
    expect(learningPlanRepository.findActiveByStudentId).not.toHaveBeenCalled();
  });
});
