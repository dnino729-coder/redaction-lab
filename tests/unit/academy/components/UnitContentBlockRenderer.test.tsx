// UnitContentBlockRenderer — Academy Content v1 (Bloque 3F). Presentacional
// puro, se testea sin MSW ni QueryClient (mismo criterio que
// StepProgressTracker.test.tsx).
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { UnitContentBlockRenderer } from "@/features/academy/components/unit-attempt/UnitContentBlockRenderer";

describe("UnitContentBlockRenderer", () => {
  it("renderiza RICH_TEXT como HTML", () => {
    render(
      <UnitContentBlockRenderer
        block={{ order: 1, type: "RICH_TEXT", data: { html: "<p>Bonjour</p>" } }}
      />,
    );
    expect(screen.getByText("Bonjour")).toBeInTheDocument();
  });

  it("renderiza INSTRUCTION como texto", () => {
    render(
      <UnitContentBlockRenderer
        block={{ order: 1, type: "INSTRUCTION", data: { text: "Lisez ceci." } }}
      />,
    );
    expect(screen.getByText("Lisez ceci.")).toBeInTheDocument();
  });

  it("renderiza TIP como texto", () => {
    render(
      <UnitContentBlockRenderer block={{ order: 1, type: "TIP", data: { text: "Un conseil." } }} />,
    );
    expect(screen.getByText("Un conseil.")).toBeInTheDocument();
  });

  it("renderiza QUESTION como texto", () => {
    render(
      <UnitContentBlockRenderer
        block={{ order: 1, type: "QUESTION", data: { text: "Pourquoi ?" } }}
      />,
    );
    expect(screen.getByText("Pourquoi ?")).toBeInTheDocument();
  });

  it("renderiza CHECKLIST como lista de items", () => {
    render(
      <UnitContentBlockRenderer
        block={{
          order: 1,
          type: "CHECKLIST",
          data: { items: ["Premier point", "Deuxième point"] },
        }}
      />,
    );
    expect(screen.getByText("Premier point")).toBeInTheDocument();
    expect(screen.getByText("Deuxième point")).toBeInTheDocument();
  });

  it("renderiza EXAMPLE como pares informal/formel", () => {
    render(
      <UnitContentBlockRenderer
        block={{
          order: 1,
          type: "EXAMPLE",
          data: { pairs: [{ informal: "Salut !", formel: "Madame, Monsieur," }] },
        }}
      />,
    );
    expect(screen.getByText("Salut !")).toBeInTheDocument();
    expect(screen.getByText("Madame, Monsieur,")).toBeInTheDocument();
  });

  it("MODEL_EXAMPLE_REF no revienta (sin integración todavía, retorna null)", () => {
    const { container } = render(
      <UnitContentBlockRenderer block={{ order: 1, type: "MODEL_EXAMPLE_REF", data: {} }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("un type desconocido no revienta (retorna null)", () => {
    const { container } = render(
      <UnitContentBlockRenderer block={{ order: 1, type: "SOMETHING_ELSE", data: {} }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("data malformado para un type conocido no revienta (retorna null)", () => {
    const { container } = render(
      <UnitContentBlockRenderer
        block={{ order: 1, type: "RICH_TEXT", data: { wrongField: "x" } }}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
