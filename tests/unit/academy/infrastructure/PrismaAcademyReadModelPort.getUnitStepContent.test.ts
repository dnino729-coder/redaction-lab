// PrismaAcademyReadModelPort.getUnitStepContent — Academy Content v1
// (Bloque 3A). Único método nuevo de esta clase probado aquí ("solo los
// tests necesarios para esta nueva lectura", no se re-testean los 9
// métodos ya existentes). Verifica la FORMA exacta de la consulta Prisma
// (status=PUBLISHED, version DESC, blocks order ASC, locale/textType/
// position) mockeando `withActiveClient` — sin tocar una base de datos
// real, mismo criterio que el resto de este proyecto ("NO ejecutes SQL").
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaAcademyReadModelPort } from "@/features/academy/infrastructure/persistence/read-models/PrismaAcademyReadModelPort";
import { FIXTURE_IDS } from "../domain/fixtures";

const academyUnitFindFirst = vi.fn();
const academyUnitContentFindFirst = vi.fn();

vi.mock("@/features/academy/infrastructure/persistence/PrismaClientContext", () => ({
  withActiveClient: (fn: (client: unknown) => unknown) =>
    fn({
      academyUnit: { findFirst: academyUnitFindFirst },
      academyUnitContent: { findFirst: academyUnitContentFindFirst },
    }),
}));

describe("PrismaAcademyReadModelPort.getUnitStepContent", () => {
  beforeEach(() => {
    academyUnitFindFirst.mockReset();
    academyUnitContentFindFirst.mockReset();
  });

  it("resuelve unitId -> (textType, position) con ownership por studentId", async () => {
    academyUnitFindFirst.mockResolvedValue({ textType: "LETTER", position: 1 });
    academyUnitContentFindFirst.mockResolvedValue(null);
    const port = new PrismaAcademyReadModelPort();

    await port.getUnitStepContent(FIXTURE_IDS.unit, FIXTURE_IDS.student, "CONTEXTUALIZE", "fr");

    expect(academyUnitFindFirst).toHaveBeenCalledWith({
      where: { id: FIXTURE_IDS.unit, studentId: FIXTURE_IDS.student },
      select: { textType: true, position: true },
    });
  });

  it("unitId inexistente o no propio -> null (nunca lanza, nunca 500)", async () => {
    academyUnitFindFirst.mockResolvedValue(null);
    const port = new PrismaAcademyReadModelPort();

    const result = await port.getUnitStepContent(
      FIXTURE_IDS.unit,
      FIXTURE_IDS.student,
      "CONTEXTUALIZE",
      "fr",
    );

    expect(result).toBeNull();
    expect(academyUnitContentFindFirst).not.toHaveBeenCalled();
  });

  it("consulta status=PUBLISHED, version DESC y blocks order ASC (nunca DRAFT/ARCHIVED, nunca versión arbitraria)", async () => {
    academyUnitFindFirst.mockResolvedValue({ textType: "LETTER", position: 1 });
    academyUnitContentFindFirst.mockResolvedValue(null);
    const port = new PrismaAcademyReadModelPort();

    await port.getUnitStepContent(FIXTURE_IDS.unit, FIXTURE_IDS.student, "ANALYZE", "es");

    expect(academyUnitContentFindFirst).toHaveBeenCalledWith({
      where: {
        textType: "LETTER",
        position: 1,
        step: "ANALYZE",
        locale: "es",
        status: "PUBLISHED",
      },
      orderBy: { version: "desc" },
      include: { blocks: { orderBy: { order: "asc" } } },
    });
  });

  it("locale fr se pasa exacto a la consulta", async () => {
    academyUnitFindFirst.mockResolvedValue({ textType: "LETTER", position: 1 });
    academyUnitContentFindFirst.mockResolvedValue(null);
    const port = new PrismaAcademyReadModelPort();

    await port.getUnitStepContent(FIXTURE_IDS.unit, FIXTURE_IDS.student, "CONTEXTUALIZE", "fr");

    expect(academyUnitContentFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ locale: "fr" }) }),
    );
  });

  it("locale es se pasa exacto a la consulta", async () => {
    academyUnitFindFirst.mockResolvedValue({ textType: "LETTER", position: 1 });
    academyUnitContentFindFirst.mockResolvedValue(null);
    const port = new PrismaAcademyReadModelPort();

    await port.getUnitStepContent(FIXTURE_IDS.unit, FIXTURE_IDS.student, "CONTEXTUALIZE", "es");

    expect(academyUnitContentFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ locale: "es" }) }),
    );
  });

  it("sin fila PUBLISHED para el slot -> { step, blocks: [] }, no null, no error", async () => {
    academyUnitFindFirst.mockResolvedValue({ textType: "LETTER", position: 1 });
    academyUnitContentFindFirst.mockResolvedValue(null);
    const port = new PrismaAcademyReadModelPort();

    const result = await port.getUnitStepContent(
      FIXTURE_IDS.unit,
      FIXTURE_IDS.student,
      "PRACTICE",
      "fr",
    );

    expect(result).toEqual({ step: "PRACTICE", blocks: [] });
  });

  it("mapea los bloques ya ordenados por Prisma sin reordenarlos ni exponer campos internos", async () => {
    academyUnitFindFirst.mockResolvedValue({ textType: "LETTER", position: 1 });
    academyUnitContentFindFirst.mockResolvedValue({
      id: "content-uuid",
      status: "PUBLISHED",
      version: 3,
      createdBy: FIXTURE_IDS.teacher,
      blocks: [
        { id: "b1", contentId: "content-uuid", order: 0, type: "RICH_TEXT", data: { html: "a" } },
        { id: "b2", contentId: "content-uuid", order: 1, type: "INSTRUCTION", data: { text: "b" } },
      ],
    });
    const port = new PrismaAcademyReadModelPort();

    const result = await port.getUnitStepContent(
      FIXTURE_IDS.unit,
      FIXTURE_IDS.student,
      "CONTEXTUALIZE",
      "fr",
    );

    expect(result).toEqual({
      step: "CONTEXTUALIZE",
      blocks: [
        { order: 0, type: "RICH_TEXT", data: { html: "a" } },
        { order: 1, type: "INSTRUCTION", data: { text: "b" } },
      ],
    });
    // Nunca version/status/id/createdBy en la respuesta (alcance del Bloque 3A).
    expect(result).not.toHaveProperty("version");
    expect(result).not.toHaveProperty("status");
  });
});
