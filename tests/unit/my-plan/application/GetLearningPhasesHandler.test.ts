import { describe, it, expect } from "vitest";
import { GetLearningPhasesHandler } from "@/features/my-plan/application/handlers/GetLearningPhasesHandler";
import { GetLearningPhasesQuery } from "@/features/my-plan/application/queries/GetLearningPhasesQuery";
import { ResourceNotFoundException } from "@/features/my-plan/application/exceptions/ResourceNotFoundException";
import { ValidationException } from "@/features/my-plan/application/exceptions/ValidationException";
import { LearningPlan } from "@/features/my-plan/domain/entities/LearningPlan";
import { LearningPhase } from "@/features/my-plan/domain/entities/LearningPhase";
import { LearningTask } from "@/features/my-plan/domain/entities/LearningTask";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import { LearningPhaseId } from "@/features/my-plan/domain/value-objects/LearningPhaseId";
import { LearningTaskId } from "@/features/my-plan/domain/value-objects/LearningTaskId";
import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import {
  makeLearningPlanRepository,
  makeLearningPhaseRepository,
  makeLearningTaskRepository,
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

function buildPhase(id: string, phaseOrder: number, name = "Phase") {
  return LearningPhase.create({
    id: LearningPhaseId.create(id),
    learningPlanId: LearningPlanId.create(APP_FIXTURE_IDS.plan),
    name,
    phaseOrder,
    startDate: new Date("2026-01-01T00:00:00.000Z"),
  });
}

function buildTask(id: string, learningPhaseId: string, title = "Task") {
  return LearningTask.create({
    id: LearningTaskId.create(id),
    learningPhaseId: LearningPhaseId.create(learningPhaseId),
    title,
    estimatedMinutes: 30,
  });
}

function buildHandler() {
  const learningPlanRepository = makeLearningPlanRepository();
  const learningPhaseRepository = makeLearningPhaseRepository();
  const learningTaskRepository = makeLearningTaskRepository();
  const unitOfWork = makeUnitOfWork();
  const logger = makeLogger();

  const handler = new GetLearningPhasesHandler(
    learningPlanRepository as never,
    learningPhaseRepository as never,
    learningTaskRepository as never,
    unitOfWork as never,
    logger as never,
  );

  return {
    handler,
    learningPlanRepository,
    learningPhaseRepository,
    learningTaskRepository,
    unitOfWork,
  };
}

describe("GetLearningPhasesHandler", () => {
  it("1. plan activo con una fase y una tarea: devuelve la estructura esperada", async () => {
    const { handler, learningPlanRepository, learningPhaseRepository, learningTaskRepository } =
      buildHandler();
    learningPlanRepository.findActiveByStudentId.mockResolvedValue(buildActivePlan());
    learningPhaseRepository.findByLearningPlanId.mockResolvedValue([
      buildPhase(APP_FIXTURE_IDS.phase, 1, "Phase 1"),
    ]);
    learningTaskRepository.findByLearningPhaseId.mockResolvedValue([
      buildTask(APP_FIXTURE_IDS.task, APP_FIXTURE_IDS.phase, "Task 1"),
    ]);

    const result = await handler.handle(
      GetLearningPhasesQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student }),
    );

    expect(result).toEqual({
      phases: [
        {
          id: APP_FIXTURE_IDS.phase,
          name: "Phase 1",
          status: "NOT_STARTED",
          tasks: [
            {
              id: APP_FIXTURE_IDS.task,
              title: "Task 1",
              status: "NOT_STARTED",
              source: "SELF_DIRECTED",
            },
          ],
        },
      ],
    });
  });

  it("2. plan activo con múltiples fases: devuelve todas, ordenadas por phaseOrder ascendente", async () => {
    const { handler, learningPlanRepository, learningPhaseRepository, learningTaskRepository } =
      buildHandler();
    learningPlanRepository.findActiveByStudentId.mockResolvedValue(buildActivePlan());
    // Se devuelven deliberadamente fuera de orden para probar que el
    // Handler las reordena por phaseOrder, no confía en el orden del
    // repositorio.
    learningPhaseRepository.findByLearningPlanId.mockResolvedValue([
      buildPhase(APP_FIXTURE_IDS.phase, 2, "Phase 2"),
      buildPhase("11111111-1111-4111-8111-111111111199", 1, "Phase 1"),
    ]);
    learningTaskRepository.findByLearningPhaseId.mockResolvedValue([]);

    const result = await handler.handle(
      GetLearningPhasesQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student }),
    );

    expect(result.phases.map((p) => p.name)).toEqual(["Phase 1", "Phase 2"]);
  });

  it("3. cada fase contiene sus propias tareas (no mezcladas entre fases)", async () => {
    const { handler, learningPlanRepository, learningPhaseRepository, learningTaskRepository } =
      buildHandler();
    learningPlanRepository.findActiveByStudentId.mockResolvedValue(buildActivePlan());
    const phaseA = APP_FIXTURE_IDS.phase;
    const phaseB = "11111111-1111-4111-8111-111111111198";
    learningPhaseRepository.findByLearningPlanId.mockResolvedValue([
      buildPhase(phaseA, 1, "Phase A"),
      buildPhase(phaseB, 2, "Phase B"),
    ]);
    // El Handler procesa las fases ya ordenadas (Phase A, phaseOrder=1,
    // primero) — se encadenan las respuestas mockResolvedValueOnce en ese
    // mismo orden en vez de inspeccionar el argumento recibido.
    learningTaskRepository.findByLearningPhaseId
      .mockResolvedValueOnce([buildTask(APP_FIXTURE_IDS.task, phaseA, "Task A")])
      .mockResolvedValueOnce([buildTask(APP_FIXTURE_IDS.task2, phaseB, "Task B")]);

    const result = await handler.handle(
      GetLearningPhasesQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student }),
    );

    expect(result.phases[0]!.tasks.map((t) => t.title)).toEqual(["Task A"]);
    expect(result.phases[1]!.tasks.map((t) => t.title)).toEqual(["Task B"]);
  });

  it("4. lista de fases vacía: devuelve un read model con phases: []", async () => {
    const { handler, learningPlanRepository, learningPhaseRepository } = buildHandler();
    learningPlanRepository.findActiveByStudentId.mockResolvedValue(buildActivePlan());
    learningPhaseRepository.findByLearningPlanId.mockResolvedValue([]);

    const result = await handler.handle(
      GetLearningPhasesQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student }),
    );

    expect(result).toEqual({ phases: [] });
  });

  it("5. sin plan activo: lanza ResourceNotFoundException y no consulta fases/tareas", async () => {
    const { handler, learningPhaseRepository, learningTaskRepository } = buildHandler();

    await expect(
      handler.handle(GetLearningPhasesQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student })),
    ).rejects.toBeInstanceOf(ResourceNotFoundException);
    expect(learningPhaseRepository.findByLearningPlanId).not.toHaveBeenCalled();
    expect(learningTaskRepository.findByLearningPhaseId).not.toHaveBeenCalled();
  });

  it("6. error del repositorio de fases: se propaga sin ser capturado", async () => {
    const { handler, learningPlanRepository, learningPhaseRepository } = buildHandler();
    learningPlanRepository.findActiveByStudentId.mockResolvedValue(buildActivePlan());
    learningPhaseRepository.findByLearningPlanId.mockRejectedValue(new Error("db down"));

    await expect(
      handler.handle(GetLearningPhasesQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student })),
    ).rejects.toThrow("db down");
  });

  it("7. resuelve el plan activo server-side (no acepta un learningPlanId externo)", async () => {
    const { handler, learningPlanRepository, learningPhaseRepository } = buildHandler();
    const plan = buildActivePlan();
    learningPlanRepository.findActiveByStudentId.mockResolvedValue(plan);
    learningPhaseRepository.findByLearningPlanId.mockResolvedValue([]);

    // GetLearningPhasesRequestDto no declara ningún campo learningPlanId —
    // la única entrada posible es studentId.
    await handler.handle(
      GetLearningPhasesQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student }),
    );

    expect(learningPlanRepository.findActiveByStudentId).toHaveBeenCalledWith(
      StudentId.create(APP_FIXTURE_IDS.student),
    );
    expect(learningPhaseRepository.findByLearningPlanId).toHaveBeenCalledWith(plan.id);
  });

  it("8. el estudiante no puede seleccionar otro plan: la query solo acepta studentId", async () => {
    const request: { studentId: string; learningPlanId?: string } = {
      studentId: APP_FIXTURE_IDS.student,
      learningPlanId: "99999999-9999-4999-8999-999999999999",
    };
    const { handler, learningPlanRepository, learningPhaseRepository } = buildHandler();
    learningPlanRepository.findActiveByStudentId.mockResolvedValue(buildActivePlan());
    learningPhaseRepository.findByLearningPlanId.mockResolvedValue([]);

    // Aun si el llamante intenta inyectar learningPlanId en el DTO, el
    // Handler lo ignora por completo — nunca lo lee.
    await handler.handle(GetLearningPhasesQuery.fromRequest(request as never));

    expect(learningPlanRepository.findActiveByStudentId).toHaveBeenCalledWith(
      StudentId.create(APP_FIXTURE_IDS.student),
    );
  });

  it("9. preserva los valores reales de status de fase y tarea (incluyendo CANCELLED)", async () => {
    const { handler, learningPlanRepository, learningPhaseRepository, learningTaskRepository } =
      buildHandler();
    learningPlanRepository.findActiveByStudentId.mockResolvedValue(buildActivePlan());
    const phase = buildPhase(APP_FIXTURE_IDS.phase, 1);
    phase.cancel();
    learningPhaseRepository.findByLearningPlanId.mockResolvedValue([phase]);
    const task = buildTask(APP_FIXTURE_IDS.task, APP_FIXTURE_IDS.phase);
    task.cancel();
    learningTaskRepository.findByLearningPhaseId.mockResolvedValue([task]);

    const result = await handler.handle(
      GetLearningPhasesQuery.fromRequest({ studentId: APP_FIXTURE_IDS.student }),
    );

    expect(result.phases[0]!.status).toBe("CANCELLED");
    expect(result.phases[0]!.tasks[0]!.status).toBe("CANCELLED");
  });

  it("10. rechaza un studentId inválido antes de tocar cualquier repositorio", async () => {
    const { handler, learningPlanRepository } = buildHandler();

    await expect(
      handler.handle(GetLearningPhasesQuery.fromRequest({ studentId: "not-a-uuid" })),
    ).rejects.toBeInstanceOf(ValidationException);
    expect(learningPlanRepository.findActiveByStudentId).not.toHaveBeenCalled();
  });
});
