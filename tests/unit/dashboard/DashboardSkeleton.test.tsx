// Estado `loading` (14.7: Skeleton Screens). Verifica el anuncio accesible
// mediante role="status" para lectores de pantalla durante la carga.
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { renderWithIntl } from "../../../fixtures/renderWithIntl";

describe("DashboardSkeleton", () => {
  it("anuncia el estado de carga vía role='status'", () => {
    renderWithIntl(<DashboardSkeleton />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("incluye el mensaje de carga (fr, fuente primaria) para lectores de pantalla", () => {
    renderWithIntl(<DashboardSkeleton />);
    expect(screen.getByText("Chargement du tableau de bord...")).toBeInTheDocument();
  });
});
