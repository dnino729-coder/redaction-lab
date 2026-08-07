// StepProgressTracker es presentacional puro — se testea sin MSW ni
// QueryClient.
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "../../../fixtures/renderWithIntl";
import { StepProgressTracker } from "@/features/academy/components/shared";

describe("StepProgressTracker", () => {
  it("marca aria-current='step' únicamente en el paso activo", () => {
    renderWithIntl(<StepProgressTracker currentStep="DEFINE_OBJECTIVES" />);

    const active = screen.getByText("Définir les objectifs");
    expect(active.closest("li")).toHaveAttribute("aria-current", "step");

    const other = screen.getByText("Contextualiser");
    expect(other.closest("li")).not.toHaveAttribute("aria-current");
  });

  it("renderiza los 10 pasos visibles (excluye UNLOCK, sin slug propio)", () => {
    renderWithIntl(<StepProgressTracker currentStep="CONTEXTUALIZE" />);

    expect(screen.getAllByRole("listitem")).toHaveLength(10);
    expect(screen.queryByText("Déverrouillage")).not.toBeInTheDocument();
  });
});
