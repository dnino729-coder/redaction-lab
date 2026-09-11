// Mocks compartidos de los puertos de la Application Layer de Academia —
// mismo criterio que tests/unit/my-plan/application/mocks.ts (ningún
// mock toca infraestructura real; cada `vi.fn()` implementa el contrato
// mínimo necesario para que los handlers bajo prueba compilen y se
// comporten como con un adaptador real en memoria).
import { vi } from "vitest";
import type { Attempt } from "@/features/academy/domain/aggregates/Attempt";
import type { AcademyUnit } from "@/features/academy/domain/aggregates/AcademyUnit";
import type { TeacherRecommendation } from "@/features/academy/domain/entities/TeacherRecommendation";

export function makeUnitOfWork() {
  return {
    execute: vi.fn(async (work: () => Promise<unknown>) => work()),
  };
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

export function makeDomainEventPublisher() {
  return {
    appendFrom: vi.fn(async (): Promise<void> => {}),
  };
}

export function makeAttemptRepository() {
  return {
    findById: vi.fn(async (): Promise<Attempt | null> => null),
    findByIdWithFullHistory: vi.fn(async (): Promise<Attempt | null> => null),
    findActiveByUnitId: vi.fn(async (): Promise<Attempt | null> => null),
    findAllByUnitId: vi.fn(async (): Promise<Attempt[]> => []),
    save: vi.fn(async (_attempt: Attempt): Promise<void> => {
      void _attempt;
    }),
  };
}

export function makeAcademyUnitRepository() {
  return {
    findById: vi.fn(async (): Promise<AcademyUnit | null> => null),
    findAllByStudentId: vi.fn(async (): Promise<AcademyUnit[]> => []),
    findByStudentTextTypeAndPosition: vi.fn(async (): Promise<AcademyUnit | null> => null),
    save: vi.fn(async (_unit: AcademyUnit): Promise<void> => {
      void _unit;
    }),
  };
}

export function makeAuthorizationGuard() {
  return {
    assertUnitOwnership: vi.fn(async (): Promise<AcademyUnit> => {
      throw new Error(
        "makeAuthorizationGuard: assertUnitOwnership sin mockResolvedValue en el test.",
      );
    }),
    assertAttemptOwnership: vi.fn(async (): Promise<Attempt> => {
      throw new Error(
        "makeAuthorizationGuard: assertAttemptOwnership sin mockResolvedValue en el test.",
      );
    }),
    assertTeacherRelationship: vi.fn(async (): Promise<void> => {}),
  };
}

export function makeMiPlanTaskLookupPort() {
  return {
    findLinkedTaskId: vi.fn(async (): Promise<string | null> => null),
  };
}

export function makeTeacherRecommendationRepository() {
  return {
    findById: vi.fn(async (): Promise<TeacherRecommendation | null> => null),
    findByStudentId: vi.fn(async (): Promise<TeacherRecommendation[]> => []),
    create: vi.fn(async (_recommendation: TeacherRecommendation): Promise<void> => {
      void _recommendation;
    }),
  };
}
