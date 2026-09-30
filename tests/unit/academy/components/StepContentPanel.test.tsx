// StepContentPanel — Academy Content v1 (Bloque 3F). Presentacional puro
// (recibe el resultado de useUnitStepContent como props) — se testea sin
// MSW ni QueryClient, igual que StepProgressTracker.test.tsx.
import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithIntl } from "../../../fixtures/renderWithIntl";
import { StepContentPanel } from "@/features/academy/components/unit-attempt/StepContentPanel";

describe("StepContentPanel", () => {
  it("Loading: muestra skeletons, no el mensaje de contenido pendiente", () => {
    renderWithIntl(
      <StepContentPanel
        step="CONTEXTUALIZE"
        isLoading={true}
        isError={false}
        error={null}
        blocks={[]}
        onRetry={vi.fn()}
      />,
    );
    expect(
      screen.queryByText("Le contenu de cette étape n'est pas encore disponible."),
    ).not.toBeInTheDocument();
  });

  it("Error: muestra ErrorState con botón de reintento, invoca onRetry al hacer clic", () => {
    const onRetry = vi.fn();
    renderWithIntl(
      <StepContentPanel
        step="CONTEXTUALIZE"
        isLoading={false}
        isError={true}
        error={new Error("fallo real")}
        blocks={[]}
        onRetry={onRetry}
      />,
    );
    expect(screen.getByText("Nous n'avons pas pu charger cette étape")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("Empty: sin bloques publicados, muestra el mensaje de contenido pendiente (nunca contenido inventado)", () => {
    renderWithIntl(
      <StepContentPanel
        step="PRACTICE"
        isLoading={false}
        isError={false}
        error={null}
        blocks={[]}
        onRetry={vi.fn()}
      />,
    );
    expect(
      screen.getByText("Le contenu de cette étape n'est pas encore disponible."),
    ).toBeInTheDocument();
  });

  it("Success: renderiza los bloques recibidos, en el orden dado", () => {
    renderWithIntl(
      <StepContentPanel
        step="CONTEXTUALIZE"
        isLoading={false}
        isError={false}
        error={null}
        blocks={[
          { order: 1, type: "RICH_TEXT", data: { html: "<p>Premier bloc</p>" } },
          { order: 2, type: "INSTRUCTION", data: { text: "Deuxième bloc" } },
        ]}
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByText("Premier bloc")).toBeInTheDocument();
    expect(screen.getByText("Deuxième bloc")).toBeInTheDocument();
    expect(
      screen.queryByText("Le contenu de cette étape n'est pas encore disponible."),
    ).not.toBeInTheDocument();
  });

  it("Success con blocks vacíos y sin loading/error se trata como Empty, no como éxito silencioso", () => {
    renderWithIntl(
      <StepContentPanel
        step="DEFINE_OBJECTIVES"
        isLoading={false}
        isError={false}
        error={null}
        blocks={[]}
        onRetry={vi.fn()}
      />,
    );
    expect(
      screen.getByText("Le contenu de cette étape n'est pas encore disponible."),
    ).toBeInTheDocument();
  });
});
