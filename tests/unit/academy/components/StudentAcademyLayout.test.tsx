// StudentAcademyLayout es presentacional puro (sin hooks de datos, Blueprint
// §10) — se testea sin MSW ni QueryClient, solo con el fixture de i18n ya
// existente (`renderWithIntl`).
//
// AFR-010 (fix de AFR009-01): se añade la verificación de que el título
// "Academia" es un heading real (`<h1>`), único, con el nombre accesible
// traducido — antes solo se comprobaba el link, lo que permitía que la
// regresión de accesibilidad pasara desapercibida (AFR-009, sección 7).
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "../../../fixtures/renderWithIntl";
import { StudentAcademyLayout } from "@/features/academy/components/layouts";

describe("StudentAcademyLayout", () => {
  it("renderiza un único h1 con el título de Academia, el link a Biblioteca de Modelos y los children", () => {
    renderWithIntl(
      <StudentAcademyLayout>
        <p>Contenido de la pantalla</p>
      </StudentAcademyLayout>,
    );

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveAccessibleName("Académie");

    expect(screen.getByRole("link", { name: "Académie" })).toHaveAttribute("href", "/academy");
    expect(screen.getByRole("link", { name: "Bibliothèque de modèles" })).toHaveAttribute(
      "href",
      "/academy/model-examples",
    );
    // Sprint 2: link de regreso al Dashboard (nav.dashboard, ya existente).
    expect(screen.getByRole("link", { name: "Tableau de bord" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByText("Contenido de la pantalla")).toBeInTheDocument();
  });
});
