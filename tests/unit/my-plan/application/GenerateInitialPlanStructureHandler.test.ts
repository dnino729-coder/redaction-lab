import { describe, it, expect } from "vitest";
import { GenerateInitialPlanStructureHandler } from "@/features/my-plan/application/handlers/GenerateInitialPlanStructureHandler";
import { GenerateInitialPlanStructureCommand } from "@/features/my-plan/application/commands/GenerateInitialPlanStructureCommand";
import { ResourceNotFoundException } from "@/features/my-plan/application/exceptions/ResourceNotFoundException";
import { ValidationException } from "@/features/my-plan/application/exceptions/ValidationException";
import { LearningPlan } from "@/features/my-plan/domain/entities/LearningPlan";
import { LearningPhase } from "@/features/my-plan/domain/entities/LearningPhase";
import { StudySchedule } from "@/features/my-plan/domain/entities/StudySchedule";
import { StudyFrequency } from "@/features/my-plan/domain/value-objects/StudyFrequency";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import { LearningPhaseId } from "@/features/my-plan/domain/value-objects/LearningPhaseId";
import { StudyScheduleId } from "@/features/my-plan/domain/value-objects/StudyScheduleId";
import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import {
  makeLearningPlanRepository,
  makeLearningPhaseRepository,
  makeLearningTaskRepository,
  makeStudyScheduleRepository,
  makeUnitOfWork,
  makeUuidGenerator,
  makeLogger,
} from "./mocks";
import { APP_FIXTURE_IDS } from "./fixtures";

function buildPlan() {
  return LearningPlan.create({
    id: LearningPlanId.create(APP_FIXTURE_IDS.plan),
    studentId: StudentId.create(APP_FIXTURE_IDS.student),
    name: "Plan",
    targetLevel: "B2" as never,
    startDate: new Date("2026-01-01T00:00:00.000Z"),
  });
}

function buildSchedule(minutesPerSession = 25) {
  return StudySchedule.create({
    id: StudyScheduleId.create(APP_FIXTURE_IDS.schedule),
    learningPlanId: LearningPlanId.create(APP_FIXTURE_IDS.plan),
    frequency: StudyFrequency.create({ daysPerWeek: 4, sessionsPerDay: 1, minutesPerSession }),
  });
}

function buildExistingPhase() {
  return LearningPhase.create({
    id: LearningPhaseId.create(APP_FIXTURE_IDS.phase),
    learningPlanId: LearningPlanId.create(APP_FIXTURE_IDS.plan),
    name: "Phase 1",
    phaseOrder: 1,
    startDate: new Date("2026-01-01T00:00:00.000Z"),
  });
}

function buildHandler() {
  const learningPlanRepository = makeLearningPlanRepository();
  const learningPhaseRepository = makeLearningPhaseRepository();
  const learningTaskRepository = makeLearningTaskRepository();
  const studyScheduleRepository = makeStudyScheduleRepository();
  const unitOfWork = makeUnitOfWork();
  const uuidGenerator = makeUuidGenerator([APP_FIXTURE_IDS.phase, APP_FIXTURE_IDS.task]);
  const logger = makeLogger();

  const handler = new GenerateInitialPlanStructureHandler(
    learningPlanRepository as never,
    learningPhaseRepository as never,
    learningTaskRepository as never,
    studyScheduleRepository as never,
    unitOfWork as never,
    uuidGenerator as never,
    logger as never,
  );

  return {
    handler,
    learningPlanRepository,
    learningPhaseRepository,
    learningTaskRepository,
    studyScheduleRepository,
    unitOfWork,
    logger,
  };
}

describe("GenerateInitialPlanStructureHandler", () => {
  it("1. crea una fase inicial y una tarea inicial para un plan sin fases", async () => {
    const {
      handler,
      learningPlanRepository,
      learningPhaseRepository,
      studyScheduleRepository,
      learningTaskRepository,
    } = buildHandler();
    learningPlanRepository.findById.mockResolvedValue(buildPlan());
    studyScheduleRepository.findByLearningPlanId.mockResolvedValue(buildSchedule());

    const result = await handler.handle(
      GenerateInitialPlanStructureCommand.fromRequest({ learningPlanId: APP_FIXTURE_IDS.plan }),
    );

    expect(result).toEqual({
      learningPlanId: APP_FIXTURE_IDS.plan,
      created: true,
      phasesCreated: 1,
      tasksCreated: 1,
    });
    expect(learningPhaseRepository.save).toHaveBeenCalledTimes(1);
    expect(learningTaskRepository.save).toHaveBeenCalledTimes(1);
  });

  it("2. usa StudySchedule.minutesPerSession como LearningTask.estimatedMinutes", async () => {
    const { handler, learningPlanRepository, studyScheduleRepository, learningTaskRepository } =
      buildHandler();
    learningPlanRepository.findById.mockResolvedValue(buildPlan());
    studyScheduleRepository.findByLearningPlanId.mockResolvedValue(buildSchedule(45));

    await handler.handle(
      GenerateInitialPlanStructureCommand.fromRequest({ learningPlanId: APP_FIXTURE_IDS.plan }),
    );

    const savedTask = learningTaskRepository.save.mock.calls[0]![0];
    expect(savedTask.estimatedMinutes).toBe(45);
  });

  it("3. la tarea creada tiene source=SELF_DIRECTED", async () => {
    const { handler, learningPlanRepository, studyScheduleRepository, learningTaskRepository } =
      buildHandler();
    learningPlanRepository.findById.mockResolvedValue(buildPlan());
    studyScheduleRepository.findByLearningPlanId.mockResolvedValue(buildSchedule());

    await handler.handle(
      GenerateInitialPlanStructureCommand.fromRequest({ learningPlanId: APP_FIXTURE_IDS.plan }),
    );

    const savedTask = learningTaskRepository.save.mock.calls[0]![0];
    expect(savedTask.source).toBe("SELF_DIRECTED");
  });

  it("4. la fase creada nace en NOT_STARTED", async () => {
    const { handler, learningPlanRepository, studyScheduleRepository, learningPhaseRepository } =
      buildHandler();
    learningPlanRepository.findById.mockResolvedValue(buildPlan());
    studyScheduleRepository.findByLearningPlanId.mockResolvedValue(buildSchedule());

    await handler.handle(
      GenerateInitialPlanStructureCommand.fromRequest({ learningPlanId: APP_FIXTURE_IDS.plan }),
    );

    const savedPhase = learningPhaseRepository.save.mock.calls[0]![0];
    expect(savedPhase.status).toBe("NOT_STARTED");
  });

  it("5. la tarea creada nace en NOT_STARTED", async () => {
    const { handler, learningPlanRepository, studyScheduleRepository, learningTaskRepository } =
      buildHandler();
    learningPlanRepository.findById.mockResolvedValue(buildPlan());
    studyScheduleRepository.findByLearningPlanId.mockResolvedValue(buildSchedule());

    await handler.handle(
      GenerateInitialPlanStructureCommand.fromRequest({ learningPlanId: APP_FIXTURE_IDS.plan }),
    );

    const savedTask = learningTaskRepository.save.mock.calls[0]![0];
    expect(savedTask.status).toBe("NOT_STARTED");
  });

  it("6. si ya existe una fase, es un no-op idempotente (no crea nada)", async () => {
    const { handler, learningPlanRepository, learningPhaseRepository, studyScheduleRepository } =
      buildHandler();
    learningPlanRepository.findById.mockResolvedValue(buildPlan());
    learningPhaseRepository.findByLearningPlanId.mockResolvedValue([buildExistingPhase()]);

    const result = await handler.handle(
      GenerateInitialPlanStructureCommand.fromRequest({ learningPlanId: APP_FIXTURE_IDS.plan }),
    );

    expect(result).toEqual({
      learningPlanId: APP_FIXTURE_IDS.plan,
      created: false,
      phasesCreated: 0,
      tasksCreated: 0,
    });
    expect(learningPhaseRepository.save).not.toHaveBeenCalled();
    // No debería ni siquiera necesitar leer StudySchedule si ya hay fases.
    expect(studyScheduleRepository.findByLearningPlanId).not.toHaveBeenCalled();
  });

  it("7. si ya existe una fase, no crea una tarea duplicada", async () => {
    const { handler, learningPlanRepository, learningPhaseRepository, learningTaskRepository } =
      buildHandler();
    learningPlanRepository.findById.mockResolvedValue(buildPlan());
    learningPhaseRepository.findByLearningPlanId.mockResolvedValue([buildExistingPhase()]);

    await handler.handle(
      GenerateInitialPlanStructureCommand.fromRequest({ learningPlanId: APP_FIXTURE_IDS.plan }),
    );

    expect(learningTaskRepository.save).not.toHaveBeenCalled();
  });

  it("8. lanza ResourceNotFoundException si el LearningPlan no existe", async () => {
    const { handler, learningPhaseRepository } = buildHandler();

    await expect(
      handler.handle(
        GenerateInitialPlanStructureCommand.fromRequest({ learningPlanId: APP_FIXTURE_IDS.plan }),
      ),
    ).rejects.toBeInstanceOf(ResourceNotFoundException);
    expect(learningPhaseRepository.findByLearningPlanId).not.toHaveBeenCalled();
  });

  it("9. propaga ResourceNotFoundException si el plan no tiene StudySchedule", async () => {
    const { handler, learningPlanRepository, studyScheduleRepository, learningPhaseRepository } =
      buildHandler();
    learningPlanRepository.findById.mockResolvedValue(buildPlan());
    studyScheduleRepository.findByLearningPlanId.mockResolvedValue(null);

    await expect(
      handler.handle(
        GenerateInitialPlanStructureCommand.fromRequest({ learningPlanId: APP_FIXTURE_IDS.plan }),
      ),
    ).rejects.toBeInstanceOf(ResourceNotFoundException);
    expect(learningPhaseRepository.save).not.toHaveBeenCalled();
  });

  it("10. si falla el guardado de la tarea, el error se propaga (rollback real delegado a PrismaUnitOfWork, ya probado en infrastructure/PrismaUnitOfWork.test.ts)", async () => {
    const { handler, learningPlanRepository, studyScheduleRepository, learningTaskRepository } =
      buildHandler();
    learningPlanRepository.findById.mockResolvedValue(buildPlan());
    studyScheduleRepository.findByLearningPlanId.mockResolvedValue(buildSchedule());
    learningTaskRepository.save.mockRejectedValue(new Error("db down"));

    await expect(
      handler.handle(
        GenerateInitialPlanStructureCommand.fromRequest({ learningPlanId: APP_FIXTURE_IDS.plan }),
      ),
    ).rejects.toThrow("db down");
    // Nota (ver auditoría, sección "idempotencia"/"transacción"): este mock de
    // UnitOfWork.execute() ejecuta el callback directamente, sin abrir una
    // transacción Postgres real — no puede verificar el rollback físico de la
    // fase ya "guardada" en memoria antes del fallo. Esa garantía la
    // proporciona Postgres a través de PrismaUnitOfWork (con su propia
    // cobertura de tests); a nivel de este Handler solo se puede verificar
    // que el error se propaga sin ser capturado/silenciado.
  });

  it("11. la tarea creada referencia la fase recién creada", async () => {
    const {
      handler,
      learningPlanRepository,
      studyScheduleRepository,
      learningPhaseRepository,
      learningTaskRepository,
    } = buildHandler();
    learningPlanRepository.findById.mockResolvedValue(buildPlan());
    studyScheduleRepository.findByLearningPlanId.mockResolvedValue(buildSchedule());

    await handler.handle(
      GenerateInitialPlanStructureCommand.fromRequest({ learningPlanId: APP_FIXTURE_IDS.plan }),
    );

    const savedPhase = learningPhaseRepository.save.mock.calls[0]![0];
    const savedTask = learningTaskRepository.save.mock.calls[0]![0];
    expect(savedTask.learningPhaseId.value).toBe(savedPhase.id.value);
  });

  it("12. la fase creada referencia el learningPlanId correcto", async () => {
    const { handler, learningPlanRepository, studyScheduleRepository, learningPhaseRepository } =
      buildHandler();
    learningPlanRepository.findById.mockResolvedValue(buildPlan());
    studyScheduleRepository.findByLearningPlanId.mockResolvedValue(buildSchedule());

    await handler.handle(
      GenerateInitialPlanStructureCommand.fromRequest({ learningPlanId: APP_FIXTURE_IDS.plan }),
    );

    const savedPhase = learningPhaseRepository.save.mock.calls[0]![0];
    expect(savedPhase.learningPlanId.value).toBe(APP_FIXTURE_IDS.plan);
  });

  it("rechaza un learningPlanId inválido antes de tocar cualquier repositorio", async () => {
    const { handler, learningPlanRepository } = buildHandler();

    await expect(
      handler.handle(
        GenerateInitialPlanStructureCommand.fromRequest({ learningPlanId: "not-a-uuid" }),
      ),
    ).rejects.toBeInstanceOf(ValidationException);
    expect(learningPlanRepository.findById).not.toHaveBeenCalled();
  });
});
