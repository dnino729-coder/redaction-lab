import { describe, it, expect, vi } from "vitest";
import { GetExerciseAttemptDetailHandler } from "@/features/laboratory/application/handlers/GetExerciseAttemptDetailHandler";
import { GetExerciseAttemptDetailQuery } from "@/features/laboratory/application/queries/GetExerciseAttemptDetailQuery";
import { ResourceNotFoundException } from "@/features/laboratory/application/exceptions/ResourceNotFoundException";
import { ValidationException } from "@/features/laboratory/application/exceptions/ValidationException";
import type { LaboratoryExerciseReadModelPort } from "@/features/laboratory/application/ports/LaboratoryExerciseReadModelPort";

const FIXTURE_IDS = {
  attempt: "a1a1a1a1-0000-4000-8000-000000000001",
  otherAttempt: "a1a1a1a1-0000-4000-8000-000000000002",
  student: "b1b1b1b1-0000-4000-8000-000000000001",
  otherStudent: "b1b1b1b1-0000-4000-8000-000000000002",
};

function makeReadModel(): LaboratoryExerciseReadModelPort {
  return {
    listExercisesForStudent: vi.fn(),
    getExerciseDetail: vi.fn(),
    getAttemptHistory: vi.fn(),
    getAttemptDetail: vi.fn(),
  };
}

describe("GetExerciseAttemptDetailHandler", () => {
  it("devuelve el attempt (incluyendo content) cuando pertenece al estudiante autenticado — 1. attempt propio", async () => {
    const readModel = makeReadModel();
    vi.mocked(readModel.getAttemptDetail).mockResolvedValue({
      id: FIXTURE_IDS.attempt,
      attemptNumber: 1,
      status: "IN_PROGRESS",
      wordCount: 3,
      startedAt: new Date("2026-08-01T00:00:00.000Z"),
      completedAt: null,
      content: "Bonjour à tous",
    });
    const handler = new GetExerciseAttemptDetailHandler(readModel);

    const result = await handler.handle(
      GetExerciseAttemptDetailQuery.fromRequest({
        attemptId: FIXTURE_IDS.attempt,
        studentId: FIXTURE_IDS.student,
      }),
    );

    expect(result.content).toBe("Bonjour à tous");
    expect(result.status).toBe("IN_PROGRESS");
    expect(readModel.getAttemptDetail).toHaveBeenCalledWith(
      FIXTURE_IDS.attempt,
      FIXTURE_IDS.student,
    );
  });

  it("recupera un attempt COMPLETED igual que uno IN_PROGRESS — 5. draft/autosave existente", async () => {
    const readModel = makeReadModel();
    vi.mocked(readModel.getAttemptDetail).mockResolvedValue({
      id: FIXTURE_IDS.attempt,
      attemptNumber: 2,
      status: "COMPLETED",
      wordCount: 210,
      startedAt: new Date("2026-08-01T00:00:00.000Z"),
      completedAt: new Date("2026-08-01T01:00:00.000Z"),
      content: "Texte final complet.",
    });
    const handler = new GetExerciseAttemptDetailHandler(readModel);

    const result = await handler.handle(
      GetExerciseAttemptDetailQuery.fromRequest({
        attemptId: FIXTURE_IDS.attempt,
        studentId: FIXTURE_IDS.student,
      }),
    );

    expect(result.status).toBe("COMPLETED");
    expect(result.content).toBe("Texte final complet.");
    expect(result.completedAt).toBe("2026-08-01T01:00:00.000Z");
  });

  it("un attempt recién iniciado sin draft devuelve content vacío, no un error — 6. attempt sin draft", async () => {
    const readModel = makeReadModel();
    vi.mocked(readModel.getAttemptDetail).mockResolvedValue({
      id: FIXTURE_IDS.attempt,
      attemptNumber: 1,
      status: "IN_PROGRESS",
      wordCount: 0,
      startedAt: new Date("2026-08-01T00:00:00.000Z"),
      completedAt: null,
      content: "",
    });
    const handler = new GetExerciseAttemptDetailHandler(readModel);

    const result = await handler.handle(
      GetExerciseAttemptDetailQuery.fromRequest({
        attemptId: FIXTURE_IDS.attempt,
        studentId: FIXTURE_IDS.student,
      }),
    );

    expect(result.content).toBe("");
  });

  it("rechaza con ResourceNotFoundException si el attempt no existe — 2. attempt inexistente", async () => {
    const readModel = makeReadModel();
    vi.mocked(readModel.getAttemptDetail).mockResolvedValue(null);
    const handler = new GetExerciseAttemptDetailHandler(readModel);

    await expect(
      handler.handle(
        GetExerciseAttemptDetailQuery.fromRequest({
          attemptId: FIXTURE_IDS.attempt,
          studentId: FIXTURE_IDS.student,
        }),
      ),
    ).rejects.toBeInstanceOf(ResourceNotFoundException);
  });

  it("rechaza con ResourceNotFoundException (nunca Forbidden) si el attempt pertenece a otro estudiante — 3. BOLA/IDOR", async () => {
    // El read model ya filtra por studentId en el WHERE: un attempt ajeno
    // simplemente no aparece — el handler lo trata como "no encontrado",
    // igual que un id inexistente, sin revelar su existencia real.
    const readModel = makeReadModel();
    vi.mocked(readModel.getAttemptDetail).mockResolvedValue(null);
    const handler = new GetExerciseAttemptDetailHandler(readModel);

    await expect(
      handler.handle(
        GetExerciseAttemptDetailQuery.fromRequest({
          attemptId: FIXTURE_IDS.otherAttempt,
          studentId: FIXTURE_IDS.otherStudent,
        }),
      ),
    ).rejects.toBeInstanceOf(ResourceNotFoundException);
    expect(readModel.getAttemptDetail).toHaveBeenCalledWith(
      FIXTURE_IDS.otherAttempt,
      FIXTURE_IDS.otherStudent,
    );
  });

  it("rechaza con ValidationException si attemptId no es un UUID válido", async () => {
    const readModel = makeReadModel();
    const handler = new GetExerciseAttemptDetailHandler(readModel);

    await expect(
      handler.handle(
        GetExerciseAttemptDetailQuery.fromRequest({
          attemptId: "not-a-uuid",
          studentId: FIXTURE_IDS.student,
        }),
      ),
    ).rejects.toBeInstanceOf(ValidationException);
    expect(readModel.getAttemptDetail).not.toHaveBeenCalled();
  });
});
