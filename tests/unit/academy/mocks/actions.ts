// Mock de módulo para las 6 Server Actions de Academia
// (`features/academy/actions/*`, Blueprint Sección 3.1/16.2: "mocks de
// módulo (`vi.mock`) para features/academy/actions/*"). Uso en un test de
// Fase 1:
//
//   vi.mock("@/features/academy/actions", () => createAcademyActionsMock());
//
// `createAcademyActionsMock()` construye un objeto nuevo por llamada
// (evita compartir estado de `vi.fn()` entre archivos de test) con valores
// de resolución por defecto (happy path); cada test sobreescribe el
// `mockResolvedValueOnce`/`mockRejectedValueOnce` puntual que necesite.
import { vi } from "vitest";
import { attemptSummaryFixture, versionFixture } from "./fixtures";

export function createAcademyActionsMock() {
  return {
    startUnitAction: vi.fn().mockResolvedValue(attemptSummaryFixture),
    repeatUnitAction: vi.fn().mockResolvedValue(attemptSummaryFixture),
    autosaveDraftAction: vi.fn().mockResolvedValue({
      attemptId: attemptSummaryFixture.attemptId,
      content: "",
      wordCount: 0,
      characterCount: 0,
      lastSavedAt: new Date().toISOString(),
    }),
    advanceStepAction: vi.fn().mockResolvedValue(attemptSummaryFixture),
    verifyComprehensionAction: vi.fn().mockResolvedValue({ attempt: attemptSummaryFixture, satisfied: true }),
    submitVersionAction: vi.fn().mockResolvedValue(versionFixture),
  };
}
