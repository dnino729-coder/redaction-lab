// Mocks compartidos de los puertos de la Application Layer de Mi Plan
// (Sprint 3.3.3) — ninguno toca infraestructura real. Cada `vi.fn()`
// implementa el contrato mínimo necesario para que los handlers bajo
// prueba compilen y se comporten como con un adaptador real en memoria.
import { vi } from "vitest";

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
  return { publish: vi.fn(async () => undefined) };
}

function makeRepoBase<T>() {
  return {
    findById: vi.fn<[unknown], Promise<T | null>>(async () => null),
    save: vi.fn<[T], Promise<void>>(async () => undefined),
  };
}

export function makeLearningPlanRepository() {
  return {
    ...makeRepoBase(),
    findActiveByStudentId: vi.fn(async () => null),
  };
}

export function makeLearningGoalRepository() {
  return {
    ...makeRepoBase(),
    findByLearningPlanId: vi.fn(async () => []),
    findByLearningPlanIds: vi.fn(async () => []),
  };
}

export function makeLearningObjectiveRepository() {
  return {
    ...makeRepoBase(),
    findByLearningGoalId: vi.fn(async () => []),
  };
}

export function makeLearningPhaseRepository() {
  return {
    ...makeRepoBase(),
    findByLearningPlanId: vi.fn(async () => []),
  };
}

export function makeLearningTaskRepository() {
  return {
    ...makeRepoBase(),
    findByLearningPhaseId: vi.fn(async () => []),
  };
}

export function makeStudyScheduleRepository() {
  return {
    ...makeRepoBase(),
    findByLearningPlanId: vi.fn(async () => null),
  };
}

export function makeStudySessionRepository() {
  return {
    ...makeRepoBase(),
    findByLearningTaskId: vi.fn(async () => []),
    findLastCompletedByStudentId: vi.fn(async () => null),
  };
}

export function makeDailyPlanReadPort() {
  return { findByLearningPlanIdAndDate: vi.fn(async () => null) };
}

export function makeWeeklyPlanReadPort() {
  return { findByLearningPlanIdAndWeekNumber: vi.fn(async () => null) };
}

export function makeLearningProgressReadPort() {
  return { findByLearningPlanId: vi.fn(async () => null) };
}
