// Estado `error` (docs/modules/dashboard.md, sección 6/14.7: "mensaje
// tranquilo, nunca alarmante"). Verifica que expone role="alert" (para
// lectores de pantalla) y el botón de reintento cuando se provee onRetry.
import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { DashboardErrorState } from "@/features/dashboard/components/DashboardErrorState";
import { renderWithIntl } from "../../../fixtures/renderWithIntl";

describe("DashboardErrorState", () => {
  it("expone role='alert' con el mensaje tranquilo (fr, fuente primaria)", () => {
    renderWithIntl(<DashboardErrorState />);
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Un petit souci technique");
  });

  it("no muestra el botón de reintento si no se pasa onRetry", () => {
    renderWithIntl(<DashboardErrorState />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("invoca onRetry al hacer clic en el botón", () => {
    const onRetry = vi.fn();
    renderWithIntl(<DashboardErrorState onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
