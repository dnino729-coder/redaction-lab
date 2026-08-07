// UnitCard es presentacional puro — se testea sin MSW ni QueryClient. Cubre:
// render del label derivado de `position` (Blueprint §5.1, sin título en el
// DTO), badge de estado, invocación de `onSelect` al hacer click, y que una
// unidad LOCKED queda deshabilitada (Blueprint §12, P-01: "permitiendo
// iniciar la navegación hacia cualquier unidad no bloqueada").
import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithIntl } from "../../../fixtures/renderWithIntl";
import { UnitCard } from "@/features/academy/components/unit-map";
import { unitSummaryFixture } from "../mocks/fixtures";

describe("UnitCard", () => {
  it("renderiza el label derivado de position y el estado, e invoca onSelect al hacer click", () => {
    const onSelect = vi.fn();
    renderWithIntl(
      <UnitCard unit={{ ...unitSummaryFixture, state: "UNLOCKED" }} isRecommended={false} onSelect={onSelect} />,
    );

    const button = screen.getByRole("button", { name: /Unité 1/ });
    expect(button).not.toBeDisabled();
    expect(screen.getByText("Disponible")).toBeInTheDocument();

    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledWith(unitSummaryFixture.unitId);
  });

  it("deshabilita la tarjeta cuando el estado es LOCKED y no invoca onSelect", () => {
    const onSelect = vi.fn();
    renderWithIntl(
      <UnitCard unit={{ ...unitSummaryFixture, state: "LOCKED" }} isRecommended={false} onSelect={onSelect} />,
    );

    const button = screen.getByRole("button", { name: /Unité 1/ });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("no renderiza RecommendationBadge cuando isRecommended es false", () => {
    renderWithIntl(<UnitCard unit={unitSummaryFixture} isRecommended={false} onSelect={vi.fn()} />);
    expect(screen.queryByText("Recommandée")).not.toBeInTheDocument();
  });
});
