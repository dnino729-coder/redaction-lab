// UnitStatusBadge es presentacional puro — se testea sin MSW ni QueryClient.
// Verifica el criterio de aceptación de P-01 (Blueprint §12): el estado se
// comunica con texto, nunca solo color.
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "../../../fixtures/renderWithIntl";
import { UnitStatusBadge } from "@/features/academy/components/shared";

describe("UnitStatusBadge", () => {
  it("renderiza el texto traducido del estado UNLOCKED", () => {
    renderWithIntl(<UnitStatusBadge state="UNLOCKED" />);
    expect(screen.getByText("Disponible")).toBeInTheDocument();
  });

  it("renderiza el texto traducido del estado LOCKED", () => {
    renderWithIntl(<UnitStatusBadge state="LOCKED" />);
    expect(screen.getByText("Verrouillée")).toBeInTheDocument();
  });

  it("renderiza el texto traducido del estado MASTERED", () => {
    renderWithIntl(<UnitStatusBadge state="MASTERED" />);
    expect(screen.getByText("Maîtrisée")).toBeInTheDocument();
  });
});
