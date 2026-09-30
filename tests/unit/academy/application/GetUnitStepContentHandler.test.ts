// GetUnitStepContentHandler — Academy Content v1 (Bloque 3A). Cubre
// validación sintáctica (locale/step inválidos), la traducción "unit no
// encontrado/no propio" -> 404 (mismo criterio H-01 que
// GetAcademyUnitDetailHandler), y que la ausencia de contenido PUBLISHED
// para un slot existente NUNCA se trata como error (200 con blocks
// vacíos, nunca 404 ni 500).
import { describe, it, expect, vi } from "vitest";
import { GetUnitStepContentHandler } from "@/features/academy/application/handlers/GetUnitStepContentHandler";
import { GetUnitStepContentQuery } from "@/features/academy/application/queries/GetUnitStepContentQuery";
import { ResourceNotFoundException } from "@/features/academy/application/exceptions/ResourceNotFoundException";
import { ValidationException } from "@/features/academy/application/exceptions/ValidationException";
import { FIXTURE_IDS } from "../domain/fixtures";

function makeReadModelPort() {
  return { getUnitStepContent: vi.fn() };
}

function buildQuery(
  overrides: Partial<{ unitId: string; studentId: string; step: string; locale: string }> = {},
) {
  return GetUnitStepContentQuery.fromRequest({
    unitId: FIXTURE_IDS.unit,
    studentId: FIXTURE_IDS.student,
    step: "CONTEXTUALIZE",
    locale: "fr",
    ...overrides,
  });
}

describe("GetUnitStepContentHandler", () => {
  it("devuelve el contenido cuando el Read Model lo encuentra", async () => {
    const readModelPort = makeReadModelPort();
    readModelPort.getUnitStepContent.mockResolvedValue({
      step: "CONTEXTUALIZE",
      blocks: [{ order: 0, type: "RICH_TEXT", data: { html: "<p>x</p>" } }],
    });
    const handler = new GetUnitStepContentHandler(readModelPort as never);

    const result = await handler.handle(buildQuery());

    expect(result).toEqual({
      step: "CONTEXTUALIZE",
      blocks: [{ order: 0, type: "RICH_TEXT", data: { html: "<p>x</p>" } }],
    });
    expect(readModelPort.getUnitStepContent).toHaveBeenCalledWith(
      FIXTURE_IDS.unit,
      FIXTURE_IDS.student,
      "CONTEXTUALIZE",
      "fr",
    );
  });

  it("propaga locale es sin alterarlo", async () => {
    const readModelPort = makeReadModelPort();
    readModelPort.getUnitStepContent.mockResolvedValue({ step: "OBSERVE", blocks: [] });
    const handler = new GetUnitStepContentHandler(readModelPort as never);

    await handler.handle(buildQuery({ step: "OBSERVE", locale: "es" }));

    expect(readModelPort.getUnitStepContent).toHaveBeenCalledWith(
      FIXTURE_IDS.unit,
      FIXTURE_IDS.student,
      "OBSERVE",
      "es",
    );
  });

  it("ausencia de contenido PUBLISHED no lanza error — devuelve blocks vacío (nunca 500)", async () => {
    const readModelPort = makeReadModelPort();
    readModelPort.getUnitStepContent.mockResolvedValue({ step: "PRACTICE", blocks: [] });
    const handler = new GetUnitStepContentHandler(readModelPort as never);

    const result = await handler.handle(buildQuery({ step: "PRACTICE" }));

    expect(result).toEqual({ step: "PRACTICE", blocks: [] });
  });

  it("unitId inexistente o de otro estudiante -> ResourceNotFoundException (404), nunca 500", async () => {
    const readModelPort = makeReadModelPort();
    readModelPort.getUnitStepContent.mockResolvedValue(null);
    const handler = new GetUnitStepContentHandler(readModelPort as never);

    await expect(handler.handle(buildQuery())).rejects.toBeInstanceOf(ResourceNotFoundException);
  });

  it("rechaza un locale no permitido antes de consultar el Read Model", async () => {
    const readModelPort = makeReadModelPort();
    const handler = new GetUnitStepContentHandler(readModelPort as never);

    await expect(handler.handle(buildQuery({ locale: "en" }))).rejects.toBeInstanceOf(
      ValidationException,
    );
    expect(readModelPort.getUnitStepContent).not.toHaveBeenCalled();
  });

  it("rechaza un step que no pertenece al enum AcademyUnitStep", async () => {
    const readModelPort = makeReadModelPort();
    const handler = new GetUnitStepContentHandler(readModelPort as never);

    await expect(handler.handle(buildQuery({ step: "NOT_A_REAL_STEP" }))).rejects.toBeInstanceOf(
      ValidationException,
    );
    expect(readModelPort.getUnitStepContent).not.toHaveBeenCalled();
  });
});
