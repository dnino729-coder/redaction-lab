import { describe, it, expect, vi } from "vitest";
import { CompleteStudentOnboardingHandler } from "@/features/profile/application/handlers/CompleteStudentOnboardingHandler";
import { CompleteStudentOnboardingCommand } from "@/features/profile/application/commands/CompleteStudentOnboardingCommand";
import { ConflictException } from "@/features/profile/application/exceptions/ConflictException";
import { ValidationException } from "@/features/profile/application/exceptions/ValidationException";
import { StudentProfile } from "@/features/profile/domain/entities/StudentProfile";
import { StudentProfileId } from "@/features/profile/domain/value-objects/StudentProfileId";
import { StudentId } from "@/features/profile/domain/value-objects/StudentId";
import type { StudentProfileRepository } from "@/features/profile/domain/repositories/StudentProfileRepository";
import type { LearningPlanRepository } from "@/features/my-plan/domain/repositories/LearningPlanRepository";
import type { CreateLearningPlanHandler } from "@/features/my-plan/application/handlers/CreateLearningPlanHandler";
import type { GenerateInitialPlanStructureHandler } from "@/features/my-plan/application/handlers/GenerateInitialPlanStructureHandler";

const FIXTURE = {
  student: "b1b1b1b1-0000-4000-8000-000000000001",
};

const VALID_REQUEST = {
  studentId: FIXTURE.student,
  currentLevel: "A2",
  targetLevel: "B2",
  nativeLanguage: "Español",
  learningGoal: "Aprobar el DELF B2",
  daysPerWeek: 3,
  sessionsPerDay: 1,
  minutesPerSession: 30,
};

function buildExistingProfile(): StudentProfile {
  return StudentProfile.create({
    id: StudentProfileId.create("cccccccc-0000-4000-8000-000000000001"),
    studentId: StudentId.create(FIXTURE.student),
    currentLevel: "A2",
    targetLevel: "B2",
    nativeLanguage: "Español",
    learningGoal: "Aprobar el DELF B2",
    targetExamDate: null,
  });
}

function makeStudentProfileRepository(): StudentProfileRepository {
  return {
    findByStudentId: vi.fn(async (): Promise<StudentProfile | null> => null),
    create: vi.fn(async (): Promise<void> => {}),
  };
}

function makeLearningPlanRepository(): LearningPlanRepository {
  return {
    findById: vi.fn(async () => null),
    findActiveByStudentId: vi.fn(async () => null),
    save: vi.fn(async () => {}),
  };
}

function makeCreateLearningPlanHandler(): CreateLearningPlanHandler {
  return {
    handle: vi.fn(async () => ({ id: "dddddddd-0000-4000-8000-000000000001" })),
  } as unknown as CreateLearningPlanHandler;
}

function makeLogger() {
  return { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
}

function makeGenerateInitialPlanStructureHandler(): GenerateInitialPlanStructureHandler {
  return {
    handle: vi.fn(async () => ({
      learningPlanId: "dddddddd-0000-4000-8000-000000000001",
      created: true,
      phasesCreated: 1,
      tasksCreated: 1,
    })),
  } as unknown as GenerateInitialPlanStructureHandler;
}

function buildHandler(overrides?: {
  studentProfileRepository?: StudentProfileRepository;
  learningPlanRepository?: LearningPlanRepository;
  createLearningPlanHandler?: CreateLearningPlanHandler;
  generateInitialPlanStructureHandler?: GenerateInitialPlanStructureHandler;
}) {
  const studentProfileRepository =
    overrides?.studentProfileRepository ?? makeStudentProfileRepository();
  const learningPlanRepository = overrides?.learningPlanRepository ?? makeLearningPlanRepository();
  const createLearningPlanHandler =
    overrides?.createLearningPlanHandler ?? makeCreateLearningPlanHandler();
  const generateInitialPlanStructureHandler =
    overrides?.generateInitialPlanStructureHandler ?? makeGenerateInitialPlanStructureHandler();
  const handler = new CompleteStudentOnboardingHandler(
    studentProfileRepository,
    learningPlanRepository,
    createLearningPlanHandler,
    generateInitialPlanStructureHandler,
    { generate: () => "aaaaaaaa-0000-4000-8000-000000000001" },
    makeLogger() as never,
  );
  return {
    handler,
    studentProfileRepository,
    learningPlanRepository,
    createLearningPlanHandler,
    generateInitialPlanStructureHandler,
  };
}

describe("CompleteStudentOnboardingHandler", () => {
  it("1. sin perfil + sin plan: crea perfil y plan, y genera la estructura inicial", async () => {
    const {
      handler,
      studentProfileRepository,
      createLearningPlanHandler,
      generateInitialPlanStructureHandler,
    } = buildHandler();

    const result = await handler.handle(
      CompleteStudentOnboardingCommand.fromRequest(VALID_REQUEST),
    );

    expect(studentProfileRepository.create).toHaveBeenCalledTimes(1);
    expect(createLearningPlanHandler.handle).toHaveBeenCalledTimes(1);
    expect(generateInitialPlanStructureHandler.handle).toHaveBeenCalledTimes(1);
    const structureCommand = vi.mocked(generateInitialPlanStructureHandler.handle).mock
      .calls[0]![0];
    expect(structureCommand.request.learningPlanId).toBe("dddddddd-0000-4000-8000-000000000001");
    expect(result.learningPlanId).toBe("dddddddd-0000-4000-8000-000000000001");
    expect(result.studentProfile.nativeLanguage).toBe("Español");
  });

  it("7. si la generación de la estructura inicial falla, el error se propaga (no se silencia)", async () => {
    const generateInitialPlanStructureHandler = makeGenerateInitialPlanStructureHandler();
    vi.mocked(generateInitialPlanStructureHandler.handle).mockRejectedValue(
      new Error("structure generation failed"),
    );
    const { handler } = buildHandler({ generateInitialPlanStructureHandler });

    await expect(
      handler.handle(CompleteStudentOnboardingCommand.fromRequest(VALID_REQUEST)),
    ).rejects.toThrow("structure generation failed");
  });

  it("2. perfil existente + sin plan: NO crea perfil, sí crea plan (recuperación)", async () => {
    const studentProfileRepository = makeStudentProfileRepository();
    vi.mocked(studentProfileRepository.findByStudentId).mockResolvedValue(buildExistingProfile());
    const { handler, createLearningPlanHandler } = buildHandler({ studentProfileRepository });

    await handler.handle(CompleteStudentOnboardingCommand.fromRequest(VALID_REQUEST));

    expect(studentProfileRepository.create).not.toHaveBeenCalled();
    expect(createLearningPlanHandler.handle).toHaveBeenCalledTimes(1);
  });

  it("3. perfil existente + plan activo: ConflictException, sin crear nada", async () => {
    const studentProfileRepository = makeStudentProfileRepository();
    vi.mocked(studentProfileRepository.findByStudentId).mockResolvedValue(buildExistingProfile());
    const learningPlanRepository = makeLearningPlanRepository();
    vi.mocked(learningPlanRepository.findActiveByStudentId).mockResolvedValue({} as never);
    const { handler, createLearningPlanHandler } = buildHandler({
      studentProfileRepository,
      learningPlanRepository,
    });

    await expect(
      handler.handle(CompleteStudentOnboardingCommand.fromRequest(VALID_REQUEST)),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(studentProfileRepository.create).not.toHaveBeenCalled();
    expect(createLearningPlanHandler.handle).not.toHaveBeenCalled();
  });

  it("4. error creando perfil: no intenta crear el plan", async () => {
    const studentProfileRepository = makeStudentProfileRepository();
    vi.mocked(studentProfileRepository.create).mockRejectedValue(new Error("boom"));
    const { handler, createLearningPlanHandler } = buildHandler({ studentProfileRepository });

    await expect(
      handler.handle(CompleteStudentOnboardingCommand.fromRequest(VALID_REQUEST)),
    ).rejects.toThrow("boom");
    expect(createLearningPlanHandler.handle).not.toHaveBeenCalled();
  });

  it("5. error creando el plan: el perfil queda creado, el error se propaga, y una ejecución posterior puede continuar (estado B)", async () => {
    const studentProfileRepository = makeStudentProfileRepository();
    const createLearningPlanHandler = makeCreateLearningPlanHandler();
    vi.mocked(createLearningPlanHandler.handle).mockRejectedValue(
      new Error("plan creation failed"),
    );
    const { handler } = buildHandler({ studentProfileRepository, createLearningPlanHandler });

    await expect(
      handler.handle(CompleteStudentOnboardingCommand.fromRequest(VALID_REQUEST)),
    ).rejects.toThrow("plan creation failed");
    // El perfil sí se creó antes de que fallara el plan — estado recuperable.
    expect(studentProfileRepository.create).toHaveBeenCalledTimes(1);
  });

  it("6. studentId ausente/ inválido: rechaza sin llegar a ningún repositorio", async () => {
    const { handler, studentProfileRepository, createLearningPlanHandler } = buildHandler();

    await expect(
      handler.handle(
        CompleteStudentOnboardingCommand.fromRequest({ ...VALID_REQUEST, studentId: "not-a-uuid" }),
      ),
    ).rejects.toBeInstanceOf(ValidationException);
    expect(studentProfileRepository.findByStudentId).not.toHaveBeenCalled();
    expect(createLearningPlanHandler.handle).not.toHaveBeenCalled();
  });
});
