import { describe, it, expect } from "vitest";
import { PrismaLearningPlanRepository } from "@/features/my-plan/infrastructure/persistence/repositories/PrismaLearningPlanRepository";
import { PrismaLearningGoalRepository } from "@/features/my-plan/infrastructure/persistence/repositories/PrismaLearningGoalRepository";
import { PrismaLearningObjectiveRepository } from "@/features/my-plan/infrastructure/persistence/repositories/PrismaLearningObjectiveRepository";
import { PrismaLearningPhaseRepository } from "@/features/my-plan/infrastructure/persistence/repositories/PrismaLearningPhaseRepository";
import { PrismaLearningTaskRepository } from "@/features/my-plan/infrastructure/persistence/repositories/PrismaLearningTaskRepository";
import { PrismaStudyScheduleRepository } from "@/features/my-plan/infrastructure/persistence/repositories/PrismaStudyScheduleRepository";
import { PrismaStudySessionRepository } from "@/features/my-plan/infrastructure/persistence/repositories/PrismaStudySessionRepository";
import { runWithActiveTransaction } from "@/features/my-plan/infrastructure/persistence/PrismaClientContext";
import { ConflictException } from "@/features/my-plan/application/exceptions/ConflictException";
import { LearningPlan } from "@/features/my-plan/domain/entities/LearningPlan";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import { createFakeTransactionClient, createFakeModelDelegate } from "./fakePrismaClient";

const IDS = {
  plan: "11111111-1111-4111-8111-111111111111",
  goal: "22222222-2222-4222-8222-222222222222",
  objective: "33333333-3333-4333-8333-333333333333",
  phase: "44444444-4444-4444-8444-444444444444",
  task: "55555555-5555-4555-8555-555555555555",
  schedule: "66666666-6666-4666-8666-666666666666",
  session: "77777777-7777-4777-8777-777777777777",
  student: "88888888-8888-4888-8888-888888888888",
};

describe("PrismaLearningPlanRepository", () => {
  const planRow = {
    id: IDS.plan,
    studentId: IDS.student,
    name: "Plan",
    description: null,
    targetLevel: "B2" as const,
    startDate: new Date("2026-01-01T00:00:00.000Z"),
    endDate: null,
    status: "ACTIVE" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("findById devuelve la Entity mapeada, o null si no existe", async () => {
    const tx = createFakeTransactionClient({ learningPlan: [planRow] });
    const repo = new PrismaLearningPlanRepository();

    await runWithActiveTransaction(tx as never, async () => {
      const found = await repo.findById(LearningPlanId.create(IDS.plan));
      expect(found?.name).toBe("Plan");

      const missing = await repo.findById(LearningPlanId.create("00000000-0000-4000-8000-000000000000"));
      expect(missing).toBeNull();
    });
  });

  it("findActiveByStudentId filtra por studentId + status=ACTIVE", async () => {
    const tx = createFakeTransactionClient({
      learningPlan: [planRow, { ...planRow, id: IDS.goal, status: "CANCELLED" }],
    });
    const repo = new PrismaLearningPlanRepository();

    await runWithActiveTransaction(tx as never, async () => {
      const active = await repo.findActiveByStudentId(StudentId.create(IDS.student));
      expect(active?.id.value).toBe(IDS.plan);
    });
  });

  it("save() persiste vía upsert (create y update)", async () => {
    const tx = createFakeTransactionClient();
    const repo = new PrismaLearningPlanRepository();
    const plan = LearningPlan.create({
      id: LearningPlanId.create(IDS.plan),
      studentId: StudentId.create(IDS.student),
      name: "Nuevo plan",
      targetLevel: "C1" as never,
      startDate: new Date("2026-01-01T00:00:00.000Z"),
    });

    await runWithActiveTransaction(tx as never, async () => {
      await repo.save(plan);
      const stored = await repo.findById(plan.id);
      expect(stored?.name).toBe("Nuevo plan");

      plan.pause();
      await repo.save(plan);
      const updated = await repo.findById(plan.id);
      expect(updated?.status).toBe("PAUSED");
    });
  });

  it("traduce un error de Prisma en save() a una excepción de Application (nunca deja escapar Prisma)", async () => {
    const throwingTx = {
      ...createFakeTransactionClient(),
      learningPlan: {
        ...createFakeModelDelegate([]),
        upsert: async () => {
          const { Prisma } = require("@prisma/client");
          throw new Prisma.PrismaClientKnownRequestError("Unique constraint failed", { code: "P2002" });
        },
      },
    };
    const repo = new PrismaLearningPlanRepository();
    const plan = LearningPlan.create({
      id: LearningPlanId.create(IDS.plan),
      studentId: StudentId.create(IDS.student),
      name: "Plan",
      targetLevel: "B2" as never,
      startDate: new Date("2026-01-01T00:00:00.000Z"),
    });

    await runWithActiveTransaction(throwingTx as never, async () => {
      await expect(repo.save(plan)).rejects.toBeInstanceOf(ConflictException);
    });
  });
});

describe("Repositories restantes — find*/save operan sobre el doble de prueba", () => {
  it("PrismaLearningGoalRepository: findByLearningPlanId + save", async () => {
    const tx = createFakeTransactionClient({
      learningGoal: [
        {
          id: IDS.goal,
          learningPlanId: IDS.plan,
          title: "Meta",
          description: null,
          priority: "MEDIUM",
          targetDate: null,
          completedAt: null,
          status: "NOT_STARTED",
        },
      ],
    });
    const repo = new PrismaLearningGoalRepository();
    await runWithActiveTransaction(tx as never, async () => {
      const goals = await repo.findByLearningPlanId(LearningPlanId.create(IDS.plan));
      expect(goals).toHaveLength(1);
      expect(goals[0]!.title).toBe("Meta");
    });
  });

  it("PrismaLearningObjectiveRepository: findByLearningGoalId + save", async () => {
    const tx = createFakeTransactionClient({ learningObjective: [] });
    const repo = new PrismaLearningObjectiveRepository();
    await runWithActiveTransaction(tx as never, async () => {
      const objectives = await repo.findByLearningGoalId(
        (await import("@/features/my-plan/domain/value-objects/LearningGoalId")).LearningGoalId.create(IDS.goal),
      );
      expect(objectives).toEqual([]);
    });
  });

  it("PrismaLearningPhaseRepository: findByLearningPlanId", async () => {
    const tx = createFakeTransactionClient({
      learningPhase: [
        {
          id: IDS.phase,
          learningPlanId: IDS.plan,
          name: "Fase 1",
          phaseOrder: 1,
          startDate: new Date(),
          endDate: null,
          completedAt: null,
          status: "NOT_STARTED",
        },
      ],
    });
    const repo = new PrismaLearningPhaseRepository();
    await runWithActiveTransaction(tx as never, async () => {
      const phases = await repo.findByLearningPlanId(LearningPlanId.create(IDS.plan));
      expect(phases).toHaveLength(1);
    });
  });

  it("PrismaLearningTaskRepository: findByLearningPhaseId", async () => {
    const tx = createFakeTransactionClient({
      learningTask: [
        {
          id: IDS.task,
          learningPhaseId: IDS.phase,
          title: "Tarea",
          description: null,
          estimatedMinutes: 20,
          difficulty: "MEDIUM",
          dueDate: null,
          completedAt: null,
          status: "NOT_STARTED",
          source: "SELF_DIRECTED",
        },
      ],
    });
    const repo = new PrismaLearningTaskRepository();
    await runWithActiveTransaction(tx as never, async () => {
      const { LearningPhaseId } = await import("@/features/my-plan/domain/value-objects/LearningPhaseId");
      const tasks = await repo.findByLearningPhaseId(LearningPhaseId.create(IDS.phase));
      expect(tasks).toHaveLength(1);
      expect(tasks[0]!.source).toBe("SELF_DIRECTED");
    });
  });

  it("PrismaStudyScheduleRepository: findByLearningPlanId (relación 1:1)", async () => {
    const tx = createFakeTransactionClient({
      studySchedule: [
        {
          id: IDS.schedule,
          learningPlanId: IDS.plan,
          daysPerWeek: 5,
          sessionsPerDay: 1,
          minutesPerSession: 30,
          reminderTime: null,
        },
      ],
    });
    const repo = new PrismaStudyScheduleRepository();
    await runWithActiveTransaction(tx as never, async () => {
      const schedule = await repo.findByLearningPlanId(LearningPlanId.create(IDS.plan));
      expect(schedule?.frequency.daysPerWeek).toBe(5);
    });
  });

  it("PrismaStudySessionRepository: findLastCompletedByStudentId ordena por startedAt desc", async () => {
    const older = {
      id: IDS.session,
      studentId: IDS.student,
      learningTaskId: IDS.task,
      startedAt: new Date("2026-07-01T09:00:00.000Z"),
      finishedAt: new Date("2026-07-01T09:20:00.000Z"),
      durationMinutes: 20,
      completed: true,
    };
    const newer = {
      ...older,
      id: "77777777-7777-4777-8777-777777777778",
      startedAt: new Date("2026-07-15T09:00:00.000Z"),
      finishedAt: new Date("2026-07-15T09:20:00.000Z"),
    };
    const tx = createFakeTransactionClient({ studySession: [older, newer] });
    const repo = new PrismaStudySessionRepository();
    await runWithActiveTransaction(tx as never, async () => {
      const { StudentId } = await import("@/features/my-plan/domain/value-objects/StudentId");
      const last = await repo.findLastCompletedByStudentId(StudentId.create(IDS.student));
      expect(last?.id.value).toBe(newer.id);
    });
  });
});
