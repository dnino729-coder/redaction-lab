import { describe, it, expect } from "vitest";
import { LearningPlanPersistenceMapper } from "@/features/my-plan/infrastructure/persistence/mappers/LearningPlanPersistenceMapper";
import { LearningGoalPersistenceMapper } from "@/features/my-plan/infrastructure/persistence/mappers/LearningGoalPersistenceMapper";
import { LearningObjectivePersistenceMapper } from "@/features/my-plan/infrastructure/persistence/mappers/LearningObjectivePersistenceMapper";
import { LearningPhasePersistenceMapper } from "@/features/my-plan/infrastructure/persistence/mappers/LearningPhasePersistenceMapper";
import { LearningTaskPersistenceMapper } from "@/features/my-plan/infrastructure/persistence/mappers/LearningTaskPersistenceMapper";
import { StudySchedulePersistenceMapper } from "@/features/my-plan/infrastructure/persistence/mappers/StudySchedulePersistenceMapper";
import { StudySessionPersistenceMapper } from "@/features/my-plan/infrastructure/persistence/mappers/StudySessionPersistenceMapper";

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

describe("Persistence Mappers — ida y vuelta (Dominio ⇄ fila Prisma)", () => {
  it("LearningPlan: toDomain(toPersistenceData(x)) preserva todos los campos", () => {
    const row = {
      id: IDS.plan,
      studentId: IDS.student,
      name: "Plan C1",
      description: "desc",
      targetLevel: "C1" as const,
      startDate: new Date("2026-01-01T00:00:00.000Z"),
      endDate: null,
      status: "ACTIVE" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const entity = LearningPlanPersistenceMapper.toDomain(row);
    expect(entity.id.value).toBe(IDS.plan);
    expect(entity.name).toBe("Plan C1");
    expect(entity.status).toBe("ACTIVE");

    const data = LearningPlanPersistenceMapper.toPersistenceData(entity);
    expect(data.id).toBe(row.id);
    expect(data.studentId).toBe(row.studentId);
    expect(data.name).toBe(row.name);
    expect(data.targetLevel).toBe(row.targetLevel);
    expect(data.status).toBe(row.status);
  });

  it("LearningGoal: mapea priority/status/targetDate sin pérdida", () => {
    const row = {
      id: IDS.goal,
      learningPlanId: IDS.plan,
      title: "Meta",
      description: null,
      priority: "HIGH" as const,
      targetDate: new Date("2026-06-01T00:00:00.000Z"),
      completedAt: null,
      status: "IN_PROGRESS" as const,
    };
    const entity = LearningGoalPersistenceMapper.toDomain(row);
    const data = LearningGoalPersistenceMapper.toPersistenceData(entity);
    expect(data).toEqual(row);
  });

  it("LearningObjective: mapea orderNumber/completedAt sin pérdida", () => {
    const row = {
      id: IDS.objective,
      learningGoalId: IDS.goal,
      title: "Objetivo",
      description: null,
      orderNumber: 1,
      completedAt: null,
      status: "NOT_STARTED" as const,
    };
    const data = LearningObjectivePersistenceMapper.toPersistenceData(
      LearningObjectivePersistenceMapper.toDomain(row),
    );
    expect(data).toEqual(row);
  });

  it("LearningPhase: mapea phaseOrder/fechas sin pérdida", () => {
    const row = {
      id: IDS.phase,
      learningPlanId: IDS.plan,
      name: "Fase 1",
      phaseOrder: 1,
      startDate: new Date("2026-01-01T00:00:00.000Z"),
      endDate: new Date("2026-02-01T00:00:00.000Z"),
      completedAt: null,
      status: "NOT_STARTED" as const,
    };
    const data = LearningPhasePersistenceMapper.toPersistenceData(LearningPhasePersistenceMapper.toDomain(row));
    expect(data).toEqual(row);
  });

  it("LearningTask: mapea difficulty/source/status sin pérdida", () => {
    const row = {
      id: IDS.task,
      learningPhaseId: IDS.phase,
      title: "Tarea",
      description: null,
      estimatedMinutes: 30,
      difficulty: "HARD" as const,
      dueDate: null,
      completedAt: null,
      status: "NOT_STARTED" as const,
      source: "ACADEMY" as const,
    };
    const data = LearningTaskPersistenceMapper.toPersistenceData(LearningTaskPersistenceMapper.toDomain(row));
    expect(data).toEqual(row);
  });

  it("StudySchedule: reminder_time (TIME) ida y vuelta preserva hora/minuto exactos", () => {
    const row = {
      id: IDS.schedule,
      learningPlanId: IDS.plan,
      daysPerWeek: 5,
      sessionsPerDay: 1,
      minutesPerSession: 30,
      reminderTime: new Date(Date.UTC(1970, 0, 1, 8, 30, 0)),
    };
    const entity = StudySchedulePersistenceMapper.toDomain(row);
    expect(entity.reminderTime?.hour).toBe(8);
    expect(entity.reminderTime?.minute).toBe(30);

    const data = StudySchedulePersistenceMapper.toPersistenceData(entity);
    expect(data.reminderTime?.toISOString()).toBe(row.reminderTime.toISOString());
  });

  it("StudySchedule: reminderTime null se preserva como null", () => {
    const row = {
      id: IDS.schedule,
      learningPlanId: IDS.plan,
      daysPerWeek: 3,
      sessionsPerDay: 1,
      minutesPerSession: 20,
      reminderTime: null,
    };
    const data = StudySchedulePersistenceMapper.toPersistenceData(StudySchedulePersistenceMapper.toDomain(row));
    expect(data.reminderTime).toBeNull();
  });

  it("StudySession: duration_minutes null/no-null ida y vuelta", () => {
    const openRow = {
      id: IDS.session,
      studentId: IDS.student,
      learningTaskId: IDS.task,
      startedAt: new Date("2026-07-19T09:00:00.000Z"),
      finishedAt: null,
      durationMinutes: null,
      completed: false,
    };
    expect(
      StudySessionPersistenceMapper.toPersistenceData(StudySessionPersistenceMapper.toDomain(openRow)),
    ).toEqual(openRow);

    const closedRow = {
      ...openRow,
      finishedAt: new Date("2026-07-19T09:25:00.000Z"),
      durationMinutes: 25,
      completed: true,
    };
    expect(
      StudySessionPersistenceMapper.toPersistenceData(StudySessionPersistenceMapper.toDomain(closedRow)),
    ).toEqual(closedRow);
  });
});
