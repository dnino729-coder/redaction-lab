// ModelExampleCard es presentacional puro (Blueprint §11.2, resolución
// AFR4-03) — se testea sin MSW ni QueryClient, sin mockear ningún hook de
// datos (no invoca ninguno).
import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithIntl } from "../../../fixtures/renderWithIntl";
import { ModelExampleCard } from "@/features/academy/components/model-library";
import type { ModelExampleHttp } from "@/features/academy/types";

const baseExample: ModelExampleHttp = {
  modelExampleId: "model-example-1",
  textType: "ESSAY",
  content: "Contenido completo del ejemplo modelo.",
  rating: "EXCELLENT",
  curatorialComment: "Comentario curatorial de ejemplo.",
  status: "ACTIVE",
};

describe("ModelExampleCard", () => {
  it("muestra el comentario curatorial y la etiqueta de rating EXCELLENT", () => {
    renderWithIntl(<ModelExampleCard example={baseExample} />);

    expect(screen.getByText("Comentario curatorial de ejemplo.")).toBeInTheDocument();
    expect(screen.getByText("Exemple excellent")).toBeInTheDocument();
  });

  it("muestra la etiqueta de rating HAS_ERRORS cuando corresponde", () => {
    renderWithIntl(<ModelExampleCard example={{ ...baseExample, rating: "HAS_ERRORS" }} />);

    expect(screen.getByText("Contient des erreurs")).toBeInTheDocument();
    expect(screen.queryByText("Exemple excellent")).not.toBeInTheDocument();
  });

  it("AFR028-02: el badge HAS_ERRORS usa warning-800 (6.37:1 sobre warning-100), no warning-700 (4.51:1, AA al límite)", () => {
    renderWithIntl(<ModelExampleCard example={{ ...baseExample, rating: "HAS_ERRORS" }} />);

    const badge = screen.getByText("Contient des erreurs");
    expect(badge).toHaveClass("text-warning-800");
    expect(badge).not.toHaveClass("text-warning-700");
  });

  it("el contenido completo está colapsado por defecto y se expone al expandir <summary> (accesible por teclado)", () => {
    renderWithIntl(<ModelExampleCard example={baseExample} />);

    const content = screen.getByText("Contenido completo del ejemplo modelo.");
    expect(content).not.toBeVisible();

    fireEvent.click(screen.getByText("Voir l'exemple complet"));

    expect(content).toBeVisible();
  });

  it("P-14: no muestra acciones cuando onEdit/onRetire no se pasan (uso de P-06/P-11, sin cambios)", () => {
    renderWithIntl(<ModelExampleCard example={baseExample} />);

    expect(screen.queryByRole("button", { name: "Modifier" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Retirer" })).not.toBeInTheDocument();
  });

  it("P-14: invoca onEdit con el ejemplo al presionar 'Modifier'", () => {
    const onEdit = vi.fn();
    renderWithIntl(<ModelExampleCard example={baseExample} onEdit={onEdit} />);

    fireEvent.click(screen.getByRole("button", { name: "Modifier" }));

    expect(onEdit).toHaveBeenCalledWith(baseExample);
  });

  it("P-14: invoca onRetire con el ejemplo al presionar 'Retirer'", () => {
    const onRetire = vi.fn();
    renderWithIntl(<ModelExampleCard example={baseExample} onRetire={onRetire} />);

    fireEvent.click(screen.getByRole("button", { name: "Retirer" }));

    expect(onRetire).toHaveBeenCalledWith(baseExample);
  });

  it("criterio de aceptación C (P-14): oculta el botón 'Retirer' cuando el ejemplo ya está RETIRED", () => {
    renderWithIntl(<ModelExampleCard example={{ ...baseExample, status: "RETIRED" }} onEdit={vi.fn()} onRetire={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Modifier" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Retirer" })).not.toBeInTheDocument();
  });
});
