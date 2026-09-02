// Mocks compartidos de los puertos de la Application Layer de Mi Plan
// (Sprint 3.3.3) — ninguno toca infraestructura real. Cada `vi.fn()`
// implementa el contrato mínimo necesario para que los handlers bajo
// prueba compilen y se comporten como con un adaptador real en memoria.
import { vi } from "vitest";
import type { LearningPlan } from "@/features/my-plan/domain/entities/LearningPlan";
import type { LearningGoal } from "@/features/my-plan/domain/entities/LearningGoal";
import type { LearningObjective } from "@/features/my-plan/domain/entities/LearningObjective";
import type { LearningPhase } from "@/features/my-plan/domain/entities/LearningPhase";
import type { LearningTask } from "@/features/my-plan/domain/entities/LearningTask";
import type { StudySchedule } from "@/features/my-plan/domain/entities/StudySchedule";
import type { StudySession } from "@/features/my-plan/domain/entities/StudySession";
import type { DomainEvent } from "@/features/my-plan/domain/events/DomainEvent";
import type { DailyPlanReadModel } from "@/features/my-plan/application/dto/DailyPlanDto";
import type { WeeklyPlanReadModel } from "@/features/my-plan/application/dto/WeeklyPlanDto";
import type { LearningProgressReadModel } from "@/features/my-plan/application/dto/LearningProgressDto";

export function makeUnitOfWork() {
  return {
    execute: vi.fn(async (work: () => Promise<unknown>) => work()),
  };
}

export function makeClock(fixedNow: Date) {
  return { now: vi.fn(() => fixedNow) };
}

export function makeUuidGenerator(ids: readonly string[]) {
  let index = 0;
  return {
    generate: vi.fn(() => {
      const id = ids[index] ?? `generated-${index}`;
      index += 1;
      return id;
    }),
  };
}

export function makeLogger() {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

export function makeEventBus() {
  return {
    publish: vi.fn(async (_events: readonly DomainEvent[]): Promise<void> => {
      void _events;
    }),
  };
}

function makeRepoBase<T>() {
  return {
    findById: vi.fn(async (_id: unknown): Promise<T | null> => {
      void _id;
      return null;
    }),
    save: vi.fn(async (_entity: T): Promise<void> => {
      void _entity;
    }),
  };
}

export function makeLearningPlanRepository() {
  return {
    ...makeRepoBase<LearningPlan>(),
    findActiveByStudentId: vi.fn(async (): Promise<LearningPlan | null> => null),
  };
}

export function makeLearningGoalRepository() {
  return {
    ...makeRepoBase<LearningGoal>(),
    findByLearningPlanId: vi.fn(async (): Promise<LearningGoal[]> => []),
    findByLearningPlanIds: vi.fn(async (): Promise<LearningGoal[]> => []),
  };
}

export function makeLearningObjectiveRepository() {
  return {
    ...makeRepoBase<LearningObjective>(),
    findByLearningGoalId: vi.fn(async (): Promise<LearningObjective[]> => []),
  };
}

export function makeLearningPhaseRepository() {
  return {
    ...makeRepoBase<LearningPhase>(),
    findByLearningPlanId: vi.fn(async (): Promise<LearningPhase[]> => []),
  };
}

export function makeLearningTaskRepository() {
  return {
    ...makeRepoBase<LearningTask>(),
    findByLearningPhaseId: vi.fn(async (): Promise<LearningTask[]> => []),
  };
}

export function makeStudyScheduleRepository() {
  return {
    ...makeRepoBase<StudySchedule>(),
    findByLearningPlanId: vi.fn(async (): Promise<StudySchedule | null> => null),
  };
}

export function makeStudySessionRepository() {
  return {
    ...makeRepoBase<StudySession>(),
    findByLearningTaskId: vi.fn(async (): Promise<StudySession[]> => []),
    findLastCompletedByStudentId: vi.fn(async (): Promise<StudySession | null> => null),
  };
}

export function makeDailyPlanReadPort() {
  return { findByLearningPlanIdAndDate: vi.fn(async (): Promise<DailyPlanReadModel | null> => null) };
}

export function makeWeeklyPlanReadPort() {
  return { findByLearningPlanIdAndWeekNumber: vi.fn(async (): Promise<WeeklyPlanReadModel | null> => null) };
}

export function makeLearningProgressReadPort() {
  return { findByLearningPlanId: vi.fn(async (): Promise<LearningProgressReadModel | null> => null) };
}
