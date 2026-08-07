// Verifica que el scaffolding de tests de Academia (MSW + QueryClient de
// prueba) funciona de punta a punta — no es cobertura completa del hook
// (Fase 0.8: "tests base", la cobertura exhaustiva de los 24 hooks
// corresponde a Fase 1).
import { describe, expect, it } from "vitest";
import { waitFor } from "@testing-library/react";
import { useUnits } from "@/features/academy/hooks";
import { registerAcademyMswServer } from "../mocks/serverLifecycle";
import { renderWithQueryClient } from "../utils/testQueryClient";
import { unitSummaryFixture } from "../mocks/fixtures";

registerAcademyMswServer();

function ProbeUnits() {
  const { data, isSuccess } = useUnits();
  if (!isSuccess) return <span>loading</span>;
  return <span data-testid="unit-count">{data.data.length}</span>;
}

describe("useUnits (scaffolding smoke test)", () => {
  it("resuelve la lista de unidades a través del servidor MSW", async () => {
    const { getByTestId } = renderWithQueryClient(<ProbeUnits />);

    await waitFor(() => expect(getByTestId("unit-count").textContent).toBe("1"));
    expect(unitSummaryFixture.unitId).toBe("unit-1");
  });
});
